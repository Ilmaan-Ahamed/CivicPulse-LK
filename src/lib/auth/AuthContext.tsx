"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser, useSignIn, useSignUp, useClerk } from "@clerk/nextjs";
import { UserRole, UserProfile, MOCK_ROLE_USERS } from "./rbac";
import { readAuthValue, removeAuthValue, writeAuthValue } from "./storage";

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

type VerificationType = "email_code" | "totp" | "phone_code";

interface LoginResult {
  success: boolean;
  error?: string;
  /** True when Clerk needs a verification code before completing sign-in */
  needsVerification?: boolean;
  /** Which factor strategy is waiting for a code */
  verificationType?: VerificationType;
}

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<LoginResult>;
  verifySignIn: (code: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string } | any>;
  // Verify and resend helpers for the sign-up email verification flow
  verifySignUp: (code: string) => Promise<{ success: boolean; error?: string }>;
  resendSignUpVerification: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "civicpulse_auth";
const ROLE_KEY = "civicpulse_role";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  // Clerk v7 Future API: useSignIn returns { fetchStatus, signIn, errors }
  const { fetchStatus: signInFetchStatus, signIn } = useSignIn();
  const { fetchStatus: signUpFetchStatus, signUp } = useSignUp();
  const clerk = useClerk();

  const [currentRole, setCurrentRole] = useState<UserRole>("CITIZEN");
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_ROLE_USERS.CITIZEN);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper: sync the Clerk session with our PostgreSQL user record
  const syncWithDb = useCallback(async (role?: UserRole) => {
    try {
      const token = await clerk.session?.getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const payload = {
        role,
        clerkId: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
        firstName: user?.firstName,
        lastName: user?.lastName,
        imageUrl: user?.imageUrl,
      };

      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) return null;
      const data = await res.json();
      if (data.success && data.user) return data.user as UserProfile;
    } catch {
      // DB sync is non-critical; silently ignore
    }
    return null;
  }, [clerk, user]);

  // Restore session when Clerk state loads
  useEffect(() => {
    async function syncSession() {
      if (!isUserLoaded) return;

      if (isSignedIn && user) {
        try {
          const savedRole = readAuthValue(ROLE_KEY) as UserRole | null;
          const dbUser = await syncWithDb(savedRole || undefined);

          if (dbUser) {
            const activeRole = savedRole || dbUser.role;
            setCurrentRole(activeRole);
            setCurrentUser({ ...dbUser, role: activeRole });
            setIsAuthenticated(true);
            writeAuthValue(STORAGE_KEY, JSON.stringify(dbUser));
            if (!savedRole) writeAuthValue(ROLE_KEY, dbUser.role);
          } else {
            // Robust fallback if DB sync is temporarily slow or failing
            const activeRole: UserRole = savedRole || "CITIZEN";
            const fallbackUser: UserProfile = {
              id: user.id,
              name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.primaryEmailAddress?.emailAddress || "Citizen",
              email: user.primaryEmailAddress?.emailAddress || "",
              role: activeRole,
              trustScore: 80.0,
              dsDivisionCode: "DS-COL-01",
              dsDivisionName: "Colombo DS Office",
              preferredLanguage: "en",
            };
            setCurrentRole(activeRole);
            setCurrentUser(fallbackUser);
            setIsAuthenticated(true);
            writeAuthValue(STORAGE_KEY, JSON.stringify(fallbackUser));
            if (!savedRole) writeAuthValue(ROLE_KEY, activeRole);
          }
        } catch (err) {
          console.error("Failed to sync auth session with DB:", err);
          setIsAuthenticated(true);
        } finally {
          setIsLoading(false);
        }
      } else {
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
      console.info("[AUTH ROLE SWITCH] requested", {
        role,
        authenticated: isAuthenticated,
        storageAvailable: typeof window !== "undefined",
      });
      setCurrentRole(role);
      writeAuthValue(ROLE_KEY, role);

      if (isAuthenticated) {
        setCurrentUser((prev) => {
          const updated = { ...prev, role };
          writeAuthValue(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      } else {
        setCurrentUser(MOCK_ROLE_USERS[role] || MOCK_ROLE_USERS.CITIZEN);
      }
      console.info("[AUTH ROLE SWITCH] applied", { role });
    },
    [isAuthenticated]
  );

  const login = useCallback(
    async (data: LoginData): Promise<LoginResult> => {
      if (!signIn || signInFetchStatus === "fetching") {
        return { success: false, error: "Authentication system is initializing. Please try again." };
      }

      try {
        // Clerk v7: create() returns { error }; final status lives on signIn resource
        const { error: createError } = await signIn.create({
          identifier: data.email,
          password: data.password,
        });

        if (createError) {
          const msg =
            (createError as any).longMessage ||
            (createError as any).message ||
            "Login failed. Please check your credentials.";
          return { success: false, error: msg };
        }

        if (signIn.status === "complete") {
          // finalize() sets the active session (replaces setActive in v7)
          const { error: finalizeError } = await signIn.finalize();
          if (finalizeError) {
            const msg = (finalizeError as any).message || "Failed to establish session.";
            return { success: false, error: msg };
          }

          const dbUser = await syncWithDb();
          if (dbUser) {
            setCurrentUser(dbUser);
            setCurrentRole(dbUser.role);
            setIsAuthenticated(true);
            writeAuthValue(STORAGE_KEY, JSON.stringify(dbUser));
            writeAuthValue(ROLE_KEY, dbUser.role);
          } else {
            setIsAuthenticated(true);
          }
          setIsLoading(false);
          return { success: true };

        } else if (signIn.status === "needs_client_trust") {
          // Device not yet trusted — Clerk emails a verification code.
          // prepareFirstFactor lives on the classic SignInResource (clerk.client.signIn),
          // NOT on the v7 Future SignInFutureResource returned by useSignIn().
          const classicSignIn = (clerk as any).client?.signIn;
          const factors = classicSignIn?.supportedFirstFactors ?? (signIn as any).supportedFirstFactors;
          const emailFactor = (factors as any[])?.find((f: any) => f.strategy === "email_code");
          if (emailFactor && classicSignIn?.prepareFirstFactor) {
            await classicSignIn.prepareFirstFactor({
              strategy: "email_code",
              emailAddressId: emailFactor.emailAddressId,
            });
          }
          return { success: false, needsVerification: true, verificationType: "email_code" };

        } else if (signIn.status === "needs_second_factor") {
          // MFA is enabled — use the classic resource for prepare (future resource lacks it).
          const classicSignIn = (clerk as any).client?.signIn;
          const factors = classicSignIn?.supportedSecondFactors ?? (signIn as any).supportedSecondFactors;
          const totpFactor   = (factors as any[])?.find((f: any) => f.strategy === "totp");
          const phoneFactor  = (factors as any[])?.find((f: any) => f.strategy === "phone_code");

          if (totpFactor) {
            // TOTP: user opens their authenticator app — no prepare step needed
            return { success: false, needsVerification: true, verificationType: "totp" };
          } else if (phoneFactor && classicSignIn?.prepareSecondFactor) {
            await classicSignIn.prepareSecondFactor({
              strategy: "phone_code",
              phoneNumberId: phoneFactor.phoneNumberId,
            });
            return { success: false, needsVerification: true, verificationType: "phone_code" };
          }
          return { success: false, error: "Multi-factor authentication required but no supported method found." };

        } else if (signIn.status === "needs_first_factor") {
          return {
            success: false,
            error: "Additional verification required. Please try again.",
          };
        } else {
          return {
            success: false,
            error: `Sign-in requires additional steps (status: ${signIn.status}).`,
          };
        }
      } catch (error: any) {
        console.error("Login error:", error);
        const errorMessage =
          error?.errors?.[0]?.longMessage ||
          error?.errors?.[0]?.message ||
          error?.message ||
          "Login failed. Please check your credentials.";
        return { success: false, error: errorMessage };
      }
    },
    [signIn, signInFetchStatus, syncWithDb, clerk]
  );

  /**
   * Submit the verification code after `login()` returns `needsVerification: true`.
   *
   * All prepare/attempt calls go through `clerk.client.signIn` (the classic
   * SignInResource) because the v7 Future `SignInFutureResource` from `useSignIn()`
   * does not expose those methods at runtime. After a successful attempt the
   * returned resource contains `createdSessionId`; we call `clerk.setActive` to
   * establish the session (works in both Clerk v6 and v7).
   */
  const verifySignIn = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string }> => {
      // Classic SignInResource — has prepareFirstFactor / attemptFirstFactor etc.
      const classicSignIn = (clerk as any).client?.signIn;

      if (!classicSignIn) {
        return { success: false, error: "No active sign-in session. Please start over." };
      }

      try {
        const currentStatus: string = classicSignIn.status ?? signIn?.status ?? "";
        let updatedResource: any = null;

        if (currentStatus === "needs_client_trust" || currentStatus === "needs_first_factor") {
          updatedResource = await classicSignIn.attemptFirstFactor({
            strategy: "email_code",
            code,
          });
        } else if (currentStatus === "needs_second_factor") {
          const isTotp = classicSignIn.supportedSecondFactors?.some(
            (f: any) => f.strategy === "totp"
          );
          const strategy = isTotp ? "totp" : "phone_code";
          updatedResource = await classicSignIn.attemptSecondFactor({ strategy, code });
        } else {
          return { success: false, error: "No pending verification step. Please sign in again." };
        }

        // Classic resource methods throw on error rather than returning { error }.
        // If we reach here without an exception, check the updated status.
        if (updatedResource?.status === "complete") {
          // Establish the Clerk session via setActive (classic API — works in v6 & v7)
          await (clerk as any).setActive({ session: updatedResource.createdSessionId });

          const dbUser = await syncWithDb();
          if (dbUser) {
            setCurrentUser(dbUser);
            setCurrentRole(dbUser.role);
            setIsAuthenticated(true);
            writeAuthValue(STORAGE_KEY, JSON.stringify(dbUser));
            writeAuthValue(ROLE_KEY, dbUser.role);
          } else {
            setIsAuthenticated(true);
          }
          setIsLoading(false);
          return { success: true };
        }

        return {
          success: false,
          error: `Unexpected sign-in state after verification: ${updatedResource?.status ?? "unknown"}`,
        };
      } catch (error: any) {
        console.error("Verify sign-in error:", error);
        const errorMessage =
          error?.errors?.[0]?.longMessage ||
          error?.errors?.[0]?.message ||
          error?.message ||
          "Verification failed. Please try again.";
        return { success: false, error: errorMessage };
      }
    },
    [clerk, signIn, syncWithDb]
  );

  const register = useCallback(
    async (data: RegisterData): Promise<{ success: boolean; error?: string } | any> => {
      if (!signUp || signUpFetchStatus === "fetching") {
        return { success: false, error: "Authentication system is initializing. Please try again." };
      }

      try {
        const nameParts = data.name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Clerk v7 Future API: create() returns { error }; status is on signUp resource
        const { error: createError } = await signUp.create({
          emailAddress: data.email,
          password: data.password,
          firstName,
          lastName,
        });

        if (createError) {
          const msg =
            (createError as any).longMessage ||
            (createError as any).message ||
            "Registration failed. Please try again.";
          return { success: false, error: msg };
        }

        // If signUp is complete immediately, finalize and create DB user
        if (signUp.status === "complete") {
          const { error: finalizeError } = await signUp.finalize();
          if (finalizeError) {
            const msg = (finalizeError as any).message || "Failed to establish session.";
            return { success: false, error: msg };
          }

          const dbUser = await syncWithDb(data.role || "CITIZEN");
          if (dbUser) {
            setCurrentUser(dbUser);
            setCurrentRole(dbUser.role);
            setIsAuthenticated(true);
            writeAuthValue(STORAGE_KEY, JSON.stringify(dbUser));
            writeAuthValue(ROLE_KEY, dbUser.role);
          } else {
            setIsAuthenticated(true);
          }
          setIsLoading(false);
          return { success: true };
        }

        // If Clerk signals missing_requirements, we need email verification before completing sign-up
        if (signUp.status === "missing_requirements") {
          try {
            // Persist selected role and pending email so we can complete DB sync after verification
            const roleToSave = data.role || "CITIZEN";
            writeAuthValue(ROLE_KEY, roleToSave);
            writeAuthValue("civicpulse_pending_signup_email", data.email);

            // Try to send verification email using the future signUp resource if available
            if ((signUp as any).prepareEmailAddressVerification) {
              try {
                await (signUp as any).prepareEmailAddressVerification({ strategy: "email_code" });
              } catch (e) {
                // ignore — we'll fallback to classic client below
              }
            }

            // Fallback: use classic client signUp resource if available
            const classicSignUp = (clerk as any).client?.signUp;
            if (classicSignUp?.prepareEmailAddressVerification) {
              try {
                await classicSignUp.prepareEmailAddressVerification({ strategy: "email_code" });
              } catch (e) {
                // ignore
              }
            }
          } catch (e) {
            // best-effort — do not fail the whole flow
            console.warn("prepareEmailAddressVerification failed", e);
          }

          // Return a signal to the UI to show a verification screen (don't treat as fatal error)
          return { success: false, needsVerification: true, email: data.email };
        }

        return {
          success: false,
          error: `Sign-up requires additional steps (status: ${signUp.status}).`,
        };
      } catch (error: any) {
        console.error("Register error:", error);
        const errorMessage =
          error?.errors?.[0]?.longMessage ||
          error?.errors?.[0]?.message ||
          error?.message ||
          "Registration failed. Please try again.";
        return { success: false, error: errorMessage };
      }
    },
    [signUp, signUpFetchStatus, syncWithDb, clerk]
  );

  // Resend a sign-up verification email (tries future resource then classic client)
  const resendSignUpVerification = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (signUp && (signUp as any).prepareEmailAddressVerification) {
        await (signUp as any).prepareEmailAddressVerification({ strategy: "email_code" });
        return { success: true };
      }

      const classicSignUp = (clerk as any).client?.signUp;
      if (classicSignUp && classicSignUp.prepareEmailAddressVerification) {
        await classicSignUp.prepareEmailAddressVerification({ strategy: "email_code" });
        return { success: true };
      }

      return { success: false, error: "Unable to send verification email. Please try again." };
    } catch (error: any) {
      console.error("Resend sign-up verification error:", error);
      const errorMessage = error?.message || "Failed to resend verification email.";
      return { success: false, error: errorMessage };
    }
  }, [signUp, clerk]);

  // Attempt to verify the sign-up email with code and finalize the sign-up
  const verifySignUp = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    // Try future resource first, then classic client
    try {
      let updatedResource: any = null;

      if (signUp && (signUp as any).attemptEmailAddressVerification) {
        updatedResource = await (signUp as any).attemptEmailAddressVerification({ code });
      } else {
        const classicSignUp = (clerk as any).client?.signUp;
        if (!classicSignUp) {
          return { success: false, error: "No active sign-up session. Please start over." };
        }
        updatedResource = await classicSignUp.attemptEmailAddressVerification({ code });
      }

      if (updatedResource?.status === "complete") {
        // Establish the Clerk session — classic & future setActive compatible
        await (clerk as any).setActive({ session: updatedResource.createdSessionId });

        // Use the saved role (stored at register time) to sync with DB
        const savedRole = (readAuthValue(ROLE_KEY) as UserRole) || undefined;
        const dbUser = await syncWithDb(savedRole as any);
        if (dbUser) {
          setCurrentUser(dbUser);
          setCurrentRole(dbUser.role);
          setIsAuthenticated(true);
          writeAuthValue(STORAGE_KEY, JSON.stringify(dbUser));
          writeAuthValue(ROLE_KEY, dbUser.role);
        } else {
          setIsAuthenticated(true);
        }

        // cleanup
        removeAuthValue("civicpulse_pending_signup_email");
        setIsLoading(false);
        return { success: true };
      }

      return { success: false, error: `Unexpected sign-up state after verification: ${updatedResource?.status ?? "unknown"}` };
    } catch (error: any) {
      console.error("Verify sign-up error:", error);
      const errorMessage =
        error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || error?.message || "Verification failed. Please try again.";
      return { success: false, error: errorMessage };
    }
  }, [signUp, clerk, syncWithDb]);


  const logout = useCallback(async () => {
    try {
      await clerk.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(MOCK_ROLE_USERS.CITIZEN);
      setCurrentRole("CITIZEN");
      removeAuthValue(STORAGE_KEY);
      removeAuthValue(ROLE_KEY);
      router.push("/login");
    }
  }, [clerk, router]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        isAuthenticated,
        isLoading,
        login,
        verifySignIn,
        register,
        // Added sign-up verification helpers
        verifySignUp,
        resendSignUpVerification,
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