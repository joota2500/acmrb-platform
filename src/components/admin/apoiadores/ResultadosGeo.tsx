"use client";

/**
 * ResultadosGeo — lista de posições sugeridas pela geocodificação
 * ------------------------------------------------------------
 * Mostra fonte (Nominatim, Photon, Esri, CEP…) e nível de precisão
 * (endereço exato / rua / bairro / cidade). O melhor resultado já vem
 * posicionado no mapa; clicar em outro move o marcador.
 * "aviso" aparece quando o local foi achado automaticamente (CNPJ).
 */

import { CheckCircle2, MapPin, TriangleAlert } from "lucide-react";
import type { ResultadoGeo } from "@/lib/apoiadoresAdmin";
import "@/styles/admin-geo.css";

interface Props {
  resultados: ResultadoGeo[];
  /** índice do resultado posicionado no mapa */
  escolhido: number | null;
  onEscolher: (r: ResultadoGeo, indice: number) => void;
  aviso?: string | null;
}

export default function ResultadosGeo({ resultados, escolhido, onEscolher, aviso }: Props) {
  if (!resultados.length && !aviso) return null;
  const atual = escolhido != null ? resultados[escolhido] : null;
  const fraco = atual && (atual.precisao === "bairro" || atual.precisao === "cidade");
  return (
    <div className="geo">
      {aviso && (
        <p className={`geo__aviso${fraco ? " geo__aviso--fraco" : ""}`} role="status">
          {fraco ? <TriangleAlert size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
          <span>
            {aviso}
            {atual && <> Precisão: <strong>{atual.rotulo_precisao}</strong> ({atual.fonte}).</>}
            {fraco && " Arraste o marcador até o local exato."}
          </span>
        </p>
      )}
      {resultados.length > 0 && (
        <ul className="geo__lista" aria-label="Posições sugeridas">
          {resultados.map((r, i) => (
            <li key={`${r.lat},${r.lng},${i}`}>
              <button type="button" aria-pressed={escolhido === i} onClick={() => onEscolher(r, i)}>
                <MapPin size={14} aria-hidden="true" />
                <span className="geo__nome">{r.nome}</span>
                <span className={`geo__prec geo__prec--${r.precisao}`}>{r.rotulo_precisao}</span>
                <span className="geo__fonte">{r.fonte}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
