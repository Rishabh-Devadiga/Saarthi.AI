/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  UNAUTHORIZED_EVENT,
  getStoredAuthToken,
  setStoredAuthToken,
} from "@/api/apiClient";
import { getCurrentUser, signIn, signOut, signUp } from "@/api/authApi";
import type { AuthUser, SignInRequest, SignUpRequest } from "@/types/auth";
import { setActiveRoadmap } from "@/utils/activeRoadmap";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (payload: SignUpRequest) => Promise<void>;
  signIn: (payload: SignInRequest) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(() => getStoredAuthToken() !== null);
  const [error, setError] = useState<string | null>(null);

  const clearLocalSession = useCallback(() => {
    setStoredAuthToken(null);
    setUser(null);
    setActiveRoadmap(null);
    try {
      sessionStorage.removeItem("ai-learning-agent-session");
    } catch {
      // Storage may be unavailable; the reload below still clears memory.
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const token = getStoredAuthToken();
    if (!token) {
      return;
    }
    getCurrentUser()
      .then((response) => {
        if (isMounted) {
          setUser(response.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          clearLocalSession();
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [clearLocalSession]);

  useEffect(() => {
    const handleUnauthorized = () => {
      // Clear state only; each surface handles expired sessions itself
      // (form errors stay visible, pages redirect or fall back as needed).
      clearLocalSession();
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [clearLocalSession]);

  const handleSignUp = useCallback(async (payload: SignUpRequest) => {
    setError(null);
    try {
      const response = await signUp(payload);
      setStoredAuthToken(response.data.token);
      setUser(response.data.user);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Sign up failed.";
      setError(message);
      throw requestError;
    }
  }, []);

  const handleSignIn = useCallback(async (payload: SignInRequest) => {
    setError(null);
    try {
      const response = await signIn(payload);
      setStoredAuthToken(response.data.token);
      setUser(response.data.user);
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Sign in failed.";
      setError(message);
      throw requestError;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch {
      // The local session is cleared regardless so a dead token never sticks.
    } finally {
      clearLocalSession();
      window.location.assign("/");
    }
  }, [clearLocalSession]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      error,
      signUp: handleSignUp,
      signIn: handleSignIn,
      signOut: handleSignOut,
      clearError,
    }),
    [user, isLoading, error, handleSignUp, handleSignIn, handleSignOut, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
