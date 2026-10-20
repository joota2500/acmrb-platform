"use client";

import { useEffect, useState } from "react";
import { ESPERA_EMAIL_SEG, urlRedefinir } from "@/lib/apiAdmin";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AdminModal({ open, onClose }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // "Esqueci minha senha": modo de recuperação + espera entre envios
  const [recuperar, setRecuperar] = useState(false);
  const [aviso, setAviso] = useState("");
  const [espera, setEspera] = useState(0);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function enviarRecuperacao() {
    const alvo = email.trim().toLowerCase();
    setError("");
    setAviso("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alvo)) {
      setError("Informe o e-mail administrativo.");
      return;
    }
    setEspera(ESPERA_EMAIL_SEG);
    const { error: erroEnvio } = await supabase.auth.resetPasswordForEmail(alvo, { redirectTo: urlRedefinir() });
    if (erroEnvio && /rate|limit/i.test(erroEnvio.message)) {
      setError("Muitos envios em pouco tempo. Aguarde alguns minutos.");
      return;
    }
    // Mensagem neutra: não revela se o e-mail existe
    setAviso("Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
  }

  async function handleLogin() {
    try {
      setLoading(true);
      setError("");

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (loginError || !data.user) {
        setError("Email ou senha inválidos.");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (!sessionUser) {
        setError("Sessão inválida.");
        return;
      }

      const { data: admin } = await supabase
        .from("admins")
        .select("*")
        .eq("auth_user_id", sessionUser.id)
        .eq("ativo", true)
        .maybeSingle();

      if (!admin) {
        await supabase.auth.signOut();
        setError("Acesso permitido apenas para administradores.");
        return;
      }

      // Atualizar último login
      await supabase
        .from("admins")
        .update({ ultimo_login: new Date().toISOString() })
        .eq("auth_user_id", sessionUser.id);

      onClose();
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-md flex items-center justify-center p-5">
      <div className="relative w-full max-w-md overflow-hidden rounded-[38px] bg-white shadow-2xl">
        {/* Header */}
        <div className="relative bg-linear-to-br from-[#111827] to-[#1F2937] px-8 pt-8 pb-20 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
          >
            <X size={18} />
          </button>

          <div className="w-20 h-20 rounded-[28px] bg-white text-[#111827] flex items-center justify-center shadow-2xl mx-auto">
            <ShieldCheck size={38} />
          </div>

          <h2 className="mt-7 text-4xl font-black tracking-tight text-center">
            Área Administrativa Privada
          </h2>
          <p className="mt-3 text-white/70 text-center">
            Acesso exclusivo para administradores da ACMRB
          </p>
        </div>

        {/* Form */}
        <div className="relative px-8 pb-8 -mt-10">
          <div className="rounded-4xl bg-white border border-black/5 shadow-xl p-8 space-y-6">
            {/* Email */}
            <div>
              <label className="text-sm font-bold text-zinc-700 block mb-2">
                Email administrativo
              </label>
              <div className="flex items-center gap-3 h-14 px-5 rounded-2xl border border-zinc-200 bg-zinc-50">
                <Mail size={18} className="text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-zinc-800"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password (oculto no modo "esqueci minha senha") */}
            <div hidden={recuperar}>
              <label className="text-sm font-bold text-zinc-700 block mb-2">
                Senha
              </label>
              <div className="flex items-center gap-3 h-14 px-5 rounded-2xl border border-zinc-200 bg-zinc-50">
                <Lock size={18} className="text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none text-zinc-800"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {aviso && (
              <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                {aviso}
              </p>
            )}

            {/* Button */}
            {recuperar ? (
              <button
                onClick={enviarRecuperacao}
                disabled={espera > 0}
                className="w-full h-14 rounded-3xl bg-linear-to-r from-[#2E5E4E] to-[#1E3A32] text-white font-black text-lg transition-all disabled:opacity-60 hover:brightness-105"
              >
                {espera > 0 ? `Aguarde ${espera}s para reenviar` : "Enviar link de redefinição"}
              </button>
            ) : (
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-14 rounded-3xl bg-linear-to-r from-[#2E5E4E] to-[#1E3A32] text-white font-black text-lg transition-all disabled:opacity-60 hover:brightness-105"
              >
                {loading ? "Entrando..." : "Entrar no Painel"}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setRecuperar((v) => !v);
                setError("");
                setAviso("");
              }}
              className="w-full text-sm font-semibold text-[#2E5E4E] hover:underline"
            >
              {recuperar ? "Voltar para o login" : "Esqueci minha senha"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
