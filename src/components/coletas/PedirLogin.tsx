"use client";

/**
 * PedirLogin — convite amigável para entrar ou criar conta de visitante
 * (usado no agendamento de coleta e em "Minhas coletas").
 * CSS: src/styles/pedir-login.css (prefixo "plogin").
 */

import Link from "next/link";
import { LogIn, UserPlus, Lock } from "lucide-react";
import "@/styles/pedir-login.css";

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
    <div className="plogin" role="region" aria-label="Acesso necessário">
      <span className="plogin__icone" aria-hidden="true"><Lock size={24} /></span>
      <h2 className="plogin__titulo">{titulo}</h2>
      <p className="plogin__texto">{texto}</p>
      {aviso && <p className="plogin__aviso">{aviso}</p>}
      <div className="plogin__acoes">
        <Link href="/login" className="plogin__btn plogin__btn--cheio"><LogIn size={17} aria-hidden="true" /> Entrar</Link>
        <Link href="/login?modo=cadastro" className="plogin__btn"><UserPlus size={17} aria-hidden="true" /> Criar conta grátis</Link>
      </div>
    </div>
  );
}
