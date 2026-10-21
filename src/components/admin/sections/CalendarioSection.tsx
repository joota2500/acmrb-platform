"use client";

/**
 * Seção "Calendário de coleta" (deus e admin normal)
 * ------------------------------------------------------------
 * CRUD da tabela coleta_calendario: bairro, dias da semana, janela de
 * horário, materiais, observações, ativo e ordem. RLS: is_active_admin().
 * O público vê só os ativos (/calendario-coleta e home #coleta).
 * CSS: src/styles/admin-calendario.css (prefixo "adcal").
 */

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CalendarPlus, Loader2, Pencil, Power, Save, Trash2, X } from "lucide-react";
import "@/styles/admin-calendario.css";
import { supabase } from "@/lib/supabase";
import { ToastArea, useToast } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { DIAS_CURTOS, DIAS_SEMANA, MATERIAIS_COLETA, janelaHorario, listarCalendario, type CalendarioBairro } from "@/lib/coletas";

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
  const { toasts, mostrar, fechar } = useToast();
  const [lista, setLista] = useState<CalendarioBairro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [excluir, setExcluir] = useState<CalendarioBairro | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setLista(await listarCalendario(true));
    } catch (e) {
      mostrar("erro", (e as Error).message);
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

  return (
    <div className="adcal">
      <div className="adcal-topo">
        <p className="adcal-sub">Dias e horários da coleta seletiva por bairro. Aparecem na home e em /calendario-coleta.</p>
        <button type="button" className="adcal-btn" onClick={() => { setErros({}); setForm({ ...VAZIO }); }}>
          <CalendarPlus size={17} aria-hidden="true" /> Novo bairro
        </button>
      </div>

      {form && (
        <form className="adcal-form" onSubmit={salvar} noValidate>
          <div className="adcal-form__topo">
            <h3>{form.id ? "Editar bairro" : "Novo bairro"}</h3>
            <button type="button" className="adcal-icone" onClick={() => setForm(null)} aria-label="Fechar formulário"><X size={18} /></button>
          </div>

          <div className="adcal-grade">
            <label className="adcal-campo">
              Bairro
              <input value={form.bairro} maxLength={80} onChange={(e) => setForm({ ...form, bairro: e.target.value })} aria-invalid={!!erros.bairro} placeholder="Ex.: Centro" />
              {erros.bairro && <span className="adcal-erro">{erros.bairro}</span>}
            </label>
            <label className="adcal-campo">
              Início
              <input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} />
            </label>
            <label className="adcal-campo">
              Fim
              <input type="time" value={form.hora_fim} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} aria-invalid={!!erros.horas} />
              {erros.horas && <span className="adcal-erro">{erros.horas}</span>}
            </label>
            <label className="adcal-campo adcal-campo--curto">
              Ordem
              <input type="number" min={0} value={form.ordem} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} />
            </label>
          </div>

          <fieldset className="adcal-campo">
            <legend>Dias da semana</legend>
            <div className="adcal-chips">
              {DIAS_SEMANA.map((d, i) => (
                <button key={d} type="button" aria-pressed={form.dias_semana.includes(i)} className={`adcal-chip${form.dias_semana.includes(i) ? " adcal-chip--ativo" : ""}`} onClick={() => setForm({ ...form, dias_semana: alternar(form.dias_semana, i) })}>
                  {DIAS_CURTOS[i]}
                </button>
              ))}
            </div>
            {erros.dias && <span className="adcal-erro">{erros.dias}</span>}
          </fieldset>

          <fieldset className="adcal-campo">
            <legend>Materiais recolhidos</legend>
            <div className="adcal-chips">
              {MATERIAIS_COLETA.map((m) => (
                <button key={m} type="button" aria-pressed={form.materiais.includes(m)} className={`adcal-chip${form.materiais.includes(m) ? " adcal-chip--ativo" : ""}`} onClick={() => setForm({ ...form, materiais: alternar(form.materiais, m) })}>
                  {m}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="adcal-campo">
            Observações
            <textarea rows={2} maxLength={500} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} placeholder="Ex.: deixar o material na calçada até 7h" />
          </label>

          <label className="adcal-check">
            <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Visível no site
          </label>

          <div className="adcal-form__acoes">
            <button type="button" className="adcal-btn adcal-btn--leve" onClick={() => setForm(null)}>Cancelar</button>
            <button type="submit" className="adcal-btn" disabled={salvando}>
              {salvando ? <Loader2 size={16} className="adcal-giro" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />} Salvar
            </button>
          </div>
        </form>
      )}

      {carregando ? (
        <p className="adcal-vazio"><Loader2 size={18} className="adcal-giro" aria-hidden="true" /> Carregando…</p>
      ) : lista.length === 0 ? (
        <p className="adcal-vazio">Nenhum bairro cadastrado. Clique em “Novo bairro” para começar.</p>
      ) : (
        <ul className="adcal-lista">
          {lista.map((c) => (
            <li key={c.id} className={`adcal-item${c.ativo ? "" : " adcal-item--inativo"}`}>
              <div className="adcal-item__info">
                <strong>{c.bairro}{!c.ativo && <span className="adcal-selo">oculto</span>}</strong>
                <div className="adcal-semana" aria-label="Dias">
                  {DIAS_CURTOS.map((d, i) => <span key={d} className={c.dias_semana.includes(i) ? "adcal-dia adcal-dia--ativo" : "adcal-dia"}>{d}</span>)}
                </div>
                <span className="adcal-item__det">{janelaHorario(c)}{c.materiais.length ? ` · ${c.materiais.join(", ")}` : ""}</span>
              </div>
              <div className="adcal-item__acoes">
                <button type="button" className="adcal-icone" title="Editar" aria-label={`Editar ${c.bairro}`} onClick={() => { setErros({}); setForm({ id: c.id, bairro: c.bairro, dias_semana: c.dias_semana, hora_inicio: c.hora_inicio?.slice(0, 5) ?? "", hora_fim: c.hora_fim?.slice(0, 5) ?? "", materiais: c.materiais, observacoes: c.observacoes ?? "", ativo: c.ativo, ordem: c.ordem }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil size={16} /></button>
                <button type="button" className="adcal-icone" title={c.ativo ? "Ocultar do site" : "Mostrar no site"} aria-label={c.ativo ? `Ocultar ${c.bairro}` : `Mostrar ${c.bairro}`} onClick={() => void alternarAtivo(c)}><Power size={16} /></button>
                <button type="button" className="adcal-icone adcal-icone--perigo" title="Excluir" aria-label={`Excluir ${c.bairro}`} onClick={() => setExcluir(c)}><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

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
      <ToastArea toasts={toasts} onFechar={fechar} />
    </div>
  );
}
