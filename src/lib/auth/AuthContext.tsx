"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser, useSignIn, useSignUp, useClerk } from "@clerk/nextjs";
import { UserRole, UserProfile, MOCK_ROLE_USERS } from "./rbac";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  dsDivisionId?: string;
}

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "civicpulse_auth";
const ROLE_KEY = "civicpulse_role";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();
  const { signOut } = useClerk();

  const isSignInLoaded = signInFetchStatus === "idle";
  const isSignUpLoaded = signUpFetchStatus === "idle";

  const [currentRole, setCurrentRole] = useState<UserRole>("CITIZEN");
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_ROLE_USERS.CITIZEN);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: sync the Clerk session with our PostgreSQL user record
  const syncWithDb = useCallback(async (role?: UserRole) => {
    const res = await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: role ? JSON.stringify({ role }) : undefined,
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.success && data.user) {
      return data.user as UserProfile;
    }
    return null;
  }, []);

  // Restore fallback roles or sync DB user profile when Clerk state loads
  useEffect(() => {
    async function syncSession() {
      if (!isUserLoaded) return;

      if (isSignedIn && user) {
        try {
          const savedRole = localStorage.getItem(ROLE_KEY) as UserRole | null;

          const dbUser = await syncWithDb();

          if (dbUser) {
            // If we have a local dev testing role override, respect it, otherwise use DB role
            const activeRole = savedRole || dbUser.role;

            setCurrentRole(activeRole);
            setCurrentUser({
              ...dbUser,
              role: activeRole,
            });
            setIsAuthenticated(true);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dbUser));
            if (!savedRole) {
              localStorage.setItem(ROLE_KEY, dbUser.role);
            }
          }
        } catch (err) {
          console.error("Failed to sync auth session with DB:", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Not signed in under Clerk: clear context
        setIsAuthenticated(false);
        setCurrentUser(MOCK_ROLE_USERS.CITIZEN);
        setCurrentRole("CITIZEN");
        setIsLoading(false);
      }
    }

    syncSession();
  }, [isUserLoaded, isSignedIn, user, syncWithDb]);

  const switchRole = useCallback(
    (role: UserRole) => {
      setCurrentRole(role);
      localStorage.setItem(ROLE_KEY, role);

      if (isAuthenticated) {
        setCurrentUser((prev) => {
          const updated = { ...prev, role };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      } else {
        setCurrentUser(MOCK_ROLE_USERS[role] || MOCK_ROLE_USERS.CITIZEN);
      }
    },
    [isAuthenticated]
  );

  const login = useCallback(
    async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
      if (!isSignInLoaded) {
        return { success: false, error: "Authentication system is initializing. Please try again." };
      }

      try {
        const { error } = await signIn.password({
          emailAddress: data.email,
          password: data.password,
        });

        if (error) {
          const errorMessage = error.message || "Login failed. Please check your credentials.";
          return { success: false, error: errorMessage };
        }

        if (signIn.status === "complete") {
          await signIn.finalize({ navigate: async () => {} });

          const dbUser = await syncWithDb();

          if (dbUser) {
            setCurrentUser(dbUser);
            setCurrentRole(dbUser.role);
            setIsAuthenticated(true);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dbUser));
            localStorage.setItem(ROLE_KEY, dbUser.role);
          }

          return { success: true };
        } else {
          return { success: false, error: `Login status: ${signIn.status}` };
        }
      } catch (error: any) {
        console.error("Login error:", error);
        const errorMessage = error?.errors?.[0]?.message || error?.message || "Login failed. Please check your credentials.";
        return { success: false, error: errorMessage };
      }
    },
    [isSignInLoaded, signIn, syncWithDb]
  );

  const register = useCallback(
    async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
      if (!isSignUpLoaded) {
        return { success: false, error: "Authentication system is initializing. Please try again." };
      }

      try {
        const nameParts = data.name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const { error } = await signUp.password({
          emailAddress: data.email,
          password: data.password,
          firstName,
          lastName,
        });

        if (error) {
          const errorMessage = error.message || "Registration failed. Please try again.";
          return { success: false, error: errorMessage };
        }

        if (signUp.status === "complete") {
          await signUp.finalize({ navigate: async () => {} });

          const dbUser = await syncWithDb(data.role || "CITIZEN");

          if (dbUser) {
            setCurrentUser(dbUser);
            setCurrentRole(dbUser.role);
            setIsAuthenticated(true);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dbUser));
            localStorage.setItem(ROLE_KEY, dbUser.role);
          }

          return { success: true };
        } else if (signUp.status === "missing_requirements") {
          return {
            success: false,
            error:
              "Email verification is required by Clerk. Please configure Clerk to disable verification for testing, or use email/password matching credentials.",
          };
        } else {
          return { success: false, error: `Signup status: ${signUp.status}` };
        }
      } catch (error: any) {
        console.error("Register error:", error);
        const errorMessage = error?.errors?.[0]?.message || error?.message || "Registration failed. Please try again.";
        return { success: false, error: errorMessage };
      }
    },
    [isSignUpLoaded, signUp, syncWithDb]
  );

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(MOCK_ROLE_USERS.CITIZEN);
      setCurrentRole("CITIZEN");
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ROLE_KEY);
      router.push("/login");
    }
  }, [signOut, router]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}