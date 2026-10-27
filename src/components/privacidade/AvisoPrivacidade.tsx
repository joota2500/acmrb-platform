"use client";

/**
 * AvisoPrivacidade — aviso simples de privacidade/cookies (LGPD)
 * ------------------------------------------------------------
 * Aparece na primeira visita, no rodapé da tela. O visitante pode
 * "Entendi" (aceita a medição anônima) ou "Não permitir medição".
 * A escolha fica só no navegador (lib/privacidade.ts) e pode ser mudada
 * em /privacidade. CSS: src/styles/aviso-privacidade.css (prefixo "ap-").
 */

import { useEffect, useState } from "react";
import Link from "next/link";

import "@/styles/aviso-privacidade.css";
import { lerPrivacidade, salvarPrivacidade } from "@/lib/privacidade";

export default function AvisoPrivacidade() {
  const [visivel, setVisivel] = useState(false);

  // Lê no navegador (evita diferença entre servidor e cliente)
  useEffect(() => {
    setVisivel(lerPrivacidade() === null);
  }, []);

  if (!visivel) return null;

  const escolher = (v: "aceito" | "recusado") => {
    salvarPrivacidade(v);
    setVisivel(false);
  };

  return (
    <div className="ap" role="dialog" aria-live="polite" aria-label="Aviso de privacidade">
      <p className="ap__texto">
        Usamos um identificador anônimo no seu navegador para contar visitas e melhorar o site (páginas vistas, tempo e
        região aproximada). <strong>Não guardamos seu IP</strong> e os registros de quem não tem conta somem em 24 horas.{" "}
        <Link href="/privacidade" className="ap__link">Saiba mais</Link>.
      </p>
      <div className="ap__botoes">
        <button type="button" className="ap__btn ap__btn--claro" onClick={() => escolher("recusado")}>Não permitir medição</button>
        <button type="button" className="ap__btn" onClick={() => escolher("aceito")}>Entendi</button>
      </div>
    </div>
  );
}
