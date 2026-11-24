"use client";

/**
 * Seção "Calendário de coleta" (deus e admin normal)
 * ------------------------------------------------------------
 * CRUD da tabela coleta_calendario: bairro, dias da semana, janela de
 * horário, materiais, observações, ativo e ordem. RLS: is_active_admin().
 * O público vê só os ativos (/calendario-coleta e home #coleta).
 * Visual só com Tailwind, no mesmo padrão de notícias/apoiadores
 * (o antigo admin-calendario.css foi apagado). O formulário abre na
 * gaveta lateral, com cabeçalho e rodapé fixos.
 */

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CalendarDays, CalendarPlus, Eye, EyeOff, Loader2, Lock, MapPinned, Pencil, RefreshCw, Save, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { DIAS_CURTOS, DIAS_SEMANA, MATERIAIS_COLETA, janelaHorario, listarCalendario, type CalendarioBairro } from "@/services/coletas";
import Button from "@/components/ui/Button";
import PainelLateral from "@/components/admin/apoiadores/PainelLateral";
import { cn } from "@/utils/cn";
import {
  BLOCO, BOTAO_ACAO, BOTAO_PERIGO, CAIXA_VAZIA, CAMPO, CARTAO, CONTROLE, ERRO, MARCAR, ROTULO, SELO, TEXTO_ACAO, TITULO_BLOCO,
} from "@/components/admin/apoiadores/estilos";

// pílula de escolha (dias e materiais): verde quando marcada
const PILULA =
  "cursor-pointer rounded-full border border-line bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-zinc-700 transition hover:border-brand-line aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-white";

type Form = {
  id?: string;
  bairro: string;
  dias_semana: number[];
  hora_inicio: string;
  hora_fim: string;
  materiais: string[];
  observacoes: string;
  ativo: boolean;
  ordem: number;
};

const VAZIO: Form = { bairro: "", dias_semana: [], hora_inicio: "", hora_fim: "", materiais: [], observacoes: "", ativo: true, ordem: 0 };

export default function CalendarioSection() {
  const { mostrar } = useToast();
  const [lista, setLista] = useState<CalendarioBairro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [excluir, setExcluir] = useState<CalendarioBairro | null>(null);
  // erro da última carga ("sem-permissao" quando o banco recusa)
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setLista(await listarCalendario(true));
      setErroCarga(null);
    } catch (e) {
      const msg = (e as Error).message;
      mostrar("erro", msg);
      setErroCarga(/permission|42501/i.test(msg) ? "sem-permissao" : msg);
    } finally {
      setCarregando(false);
    }
  }, [mostrar]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const alternar = <T,>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    const er: Record<string, string> = {};
    if (form.bairro.trim().length < 2) er.bairro = "Informe o bairro.";
    if (!form.dias_semana.length) er.dias = "Marque pelo menos um dia.";
    if (form.hora_inicio && form.hora_fim && form.hora_fim <= form.hora_inicio) er.horas = "O fim precisa ser depois do início.";
    setErros(er);
    if (Object.keys(er).length) return;

    setSalvando(true);
    const dados = {
      bairro: form.bairro.trim(),
      dias_semana: [...form.dias_semana].sort(),
      hora_inicio: form.hora_inicio || null,
      hora_fim: form.hora_fim || null,
      materiais: form.materiais,
      observacoes: form.observacoes.trim() || null,
      ativo: form.ativo,
      ordem: Number(form.ordem) || 0,
    };
    const { error } = form.id
      ? await supabase.from("coleta_calendario").update(dados).eq("id", form.id)
      : await supabase.from("coleta_calendario").insert(dados);
    setSalvando(false);
    if (error) return mostrar("erro", "Não foi possível salvar. A migration do calendário já foi rodada?");
    mostrar("sucesso", form.id ? "Bairro atualizado." : "Bairro cadastrado.");
    setForm(null);
    void carregar();
  }

  async function alternarAtivo(c: CalendarioBairro) {
    const { error } = await supabase.from("coleta_calendario").update({ ativo: !c.ativo }).eq("id", c.id);
    if (error) return mostrar("erro", "Não foi possível alterar.");
    mostrar("sucesso", c.ativo ? "Bairro ocultado do site." : "Bairro visível no site.");
    void carregar();
  }

  async function confirmarExclusao() {
    if (!excluir) return;
    setSalvando(true);
    const { error } = await supabase.from("coleta_calendario").delete().eq("id", excluir.id);
    setSalvando(false);
    setExcluir(null);
    if (error) return mostrar("erro", "Não foi possível excluir.");
    mostrar("sucesso", "Bairro excluído do calendário.");
    void carregar();
  }

  // useCallback: o PainelLateral refaz o foco se esta função mudar a cada render
  const fecharForm = useCallback(() => setForm(null), []);
  function editar(c: CalendarioBairro) {
    setErros({});
    setForm({
      id: c.id, bairro: c.bairro, dias_semana: c.dias_semana, hora_inicio: c.hora_inicio?.slice(0, 5) ?? "", hora_fim: c.hora_fim?.slice(0, 5) ?? "",
      materiais: c.materiais, observacoes: c.observacoes ?? "", ativo: c.ativo, ordem: c.ordem,
    });
  }

  /* ---------- Sem permissão ---------- */
  if (erroCarga === "sem-permissao") {
    return (
      <div role="alert" className={cn(CARTAO, "mx-auto my-8 flex max-w-md flex-col items-center gap-2.5 p-8 text-center text-brand")}>
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-mint">
          <Lock size={26} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-extrabold text-ink">Sem permissão para o calendário</h2>
        <p className="text-sm text-ink-soft">Só administradores ativos alteram o calendário de coleta.</p>
      </div>
    );
  }

  // números dos cartões do topo
  const cartoes = [
    { rotulo: "Bairros", valor: lista.length, Icone: MapPinned, cor: "bg-brand-mint text-brand" },
    { rotulo: "Visíveis no site", valor: lista.filter((c) => c.ativo).length, Icone: Eye, cor: "bg-emerald-100 text-emerald-700" },
    { rotulo: "Ocultos", valor: lista.filter((c) => !c.ativo).length, Icone: EyeOff, cor: "bg-zinc-100 text-zinc-600" },
    { rotulo: "Coletas por semana", valor: lista.filter((c) => c.ativo).reduce((t, c) => t + c.dias_semana.length, 0), Icone: CalendarDays, cor: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black tracking-tight text-ink sm:text-2xl">Calendário de coleta</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">Dias e horários da coleta seletiva por bairro. Aparecem na home e em /calendario-coleta.</p>
        </div>
        <Button type="button" tamanho="pequeno" className="max-sm:w-full" onClick={() => { setErros({}); setForm({ ...VAZIO }); }}>
          <CalendarPlus size={17} aria-hidden="true" /> Novo bairro
        </Button>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cartoes.map(({ rotulo, valor, Icone, cor }) => (
          <div key={rotulo} className={cn(CARTAO, "flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-card-hover")}>
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", cor)}>
              <Icone size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <strong className="block text-2xl font-black leading-none text-ink">{carregando ? "–" : valor}</strong>
              <span className="text-[0.78rem] font-semibold text-ink-soft">{rotulo}</span>
            </div>
          </div>
        ))}
      </div>

      {carregando ? (
        // esqueleto no lugar da lista
        <ul className="flex flex-col gap-3" aria-label="Carregando calendário">
          {[0, 1, 2].map((i) => (
            <li key={i} className={cn(CARTAO, "flex animate-pulse flex-col gap-2.5 p-4")}>
              <div className="h-4 w-1/3 rounded-full bg-zinc-100" />
              <div className="flex gap-1.5">{[0, 1, 2, 3, 4, 5, 6].map((d) => <div key={d} className="size-8 rounded-lg bg-zinc-100" />)}</div>
              <div className="h-3 w-1/2 rounded-full bg-zinc-100" />
            </li>
          ))}
        </ul>
      ) : erroCarga ? (
        <div className={cn(CAIXA_VAZIA, "border-red-200 text-danger")} role="alert">
          Erro ao carregar: {erroCarga}
          <Button type="button" variante="secundario" tamanho="pequeno" onClick={() => void carregar()}><RefreshCw size={16} aria-hidden="true" /> Tentar de novo</Button>
        </div>
      ) : lista.length === 0 ? (
        <div className={CAIXA_VAZIA}>
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-mint text-brand"><CalendarDays size={22} aria-hidden="true" /></span>
          Nenhum bairro cadastrado. Clique em “Novo bairro” para começar.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {lista.map((c) => (
            <li key={c.id} className={cn(CARTAO, "flex flex-col gap-3 p-3 transition hover:border-brand-line sm:p-4 lg:flex-row lg:items-center", !c.ativo && "bg-zinc-50/80")}>
              <div className={cn("min-w-0 flex-1", !c.ativo && "opacity-75")}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-[0.95rem] font-extrabold text-ink sm:text-base">{c.bairro}</h3>
                  {c.ativo
                    ? <span className={cn(SELO, "bg-emerald-100 text-emerald-800")}><Eye size={11} aria-hidden="true" /> No site</span>
                    : <span className={cn(SELO, "bg-zinc-200 text-zinc-700")}><EyeOff size={11} aria-hidden="true" /> Oculto</span>}
                </div>
                {/* os 7 dias, com os de coleta em verde */}
                <div className="mt-2 flex flex-wrap gap-1" aria-label="Dias">
                  {DIAS_CURTOS.map((d, i) => (
                    <span
                      key={d}
                      className={cn(
                        "grid h-7 min-w-9 place-items-center rounded-lg px-1.5 text-[0.72rem] font-extrabold",
                        c.dias_semana.includes(i) ? "bg-brand text-white" : "bg-zinc-100 text-zinc-400",
                      )}
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <small className="mt-1.5 block text-[0.78rem] text-ink-muted [overflow-wrap:anywhere]">
                  {janelaHorario(c)}{c.materiais.length ? ` · ${c.materiais.join(", ")}` : ""}
                </small>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-3 lg:border-0 lg:pt-0">
                <button type="button" className={BOTAO_ACAO} title="Editar" aria-label={`Editar ${c.bairro}`} onClick={() => editar(c)}>
                  <Pencil size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Editar</span>
                </button>
                <button
                  type="button"
                  className={BOTAO_ACAO}
                  title={c.ativo ? "Ocultar do site" : "Mostrar no site"}
                  aria-label={c.ativo ? `Ocultar ${c.bairro}` : `Mostrar ${c.bairro}`}
                  onClick={() => void alternarAtivo(c)}
                >
                  {c.ativo ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                  <span className={TEXTO_ACAO}>{c.ativo ? "Ocultar" : "Mostrar"}</span>
                </button>
                <button type="button" className={cn(BOTAO_ACAO, BOTAO_PERIGO)} title="Excluir" aria-label={`Excluir ${c.bairro}`} onClick={() => setExcluir(c)}>
                  <Trash2 size={15} aria-hidden="true" /><span className={TEXTO_ACAO}>Excluir</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Formulário na gaveta (o botão Salvar do rodapé envia o form pelo id) */}
      <PainelLateral
        aberto={!!form}
        titulo={form?.id ? "Editar bairro" : "Novo bairro"}
        onFechar={fecharForm}
        rodape={
          <>
            <Button type="button" variante="contorno" tamanho="pequeno" onClick={fecharForm}>Cancelar</Button>
            <Button type="submit" form="form-calendario" tamanho="pequeno" disabled={salvando}>
              {salvando ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />} Salvar
            </Button>
          </>
        }
      >
        {form && (
          <form id="form-calendario" className="flex flex-col gap-4" onSubmit={salvar} noValidate>
            <fieldset className={BLOCO}>
              <legend className={TITULO_BLOCO}>Bairro e horário</legend>
              <label className={CAMPO}>
                <span className={ROTULO}>Bairro</span>
                <input className={CONTROLE} value={form.bairro} maxLength={80} onChange={(e) => setForm({ ...form, bairro: e.target.value })} aria-invalid={!!erros.bairro} placeholder="Ex.: Centro" />
                {erros.bairro && <span className={ERRO}>{erros.bairro}</span>}
              </label>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                <label className={CAMPO}>
                  <span className={ROTULO}>Início</span>
                  <input className={CONTROLE} type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} />
                </label>
                <label className={CAMPO}>
                  <span className={ROTULO}>Fim</span>
                  <input className={CONTROLE} type="time" value={form.hora_fim} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} aria-invalid={!!erros.horas} />
                </label>
                <label className={cn(CAMPO, "col-span-2 sm:col-span-1")}>
                  <span className={ROTULO}>Ordem</span>
                  <input className={CONTROLE} type="number" min={0} value={form.ordem} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} />
                </label>
              </div>
              {erros.horas && <span className={ERRO}>{erros.horas}</span>}
            </fieldset>

            <fieldset className={BLOCO}>
              <legend className={TITULO_BLOCO}>Dias da semana</legend>
              <div className="flex flex-wrap gap-1.5">
                {DIAS_SEMANA.map((d, i) => (
                  <button key={d} type="button" aria-pressed={form.dias_semana.includes(i)} className={PILULA} onClick={() => setForm({ ...form, dias_semana: alternar(form.dias_semana, i) })}>
                    {DIAS_CURTOS[i]}
                  </button>
                ))}
              </div>
              {erros.dias && <span className={ERRO}>{erros.dias}</span>}
            </fieldset>

            <fieldset className={BLOCO}>
              <legend className={TITULO_BLOCO}>Materiais recolhidos</legend>
              <div className="flex flex-wrap gap-1.5">
                {MATERIAIS_COLETA.map((m) => (
                  <button key={m} type="button" aria-pressed={form.materiais.includes(m)} className={PILULA} onClick={() => setForm({ ...form, materiais: alternar(form.materiais, m) })}>
                    {m}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className={BLOCO}>
              <legend className={TITULO_BLOCO}>Exibição</legend>
              <label className={CAMPO}>
                <span className={ROTULO}>Observações</span>
                <textarea className={CONTROLE} rows={2} maxLength={500} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Ex.: deixar o material na calçada até 7h" />
              </label>
              <label className={MARCAR}>
                <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Visível no site
              </label>
            </fieldset>
          </form>
        )}
      </PainelLateral>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir bairro do calendário?"
        mensagem={`${excluir?.bairro ?? ""} deixará de aparecer no calendário público.`}
        textoConfirmar="Excluir"
        perigo
        carregando={salvando}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
      />
    </div>
  );
}
