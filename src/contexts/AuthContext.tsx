"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  Session,
  User,
} from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type UserRole =
  | "deus_admin"
  | "admin"
  | "visitante"
  | null;

interface AuthContextType {

  user: User | null;

  session: Session | null;

  loading: boolean;

  role: UserRole;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;

}

const AuthContext =
  createContext<AuthContextType | null>(
    null,
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

  const [role, setRole] =
    useState<UserRole>(null);

  async function loadUserData() {

    try {

      setLoading(true);

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      setSession(session);

      setUser(session?.user ?? null);

      if (!session?.user) {

        setRole(null);

        return;

      }

      // VERIFICA ADMIN

      const { data: admin } =
        await supabase
          .from("admins")
          .select("role")
          .eq(
            "auth_user_id",
            session.user.id,
          )
          .single();

      if (admin?.role) {

        setRole(admin.role);

        return;

      }

      // VISITANTE PADRÃO

      setRole("visitante");

    } catch (error) {

      console.log(
        "Erro auth:",
        error,
      );

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadUserData();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          session,
        ) => {

          setSession(session);

          setUser(
            session?.user ?? null,
          );

          await loadUserData();

        },
      );

    return () => {

      listener.subscription.unsubscribe();

    };

  }, []);

  async function logout() {

    await supabase.auth.signOut();

    setUser(null);

    setSession(null);

    setRole(null);

  }

  async function refreshUser() {

    await loadUserData();

  }

  return (

    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        logout,
        refreshUser,
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
      "useAuth precisa estar dentro do AuthProvider",
    );

  }

  return context;

}