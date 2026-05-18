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

interface Perfil {

  tipo:
    | "admin"
    | "visitante"
    | null;

  role?: string;

  nome?: string;

  avatar_url?: string;

}

interface AuthContextType {

  user: User | null;

  session: Session | null;

  perfil: Perfil | null;

  loading: boolean;

  logout: () => Promise<void>;

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

  const [perfil, setPerfil] =
    useState<Perfil | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function loadPerfil(
    currentUser: User | null,
  ) {

    if (!currentUser) {

      setPerfil(null);

      return;

    }

    const email =
      currentUser.email;

    // ADMIN

    const {
      data: admin,
    } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .eq("ativo", true)
      .maybeSingle();

    if (admin) {

      setPerfil({
        tipo: "admin",
        role: admin.role,
        nome: admin.nome,
        avatar_url:
          admin.avatar_url,
      });

      return;

    }

    // VISITANTE

    const {
      data: visitante,
    } = await supabase
      .from("visitantes")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (visitante) {

      setPerfil({
        tipo: "visitante",
        role:
          visitante.role,
        nome:
          visitante.nome,
        avatar_url:
          visitante.avatar_url,
      });

      return;

    }

    setPerfil(null);

  }

  useEffect(() => {

    async function initialize() {

      setLoading(true);

      const {
        data,
      } =
        await supabase.auth.getSession();

      const currentSession =
        data.session;

      const currentUser =
        currentSession?.user ??
        null;

      setSession(
        currentSession,
      );

      setUser(currentUser);

      await loadPerfil(
        currentUser,
      );

      setLoading(false);

    }

    initialize();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          session,
        ) => {

          const currentUser =
            session?.user ??
            null;

          setSession(session);

          setUser(currentUser);

          await loadPerfil(
            currentUser,
          );

          setLoading(false);

        },
      );

    return () => {

      listener.subscription.unsubscribe();

    };

  }, []);

  async function logout() {

    await supabase.auth.signOut();

    window.location.href =
      "/";

  }

  return (

    <AuthContext.Provider
      value={{
        user,
        session,
        perfil,
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
      "useAuth precisa estar dentro do AuthProvider",
    );

  }

  return context;

}