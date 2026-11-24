"use client";

/**
 * CalendarioBairros — o visitante escolhe o bairro e vê dias e horários
 * ------------------------------------------------------------
 * Dados: coleta_calendario (somente ativos, leitura pública).
 * Sem cadastro no banco = aviso "calendário em definição" (nada inventado).
 * Usado na home (ColetaCalendarioSection) e em /calendario-coleta.
 * Visual: Tailwind.
 */

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin, Recycle } from "lucide-react";
import { Select } from "@/components/ui/Input";
import { cn } from "@/utils/cn";
import { DIAS_CURTOS, DIAS_SEMANA, janelaHorario, listarCalendario, type CalendarioBairro } from "@/services/coletas";
import { Esqueleto, EsqueletoLista } from "@/components/ui/Esqueleto";

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

  // esqueleto: campo do bairro + lista de dias
  if (carregando) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-busy="true" aria-label="Carregando calendário">
        <Esqueleto className="h-4 w-28" />
        <Esqueleto className="h-12 w-full rounded-[0.9rem]" />
        <EsqueletoLista quantidade={3} rotulo="Carregando calendário" />
      </div>
    );
  }
  if (erro) return <p className={ESTADO}>{erro}</p>;
  if (!bairros.length) {
    return (
      <p className={ESTADO}>
        O calendário por bairro ainda está sendo definido. Enquanto isso, agende sua coleta e a equipe combina o melhor dia com você.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-[0.85rem] font-extrabold text-emerald-900">
        <span className="inline-flex items-center gap-1.5"><MapPin size={16} aria-hidden="true" /> Seu bairro</span>
        <Select
          className="min-h-12 rounded-[0.9rem] border-[1.5px] border-emerald-200 px-3.5 text-base text-zinc-900"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
        >
          <option value="">Escolha o bairro…</option>
          {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
        </Select>
      </label>

      {!bairro ? (
        <p className="text-center text-[0.88rem] text-zinc-500">Escolha um bairro para ver os dias e horários da coleta seletiva.</p>
      ) : (
        <div className="grid gap-3" aria-live="polite">
          {doBairro.map((c) => (
            <article
              key={c.id}
              className="relative flex flex-col gap-2 rounded-[1.1rem] border border-emerald-100 bg-white p-[1.1rem] shadow-[0_8px_22px_-16px_rgb(46_94_78/0.4)] max-[480px]:p-3.5"
            >
              <ul className="mb-1 grid list-none grid-cols-7 gap-1 p-0" aria-label="Dias da semana com coleta">
                {DIAS_CURTOS.map((d, i) => {
                  const tem = c.dias_semana.includes(i);
                  return (
                    <li
                      key={d}
                      className={cn(
                        "flex min-h-[2.3rem] items-center justify-center rounded-[0.65rem] text-[0.78rem] font-extrabold max-[480px]:min-h-8 max-[480px]:text-[0.68rem]",
                        tem ? "bg-brand text-white" : "bg-zinc-100 text-zinc-400",
                        i === hoje && "outline-2 outline-offset-1 outline-[#f59e0b]",
                      )}
                      title={DIAS_SEMANA[i]}
                    >
                      <span aria-hidden="true">{d}</span>
                      <span className="sr-only">{DIAS_SEMANA[i]}: {tem ? "tem coleta" : "sem coleta"}</span>
                    </li>
                  );
                })}
              </ul>
              <p className={LINHA}><CalendarDays size={16} aria-hidden="true" /> {c.dias_semana.length ? [...c.dias_semana].sort().map((d) => DIAS_SEMANA[d]).join(", ") : "Dias a definir"}</p>
              <p className={LINHA}><Clock size={16} aria-hidden="true" /> {janelaHorario(c)}</p>
              {c.materiais.length > 0 && (
                <p className={LINHA}><Recycle size={16} aria-hidden="true" /> {c.materiais.join(" · ")}</p>
              )}
              {c.observacoes && <p className="texto-justo m-0 rounded-xl bg-[#f0fdf4] px-3 py-2 text-[0.84rem] text-emerald-800">{c.observacoes}</p>}
              {c.dias_semana.includes(hoje) && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-[#f59e0b] px-2.5 py-0.5 text-[0.7rem] font-extrabold text-white">Tem coleta hoje</span>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

const ESTADO =
  "flex items-center justify-center gap-2 rounded-[1.1rem] border border-dashed border-emerald-200 bg-white px-4 py-6 text-center text-[0.92rem] text-zinc-600";
const LINHA =
  "m-0 flex items-start gap-1.5 text-[0.9rem] text-zinc-700 max-[480px]:text-[0.85rem] [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg]:text-brand";
