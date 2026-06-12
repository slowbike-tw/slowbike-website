"use client";

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
  AUTH_STORAGE_KEY,
  getAuthUser,
  refreshAuthSession,
  requestEmailOtp,
  sessionFromUrlHash,
  signOutAuth,
  updateAuthUser,
  verifyEmailOtp,
  type AuthSession,
  type AuthUser,
} from "@/lib/supabase-auth";

type MemberAuthContextValue = {
  user: AuthUser | null;
  session: AuthSession | null;
  ready: boolean;
  sendEmailOtp: (
    email: string,
    profile: { displayName: string; phone: string },
  ) => Promise<void>;
  confirmEmailOtp: (email: string, token: string) => Promise<void>;
  updateProfile: (profile: {
    displayName?: string;
    phone?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const MemberAuthContext = createContext<MemberAuthContextValue | null>(null);

function saveSession(session: AuthSession | null) {
  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const hashSession = sessionFromUrlHash(window.location.hash);
        if (hashSession) {
          const authUser = await getAuthUser(hashSession.access_token);
          const nextSession: AuthSession = { ...hashSession, user: authUser };
          saveSession(nextSession);
          window.history.replaceState(null, "", window.location.pathname);
          if (active) {
            setSession(nextSession);
            setUser(authUser);
          }
          return;
        }

        const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (!stored) return;

        let current = JSON.parse(stored) as AuthSession;
        const expiresSoon =
          !current.expires_at || current.expires_at * 1000 < Date.now() + 60_000;

        if (expiresSoon && current.refresh_token) {
          current = await refreshAuthSession(current.refresh_token);
        } else {
          current = {
            ...current,
            user: await getAuthUser(current.access_token),
          };
        }

        saveSession(current);
        if (active) {
          setSession(current);
          setUser(current.user);
        }
      } catch {
        saveSession(null);
      } finally {
        if (active) setReady(true);
      }
    }

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const sendEmailOtp = useCallback(
    async (
      email: string,
      profile: { displayName: string; phone: string },
    ) => {
      await requestEmailOtp(email, profile);
    },
    [],
  );

  const confirmEmailOtp = useCallback(async (email: string, token: string) => {
    const nextSession = await verifyEmailOtp(email, token);
    saveSession(nextSession);
    setSession(nextSession);
    setUser(nextSession.user);
  }, []);

  const updateProfile = useCallback(
    async ({
      displayName,
      phone,
    }: {
      displayName?: string;
      phone?: string;
    }) => {
      if (!session) return;
      const authUser = await updateAuthUser(session.access_token, {
        display_name: displayName,
        phone,
      });
      const nextSession = { ...session, user: authUser };
      saveSession(nextSession);
      setSession(nextSession);
      setUser(authUser);
    },
    [session],
  );

  const signOut = useCallback(async () => {
    if (session) {
      try {
        await signOutAuth(session.access_token);
      } catch {
        // Local sign-out still completes if the remote session already expired.
      }
    }
    saveSession(null);
    setSession(null);
    setUser(null);
  }, [session]);

  const value = useMemo(
    () => ({
      user,
      session,
      ready,
      sendEmailOtp,
      confirmEmailOtp,
      updateProfile,
      signOut,
    }),
    [
      user,
      session,
      ready,
      sendEmailOtp,
      confirmEmailOtp,
      updateProfile,
      signOut,
    ],
  );

  return (
    <MemberAuthContext.Provider value={value}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const context = useContext(MemberAuthContext);
  if (!context) {
    throw new Error("useMemberAuth must be used inside MemberAuthProvider");
  }
  return context;
}
