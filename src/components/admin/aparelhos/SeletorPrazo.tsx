"use client";

/**
 * SeletorPrazo — o deus escolhe até quando vale um bloqueio, suspensão ou
 * impedimento de retorno: indeterminado, daqui a N minutos/horas/dias, ou
 * uma data e hora exatas. Mostra uma prévia clara do término.
 * CSS: src/styles/admin-aparelhos.css (prefixo "apa-").
 */

import { calcularAte, dataFortaleza, type ModoPrazo, type PrazoEntrada, type UnidadePrazo } from "@/lib/prazo";

interface Props {
  valor: PrazoEntrada;
  onChange: (v: PrazoEntrada) => void;
  /** texto da opção "indeterminado" (ex.: "Sem prazo (até eu liberar)") */
  rotuloIndeterminado?: string;
}

const ATALHOS: { q: number; u: UnidadePrazo; r: string }[] = [
  { q: 30, u: "minutos", r: "30 min" },
  { q: 1, u: "horas", r: "1 hora" },
  { q: 24, u: "horas", r: "24 horas" },
  { q: 7, u: "dias", r: "7 dias" },
  { q: 30, u: "dias", r: "30 dias" },
];

/** ISO → valor do campo datetime-local ("2026-10-27T14:30") no fuso do navegador */
export function paraCampoData(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function SeletorPrazo({ valor, onChange, rotuloIndeterminado = "Indeterminado (até eu liberar)" }: Props) {
  const resultado = calcularAte(valor);
  const campoData = valor.modo === "data" ? paraCampoData(valor.ate) : "";

  return (
    <div className="apa-prazo">
      <label className="apa-campo">
        Duração
        <select
          className="advis-select"
          value={valor.modo}
          onChange={(e) => {
            const modo = e.target.value as ModoPrazo;
            if (modo === "relativo") onChange({ modo, quantidade: valor.quantidade ?? 24, unidade: valor.unidade ?? "horas" });
            else if (modo === "data") onChange({ modo, ate: valor.ate ?? new Date(Date.now() + 24 * 3600 * 1000).toISOString() });
            else onChange({ modo });
          }}
        >
          <option value="indeterminado">{rotuloIndeterminado}</option>
          <option value="relativo">Por um tempo (minutos, horas ou dias)</option>
          <option value="data">Até uma data e hora exatas</option>
        </select>
      </label>

      {valor.modo === "relativo" && (
        <>
          <div className="apa-prazo__linha">
            <input
              className="advd-input"
              type="number"
              min={1}
              inputMode="numeric"
              aria-label="Quantidade"
              value={valor.quantidade ?? ""}
              onChange={(e) => onChange({ ...valor, quantidade: e.target.value === "" ? undefined : Number(e.target.value) })}
            />
            <select className="advis-select" aria-label="Unidade" value={valor.unidade ?? "horas"} onChange={(e) => onChange({ ...valor, unidade: e.target.value as UnidadePrazo })}>
              <option value="minutos">minutos</option>
              <option value="horas">horas</option>
              <option value="dias">dias</option>
            </select>
          </div>
          <div className="apa-chips" role="group" aria-label="Atalhos de duração">
            {ATALHOS.map((a) => (
              <button key={a.r} type="button" className={valor.quantidade === a.q && valor.unidade === a.u ? "apa-chip apa-chip--ativo" : "apa-chip"} onClick={() => onChange({ modo: "relativo", quantidade: a.q, unidade: a.u })}>{a.r}</button>
            ))}
          </div>
        </>
      )}

      {valor.modo === "data" && (
        <input
          className="advd-input"
          type="datetime-local"
          aria-label="Data e hora de término"
          min={paraCampoData(new Date(Date.now() + 60_000).toISOString())}
          value={campoData}
          onChange={(e) => onChange({ modo: "data", ate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
        />
      )}

      <p className={"erro" in resultado ? "apa-prazo__previa apa-prazo__previa--erro" : "apa-prazo__previa"}>
        {"erro" in resultado
          ? resultado.erro
          : resultado.ate
            ? `Termina em ${dataFortaleza(resultado.ate)} (horário de Fortaleza).`
            : "Sem data para terminar: continua até você liberar."}
      </p>
    </div>
  );
}
