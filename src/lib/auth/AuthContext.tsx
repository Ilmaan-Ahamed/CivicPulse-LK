"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser, useSignIn, useSignUp, useClerk } from "@clerk/nextjs";
import { UserRole, UserProfile, MOCK_ROLE_USERS } from "./rbac";
import { isSignupRole } from "@/lib/roles";
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

interface RegisterResult {
  success: boolean;
  error?: string;
  role?: UserRole;
  needsVerification?: boolean;
  email?: string;
}

type VerificationType = "email_code" | "totp" | "phone_code";

interface LoginResult {
  success: boolean;
  error?: string;
  role?: UserRole;
  /** True when Clerk needs a verification code before completing sign-in */
  needsVerification?: boolean;
  /** Which factor strategy is waiting for a code */
  verificationType?: VerificationType;
}

interface ClerkFactor {
  strategy: string;
  emailAddressId?: string;
  phoneNumberId?: string;
}

interface ClerkAuthResource {
  status?: string;
  createdSessionId?: string;
  supportedFirstFactors?: unknown;
  supportedSecondFactors?: unknown;
}

interface ClassicSignIn extends ClerkAuthResource {
  prepareFirstFactor?: (params: { strategy: "email_code"; emailAddressId: string }) => Promise<unknown>;
  prepareSecondFactor?: (params: { strategy: "phone_code"; phoneNumberId: string }) => Promise<unknown>;
  attemptFirstFactor?: (params: { strategy: "email_code"; code: string }) => Promise<ClerkAuthResource>;
  attemptSecondFactor?: (params: { strategy: "totp" | "phone_code"; code: string }) => Promise<ClerkAuthResource>;
}

interface ClassicSignUp {
  prepareEmailAddressVerification?: (params: { strategy: "email_code" }) => Promise<unknown>;
  attemptEmailAddressVerification?: (params: { code: string }) => Promise<ClerkAuthResource>;
}

interface ClassicClerkApi {
  client?: {
    signIn?: ClassicSignIn;
    signUp?: ClassicSignUp;
  };
  setActive?: (params: { session: string }) => Promise<unknown>;
}

type FutureSignUpExtensions = ClassicSignUp;

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<LoginResult>;
  verifySignIn: (code: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  // Verify and resend helpers for the sign-up email verification flow
  verifySignUp: (code: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  resendSignUpVerification: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "civicpulse_auth";
const ROLE_KEY = "civicpulse_role";
const PENDING_SIGNUP_ROLE_KEY = "civicpulse_pending_signup_role";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (!isRecord(error)) return fallback;

  const firstError = Array.isArray(error.errors) && isRecord(error.errors[0])
    ? error.errors[0]
    : undefined;
  const message = firstError?.longMessage ?? firstError?.message ?? error.longMessage ?? error.message;
  return typeof message === "string" ? message : fallback;
}

function getSupportedFactors(value: unknown): ClerkFactor[] {
  if (!Array.isArray(value)) return [];
  return value.filter((factor): factor is ClerkFactor =>
    isRecord(factor) && typeof factor.strategy === "string"
  );
}

function getClassicClerkApi(clerk: ReturnType<typeof useClerk>): ClassicClerkApi {
  return clerk as unknown as ClassicClerkApi;
}

function isUserRole(value: unknown): value is UserRole {
  return value === "CITIZEN" || value === "NGO_PARTNER" || value === "DS_OFFICER" || value === "ADMIN";
}

function isUserProfile(value: unknown): value is UserProfile {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    isUserRole(value.role) &&
    typeof value.trustScore === "number" &&
    typeof value.dsDivisionCode === "string" &&
    typeof value.dsDivisionName === "string" &&
    typeof value.preferredLanguage === "string";
}

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

      const payload: Record<string, string | undefined> = {
        clerkId: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
        firstName: user?.firstName || undefined,
        lastName: user?.lastName || undefined,
        imageUrl: user?.imageUrl,
      };
      if (role) payload.role = role;

      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) return null;
      const data: unknown = await res.json();
      if (isRecord(data) && data.success === true && isUserProfile(data.user)) {
        return data.user;
      }
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
          const dbUser = await syncWithDb();

          if (dbUser) {
            setCurrentRole(dbUser.role);
            setCurrentUser(dbUser);
            setIsAuthenticated(true);
            writeAuthValue(STORAGE_KEY, JSON.stringify(dbUser));
            writeAuthValue(ROLE_KEY, dbUser.role);
          } else {
            // Robust fallback if DB sync is temporarily slow or failing
            const metadataRole: unknown = user.unsafeMetadata?.role;
            const clerkRole = isUserRole(metadataRole) ? metadataRole : undefined;
            const savedRoleValue = readAuthValue(ROLE_KEY);
            const savedRole = isUserRole(savedRoleValue) ? savedRoleValue : undefined;
            const activeRole: UserRole = clerkRole || savedRole || "CITIZEN";
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
            writeAuthValue(ROLE_KEY, activeRole);
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
          return {
            success: false,
            error: getErrorMessage(createError, "Login failed. Please check your credentials."),
          };
        }

        if (signIn.status === "complete") {
          // finalize() sets the active session (replaces setActive in v7)
          const { error: finalizeError } = await signIn.finalize();
          if (finalizeError) {
            return { success: false, error: getErrorMessage(finalizeError, "Failed to establish session.") };
          }

          const dbUser = await syncWithDb();
          if (dbUser) {
            setCurrentUser(dbUser);
            setCurrentRole(dbUser.role);
            setIsAuthenticated(true);
            writeAuthValue(STORAGE_KEY, JSON.stringify(dbUser));
            writeAuthValue(ROLE_KEY, dbUser.role);
            setIsLoading(false);
            return { success: true, role: dbUser.role };
          }
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true };

        } else if (signIn.status === "needs_client_trust") {
          // Device not yet trusted — Clerk emails a verification code.
          // prepareFirstFactor lives on the classic SignInResource (clerk.client.signIn),
          // NOT on the v7 Future SignInFutureResource returned by useSignIn().
          const classicSignIn = getClassicClerkApi(clerk).client?.signIn;
          const futureSignIn = signIn as unknown as ClerkAuthResource | null;
          const factors = getSupportedFactors(classicSignIn?.supportedFirstFactors ?? futureSignIn?.supportedFirstFactors);
          const emailFactor = factors.find((factor) => factor.strategy === "email_code");
          if (emailFactor?.emailAddressId && classicSignIn?.prepareFirstFactor) {
            await classicSignIn.prepareFirstFactor({
              strategy: "email_code",
              emailAddressId: emailFactor.emailAddressId,
            });
          }
          return { success: false, needsVerification: true, verificationType: "email_code" };

        } else if (signIn.status === "needs_second_factor") {
          // MFA is enabled — use the classic resource for prepare (future resource lacks it).
          const classicSignIn = getClassicClerkApi(clerk).client?.signIn;
          const futureSignIn = signIn as unknown as ClerkAuthResource | null;
          const factors = getSupportedFactors(classicSignIn?.supportedSecondFactors ?? futureSignIn?.supportedSecondFactors);
          const totpFactor = factors.find((factor) => factor.strategy === "totp");
          const phoneFactor = factors.find((factor) => factor.strategy === "phone_code");

          if (totpFactor) {
            // TOTP: user opens their authenticator app — no prepare step needed
            return { success: false, needsVerification: true, verificationType: "totp" };
          } else if (phoneFactor?.phoneNumberId && classicSignIn?.prepareSecondFactor) {
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
      } catch (error: unknown) {
        console.error("Login error:", error);
        return { success: false, error: getErrorMessage(error, "Login failed. Please check your credentials.") };
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
    async (code: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
      // Classic SignInResource — has prepareFirstFactor / attemptFirstFactor etc.
      const classicSignIn = getClassicClerkApi(clerk).client?.signIn;

      if (!classicSignIn) {
        return { success: false, error: "No active sign-in session. Please start over." };
      }

      try {
        const currentStatus: string = classicSignIn.status ?? signIn?.status ?? "";
        let updatedResource: ClerkAuthResource | null = null;

        if (currentStatus === "needs_client_trust" || currentStatus === "needs_first_factor") {
          if (!classicSignIn.attemptFirstFactor) {
            return { success: false, error: "Email verification is unavailable. Please sign in again." };
          }
          updatedResource = await classicSignIn.attemptFirstFactor({
            strategy: "email_code",
            code,
          });
        } else if (currentStatus === "needs_second_factor") {
          if (!classicSignIn.attemptSecondFactor) {
            return { success: false, error: "Multi-factor verification is unavailable. Please sign in again." };
          }
          const isTotp = getSupportedFactors(classicSignIn.supportedSecondFactors)
            .some((factor) => factor.strategy === "totp");
          const strategy = isTotp ? "totp" : "phone_code";
          updatedResource = await classicSignIn.attemptSecondFactor({ strategy, code });
        } else {
          return { success: false, error: "No pending verification step. Please sign in again." };
        }

        // Classic resource methods throw on error rather than returning { error }.
        // If we reach here without an exception, check the updated status.
        if (updatedResource?.status === "complete") {
          // Establish the Clerk session via setActive (classic API — works in v6 & v7)
          const setActive = getClassicClerkApi(clerk).setActive;
          if (!updatedResource.createdSessionId || !setActive) {
            return { success: false, error: "Unable to establish the verified session." };
          }
          await setActive({ session: updatedResource.createdSessionId });

          const dbUser = await syncWithDb();
          if (dbUser) {
            setCurrentUser(dbUser);
            setCurrentRole(dbUser.role);
            setIsAuthenticated(true);
            writeAuthValue(STORAGE_KEY, JSON.stringify(dbUser));
            writeAuthValue(ROLE_KEY, dbUser.role);
            setIsLoading(false);
            return { success: true, role: dbUser.role };
          }
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true };
        }

        return {
          success: false,
          error: `Unexpected sign-in state after verification: ${updatedResource?.status ?? "unknown"}`,
        };
      } catch (error: unknown) {
        console.error("Verify sign-in error:", error);
        return { success: false, error: getErrorMessage(error, "Verification failed. Please try again.") };
      }
    },
    [clerk, signIn, syncWithDb]
  );

  const register = useCallback(
    async (data: RegisterData): Promise<RegisterResult> => {
      if (!signUp || signUpFetchStatus === "fetching") {
        return { success: false, error: "Authentication system is initializing. Please try again." };
      }

      try {
        if (!isSignupRole(data.role)) {
          return { success: false, error: "Please select a role." };
        }

        const nameParts = data.name.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        const selectedRole = data.role;

        // Clerk v7 Future API: create() returns { error }; status is on signUp resource
        const { error: createError } = await signUp.create({
          emailAddress: data.email,
          password: data.password,
          firstName,
          lastName,
          unsafeMetadata: { role: selectedRole },
        });

        if (createError) {
          return {
            success: false,
            error: getErrorMessage(createError, "Registration failed. Please try again."),
          };
        }

        // If signUp is complete immediately, finalize and create DB user
        if (signUp.status === "complete") {
          const { error: finalizeError } = await signUp.finalize();
          if (finalizeError) {
            return { success: false, error: getErrorMessage(finalizeError, "Failed to establish session.") };
          }

          const dbUser = await syncWithDb(selectedRole);
          if (dbUser) {
            setCurrentUser(dbUser);
            setCurrentRole(dbUser.role);
            setIsAuthenticated(true);
            writeAuthValue(STORAGE_KEY, JSON.stringify(dbUser));
            writeAuthValue(ROLE_KEY, dbUser.role);
            removeAuthValue(PENDING_SIGNUP_ROLE_KEY);
            setIsLoading(false);
            return { success: true, role: dbUser.role };
          }
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true, role: selectedRole };
        }

        // If Clerk signals missing_requirements, we need email verification before completing sign-up
        if (signUp.status === "missing_requirements") {
          try {
            // Persist selected role and pending email so we can complete DB sync after verification
            writeAuthValue(ROLE_KEY, selectedRole);
            writeAuthValue(PENDING_SIGNUP_ROLE_KEY, selectedRole);
            writeAuthValue("civicpulse_pending_signup_email", data.email);

            // Try to send verification email using the future signUp resource if available
            const futureSignUp = signUp as unknown as FutureSignUpExtensions;
            if (futureSignUp.prepareEmailAddressVerification) {
              try {
                await futureSignUp.prepareEmailAddressVerification({ strategy: "email_code" });
              } catch {
                // ignore — we'll fallback to classic client below
              }
            }

            // Fallback: use classic client signUp resource if available
            const classicSignUp = getClassicClerkApi(clerk).client?.signUp;
            if (classicSignUp?.prepareEmailAddressVerification) {
              try {
                await classicSignUp.prepareEmailAddressVerification({ strategy: "email_code" });
              } catch {
                // ignore
              }
            }
          } catch {
            // best-effort — do not fail the whole flow
            console.warn("prepareEmailAddressVerification failed");
          }

          // Return a signal to the UI to show a verification screen (don't treat as fatal error)
          return { success: false, needsVerification: true, email: data.email };
        }

        return {
          success: false,
          error: `Sign-up requires additional steps (status: ${signUp.status}).`,
        };
      } catch (error: unknown) {
        console.error("Register error:", error);
        return { success: false, error: getErrorMessage(error, "Registration failed. Please try again.") };
      }
    },
    [signUp, signUpFetchStatus, syncWithDb, clerk]
  );

  // Resend a sign-up verification email (tries future resource then classic client)
  const resendSignUpVerification = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const futureSignUp = signUp as unknown as FutureSignUpExtensions | null;
      if (futureSignUp?.prepareEmailAddressVerification) {
        await futureSignUp.prepareEmailAddressVerification({ strategy: "email_code" });
        return { success: true };
      }

      const classicSignUp = getClassicClerkApi(clerk).client?.signUp;
      if (classicSignUp && classicSignUp.prepareEmailAddressVerification) {
        await classicSignUp.prepareEmailAddressVerification({ strategy: "email_code" });
        return { success: true };
      }

      return { success: false, error: "Unable to send verification email. Please try again." };
    } catch (error: unknown) {
      console.error("Resend sign-up verification error:", error);
      return { success: false, error: getErrorMessage(error, "Failed to resend verification email.") };
    }
  }, [signUp, clerk]);

  // Attempt to verify the sign-up email with code and finalize the sign-up
  const verifySignUp = useCallback(async (code: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    // Try future resource first, then classic client
    try {
      let updatedResource: ClerkAuthResource | null = null;
      const futureSignUp = signUp as unknown as FutureSignUpExtensions | null;

      if (futureSignUp?.attemptEmailAddressVerification) {
        updatedResource = await futureSignUp.attemptEmailAddressVerification({ code });
      } else {
        const classicSignUp = getClassicClerkApi(clerk).client?.signUp;
        if (!classicSignUp?.attemptEmailAddressVerification) {
          return { success: false, error: "No active sign-up session. Please start over." };
        }
        updatedResource = await classicSignUp.attemptEmailAddressVerification({ code });
      }

      if (updatedResource?.status === "complete") {
        // Establish the Clerk session — classic & future setActive compatible
        const setActive = getClassicClerkApi(clerk).setActive;
        if (!updatedResource.createdSessionId || !setActive) {
          return { success: false, error: "Unable to establish the verified session." };
        }
        await setActive({ session: updatedResource.createdSessionId });

        const pendingRole = readAuthValue(PENDING_SIGNUP_ROLE_KEY) as UserRole | null;
        const savedRole = (readAuthValue(ROLE_KEY) as UserRole | null) || undefined;
        const roleToSync = isSignupRole(pendingRole) ? pendingRole : isSignupRole(savedRole) ? savedRole : undefined;
        const dbUser = await syncWithDb(roleToSync);
        if (dbUser) {
          setCurrentUser(dbUser);
          setCurrentRole(dbUser.role);
          setIsAuthenticated(true);
          writeAuthValue(STORAGE_KEY, JSON.stringify(dbUser));
          writeAuthValue(ROLE_KEY, dbUser.role);
          removeAuthValue("civicpulse_pending_signup_email");
          removeAuthValue(PENDING_SIGNUP_ROLE_KEY);
          setIsLoading(false);
          return { success: true, role: dbUser.role };
        }

        setIsAuthenticated(true);
        removeAuthValue("civicpulse_pending_signup_email");
        removeAuthValue(PENDING_SIGNUP_ROLE_KEY);
        setIsLoading(false);
        return { success: true, role: roleToSync };
      }

      return { success: false, error: `Unexpected sign-up state after verification: ${updatedResource?.status ?? "unknown"}` };
    } catch (error: unknown) {
      console.error("Verify sign-up error:", error);
      return { success: false, error: getErrorMessage(error, "Verification failed. Please try again.") };
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
      removeAuthValue(PENDING_SIGNUP_ROLE_KEY);
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