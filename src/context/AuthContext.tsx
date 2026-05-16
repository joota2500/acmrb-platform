"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  User,
  Session,
} from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

interface AuthContextType {

  user: User | null;

  session: Session | null;

  loading: boolean;

  logout: () => Promise<void>;

}

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] =
    useState<User | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function getSession() {

      const {
        data,
      } = await supabase.auth.getSession();

      setSession(data.session);

      setUser(data.session?.user ?? null);

      setLoading(false);

    }

    getSession();

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        setSession(session);

        setUser(session?.user ?? null);

      }
    );

    return () => {

      listener.subscription.unsubscribe();

    };

  }, []);

  async function logout() {

    await supabase.auth.signOut();

  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth precisa estar dentro do AuthProvider"
    );

  }

  return context;
}