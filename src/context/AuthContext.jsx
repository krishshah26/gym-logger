import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const sessionRef = useRef(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setLoading(false);
        return;
      }
      const nextSession = data.session ?? null;
      sessionRef.current = nextSession;
      setSession(nextSession);
      setIsGuest(false);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, nextSession) => {
        if (!active) return;

        const currentSession = sessionRef.current;
        const sameSession = currentSession?.access_token === nextSession?.access_token
          && currentSession?.user?.id === nextSession?.user?.id;

        if (sameSession && event !== "SIGNED_OUT") {
          setLoading(false);
          return;
        }

        sessionRef.current = nextSession ?? null;
        setSession(nextSession ?? null);
        setIsGuest(false);
        setLoading(false);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const startGuestMode = () => {
    setIsGuest(true);
    setSession(null);
    setLoading(false);
  };

  const signOut = async () => {
    if (isGuest) {
      setIsGuest(false);
      setLoading(false);
    } else if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ session, isGuest, loading, startGuestMode, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
