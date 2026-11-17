"use client";

/**
 * PedirLogin — convite amigável para entrar ou criar conta de visitante
 * (usado no agendamento de coleta e em "Minhas coletas").
 * Visual: Tailwind + Button.
 */

import Link from "next/link";
import { LogIn, UserPlus, Lock } from "lucide-react";
import Button from "@/components/ui/Button";

interface Props {
  titulo?: string;
  texto?: string;
  /** Aviso extra (ex.: conta de administrador não agenda coleta) */
  aviso?: string;
}

export default function PedirLogin({
  titulo = "Entre para agendar sua coleta",
  texto = "O agendamento é feito pela sua conta de visitante. Assim você acompanha o andamento e conversa com a equipe da ACMRB. É grátis e leva menos de um minuto.",
  aviso,
}: Props) {
  return (
    <div
      className="mx-auto flex max-w-lg flex-col items-center gap-2.5 rounded-3xl border border-brand-line/60 bg-white px-4.5 py-6 text-center shadow-[0_14px_34px_-18px_rgb(46_94_78/0.35)] sm:px-6 sm:py-8"
      role="region"
      aria-label="Acesso necessário"
    >
      <span className="inline-flex size-13 items-center justify-center rounded-2xl bg-brand-mint text-brand" aria-hidden="true">
        <Lock size={24} />
      </span>
      <h2 className="text-center text-lg font-black text-zinc-900 sm:text-xl">{titulo}</h2>
      <p className="texto-justo text-sm leading-relaxed text-zinc-600 [text-align-last:center]">{texto}</p>
      {aviso && <p className="rounded-xl bg-warning-soft px-3 py-2 text-xs text-amber-800">{aviso}</p>}
      <div className="mt-2 flex w-full flex-col flex-wrap justify-center gap-2.5 sm:w-auto sm:flex-row">
        <Button href="/login">
          <LogIn size={17} aria-hidden="true" /> Entrar
        </Button>
        <Button href="/login?modo=cadastro" variante="contorno">
          <UserPlus size={17} aria-hidden="true" /> Criar conta grátis
        </Button>
      </div>
    </div>
  );
}
