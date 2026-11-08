import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CareSession, SessionUpdatePayload } from "../types/session.ts";
import { authService, AuthUser } from "../services/authService.ts";
import { sessionService } from "../services/sessionService.ts";

interface SessionContextValue {
  sessionId: string;
  session: CareSession | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  selectedCategories: string[];
  selectedConcerns: string[];
  selectedGoals: string[];
  userName: string;
  onboardingCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateSession: (updates: SessionUpdatePayload) => Promise<void>;
  resetDemo: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SESSION_KEY = "careguide_session_id";
const SESSION_DATA_KEY = "careguide_session_data";
const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function createSessionId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `cg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState("");
  const [session, setSession] = useState<CareSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const acceptAuth = useCallback((result: { user: AuthUser; session: CareSession }) => {
    setUser(result.user);
    setSession(result.session);
    setSessionId(result.session.sessionId);
    localStorage.setItem(SESSION_KEY, result.session.sessionId);
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(result.session));
    setError(null);
  }, []);

  useEffect(() => {
    let active = true;
    authService.current()
      .then((result) => {
        if (active) acceptAuth(result);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setSession(null);
        setSessionId("");
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_DATA_KEY);
      })
      .finally(() => {
        if (active) {
          setIsAuthLoading(false);
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [acceptAuth]);

  const register = async (input: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      acceptAuth(await authService.register(input));
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (input: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      acceptAuth(await authService.login(input));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setSession(null);
    setSessionId("");
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_DATA_KEY);
  };

  const loadSession = useCallback(async (sid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sessionService.getSession(sid);
      setSession(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load account data";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSession = async (updates: SessionUpdatePayload) => {
    try {
      const updated = await sessionService.updateSession(sessionId, updates);
      setSession(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update account data";
      setError(msg);
      throw err;
    }
  };

  const resetDemo = async () => {
    setIsLoading(true);
    try {
      await sessionService.deleteSession(sessionId);
      const newSid = createSessionId();
      const fresh = await sessionService.createSession(newSid, {
        name: user?.name || "Care Member",
        onboardingCompleted: false,
        selectedCategories: [],
        concerns: [],
        goals: [],
      });
      setSessionId(newSid);
      localStorage.setItem(SESSION_KEY, newSid);
      setSession(fresh);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset account data";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    if (sessionId) await loadSession(sessionId);
  };

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        session,
        user,
        isAuthenticated: Boolean(user),
        isAuthLoading,
        selectedCategories: session?.selectedCategories || [],
        selectedConcerns: session?.concerns || [],
        selectedGoals: session?.goals || [],
        userName: session?.name || user?.name || "Care Member",
        onboardingCompleted: Boolean(session?.onboardingCompleted),
        isLoading,
        error,
        register,
        login,
        logout,
        updateSession,
        resetDemo,
        refreshSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
