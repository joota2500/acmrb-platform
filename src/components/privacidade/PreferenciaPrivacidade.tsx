"use client";

/**
 * PreferenciaPrivacidade — botão da página /privacidade para permitir
 * ou recusar a medição anônima de visitas (vale só neste navegador).
 * CSS: src/styles/pagina-privacidade.css (prefixo "pv-").
 */

import { useEffect, useState } from "react";

import { lerPrivacidade, salvarPrivacidade, type EscolhaPrivacidade } from "@/lib/privacidade";

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
    <div className="pv__preferencia">
      <p>
        Situação neste navegador: <strong>{recusado ? "medição desligada" : "medição anônima ligada"}</strong>.
      </p>
      <button type="button" className="pv__btn" onClick={() => mudar(recusado ? "aceito" : "recusado")}>
        {recusado ? "Permitir a medição anônima" : "Desligar a medição neste navegador"}
      </button>
    </div>
  );
}
