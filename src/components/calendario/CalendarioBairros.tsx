"use client";

/**
 * CalendarioBairros — o visitante escolhe o bairro e vê dias e horários
 * ------------------------------------------------------------
 * Dados: coleta_calendario (somente ativos, leitura pública).
 * Sem cadastro no banco = aviso "calendário em definição" (nada inventado).
 * Usado na home (ColetaCalendarioSection) e em /calendario-coleta.
 * CSS: src/styles/calendario-bairros.css (prefixo "calb").
 */

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Loader2, MapPin, Recycle } from "lucide-react";
import "@/styles/calendario-bairros.css";
import { DIAS_CURTOS, DIAS_SEMANA, janelaHorario, listarCalendario, type CalendarioBairro } from "@/lib/coletas";

export default function CalendarioBairros({ compacto = false }: { compacto?: boolean }) {
  const [itens, setItens] = useState<CalendarioBairro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [bairro, setBairro] = useState("");

  useEffect(() => {
    listarCalendario()
      .then(setItens)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const bairros = useMemo(
    () => Array.from(new Set(itens.map((i) => i.bairro.trim()))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [itens],
  );
  const doBairro = itens.filter((i) => i.bairro.trim() === bairro);
  const hoje = new Date().getDay();

  if (carregando) return <p className="calb-estado"><Loader2 size={18} className="calb-giro" aria-hidden="true" /> Carregando calendário…</p>;
  if (erro) return <p className="calb-estado">{erro}</p>;
  if (!bairros.length) {
    return (
      <p className="calb-estado">
        O calendário por bairro ainda está sendo definido. Enquanto isso, agende sua coleta e a equipe combina o melhor dia com você.
      </p>
    );
  }

  return (
    <div className={`calb${compacto ? " calb--compacto" : ""}`}>
      <label className="calb-seletor">
        <span><MapPin size={16} aria-hidden="true" /> Seu bairro</span>
        <select value={bairro} onChange={(e) => setBairro(e.target.value)}>
          <option value="">Escolha o bairro…</option>
          {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </label>

      {!bairro ? (
        <p className="calb-dica">Escolha um bairro para ver os dias e horários da coleta seletiva.</p>
      ) : (
        <div className="calb-resultado" aria-live="polite">
          {doBairro.map((c) => (
            <article key={c.id} className="calb-cartao">
              <ul className="calb-semana" aria-label="Dias da semana com coleta">
                {DIAS_CURTOS.map((d, i) => {
                  const tem = c.dias_semana.includes(i);
                  return (
                    <li key={d} className={`calb-dia${tem ? " calb-dia--ativo" : ""}${i === hoje ? " calb-dia--hoje" : ""}`} title={DIAS_SEMANA[i]}>
                      <span aria-hidden="true">{d}</span>
                      <span className="calb-sr">{DIAS_SEMANA[i]}: {tem ? "tem coleta" : "sem coleta"}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="calb-linha"><CalendarDays size={16} aria-hidden="true" /> {c.dias_semana.length ? [...c.dias_semana].sort().map((d) => DIAS_SEMANA[d]).join(", ") : "Dias a definir"}</p>
              <p className="calb-linha"><Clock size={16} aria-hidden="true" /> {janelaHorario(c)}</p>
              {c.materiais.length > 0 && (
                <p className="calb-linha"><Recycle size={16} aria-hidden="true" /> {c.materiais.join(" · ")}</p>
              )}
              {c.observacoes && <p className="calb-obs">{c.observacoes}</p>}
              {c.dias_semana.includes(hoje) && <span className="calb-selo">Tem coleta hoje</span>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
