"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  const [currentRole, setCurrentRole] = useState<UserRole>("CITIZEN");
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_ROLE_USERS.CITIZEN);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        setCurrentUser(parsed);
        setCurrentRole(parsed.role);
        setIsAuthenticated(true);
      } else {
        // Check for legacy role-only storage
        const savedRole = localStorage.getItem(ROLE_KEY) as UserRole;
        if (savedRole && MOCK_ROLE_USERS[savedRole]) {
          setCurrentRole(savedRole);
          setCurrentUser(MOCK_ROLE_USERS[savedRole]);
        }
      }
    } catch {
      // Ignore parse errors
    }
    setIsLoading(false);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem(ROLE_KEY, role);

    // If authenticated, update the user's displayed role
    if (isAuthenticated) {
      setCurrentUser((prev) => {
        const updated = { ...prev, role };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } else {
      setCurrentUser(MOCK_ROLE_USERS[role] || MOCK_ROLE_USERS.CITIZEN);
    }
  }, [isAuthenticated]);

  const login = useCallback(async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "Login failed" };
      }

      const userProfile: UserProfile = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role as UserRole,
        trustScore: result.user.trustScore,
        organization: result.user.organization,
        dsDivisionCode: result.user.dsDivisionCode,
        dsDivisionName: result.user.dsDivisionName,
        preferredLanguage: result.user.preferredLanguage,
      };

      setCurrentUser(userProfile);
      setCurrentRole(userProfile.role);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
      localStorage.setItem(ROLE_KEY, userProfile.role);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "Registration failed" };
      }

      const userProfile: UserProfile = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role as UserRole,
        trustScore: result.user.trustScore,
        organization: result.user.organization,
        dsDivisionCode: result.user.dsDivisionCode,
        dsDivisionName: result.user.dsDivisionName,
        preferredLanguage: result.user.preferredLanguage,
      };

      setCurrentUser(userProfile);
      setCurrentRole(userProfile.role);
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
      localStorage.setItem(ROLE_KEY, userProfile.role);

      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(MOCK_ROLE_USERS.CITIZEN);
    setCurrentRole("CITIZEN");
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ROLE_KEY);
    router.push("/login");
  }, [router]);

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
