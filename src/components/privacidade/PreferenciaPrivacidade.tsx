"use client";

/**
 * PreferenciaPrivacidade — botão da página /privacidade para permitir
 * ou recusar a medição anônima de visitas (vale só neste navegador).
 * Visual: Tailwind + Button.
 */

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import { lerPrivacidade, salvarPrivacidade, type EscolhaPrivacidade } from "@/utils/privacidade";

export default function PreferenciaPrivacidade() {
  const [escolha, setEscolha] = useState<EscolhaPrivacidade>(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setEscolha(lerPrivacidade());
    setPronto(true);
  }, []);

  const mudar = (v: "aceito" | "recusado") => {
    salvarPrivacidade(v);
    setEscolha(v);
  };

  if (!pronto) return null;
  const recusado = escolha === "recusado";

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-mint bg-brand-soft p-4">
      <p className="m-0 text-left!">
        Situação neste navegador: <strong>{recusado ? "medição desligada" : "medição anônima ligada"}</strong>.
      </p>
      <Button onClick={() => mudar(recusado ? "aceito" : "recusado")} className="w-full sm:w-auto">
        {recusado ? "Permitir a medição anônima" : "Desligar a medição neste navegador"}
      </Button>
    </div>
  );
}
