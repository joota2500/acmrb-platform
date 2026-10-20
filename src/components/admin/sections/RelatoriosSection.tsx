"use client";

/**
 * Painel › Relatórios — documentos públicos da transparência
 * (tabela transparencia_documentos, migration 20261020210000).
 * Qualquer admin ativo pode cadastrar (permissions.ts: relatorios = total).
 * Só os marcados como "publicado" aparecem em /transparencia#documentos.
 * O arquivo em si fica num link (Google Drive, Storage do Supabase etc.).
 */

import { useEffect, useState } from "react";
import { Eye, EyeOff, FileText, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS_DOC } from "@/components/transparencia/TranspDocumentos";

type Doc = {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  url_arquivo: string;
  ano: number | null;
  publicado: boolean;
  ordem: number;
};

const VAZIO = { titulo: "", descricao: "", categoria: "relatorio", url_arquivo: "", ano: String(new Date().getFullYear()), publicado: false, ordem: "0" };

export default function RelatoriosSection() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [semTabela, setSemTabela] = useState(false);
  const [form, setForm] = useState<typeof VAZIO | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function carregar() {
    setLoading(true);
    const { data, error } = await supabase
      .from("transparencia_documentos")
      .select("*")
      .order("ano", { ascending: false })
      .order("ordem", { ascending: true });
    setSemTabela(!!error);
    setDocs(error ? [] : (data as Doc[]));
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrir(d?: Doc) {
    setMsg(null);
    setEditId(d?.id ?? null);
    setForm(
      d
        ? { titulo: d.titulo, descricao: d.descricao ?? "", categoria: d.categoria, url_arquivo: d.url_arquivo, ano: d.ano ? String(d.ano) : "", publicado: d.publicado, ordem: String(d.ordem ?? 0) }
        : { ...VAZIO },
    );
  }

  async function salvar() {
    if (!form) return;
    if (!form.titulo.trim() || !/^https?:\/\//.test(form.url_arquivo.trim())) {
      setMsg("Informe o título e um link válido (começando com http:// ou https://).");
      return;
    }
    setSalvando(true);
    const dados = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      categoria: form.categoria,
      url_arquivo: form.url_arquivo.trim(),
      ano: form.ano ? Number(form.ano) : null,
      publicado: form.publicado,
      ordem: Number(form.ordem) || 0,
    };
    const { error } = editId
      ? await supabase.from("transparencia_documentos").update(dados).eq("id", editId)
      : await supabase.from("transparencia_documentos").insert(dados);
    setSalvando(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setForm(null);
    carregar();
  }

  async function alternar(d: Doc) {
    await supabase.from("transparencia_documentos").update({ publicado: !d.publicado }).eq("id", d.id);
    carregar();
  }

  async function excluir(d: Doc) {
    if (!confirm(`Excluir o documento “${d.titulo}”?`)) return;
    await supabase.from("transparencia_documentos").delete().eq("id", d.id);
    carregar();
  }

  const campo = "mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-black text-zinc-900">Documentos da transparência</h2>
          <p className="mt-1 text-sm text-zinc-500">Relatórios, prestações de contas, estatuto e certificados exibidos em /transparencia.</p>
        </div>
        <button onClick={() => abrir()} disabled={semTabela} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#047857] px-5 font-bold text-white disabled:opacity-50">
          <Plus className="h-4 w-4" /> Novo documento
        </button>
      </div>

      {semTabela && (
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          A tabela de documentos ainda não existe. Rode a migration 20261020210000_transparencia_completa.sql no Supabase.
        </div>
      )}

      {form && (
        <div className="rounded-3xl border border-emerald-200 bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-zinc-800">{editId ? "Editar documento" : "Novo documento"}</h3>
            <button onClick={() => setForm(null)} aria-label="Fechar"><X className="h-5 w-5 text-zinc-500" /></button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="text-sm font-semibold">Título*</span>
              <input className={campo} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></label>
            <label className="sm:col-span-2"><span className="text-sm font-semibold">Link do arquivo*</span>
              <input className={campo} placeholder="https://..." value={form.url_arquivo} onChange={(e) => setForm({ ...form, url_arquivo: e.target.value })} /></label>
            <label><span className="text-sm font-semibold">Categoria</span>
              <select className={campo} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {Object.entries(CATEGORIAS_DOC).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select></label>
            <label><span className="text-sm font-semibold">Ano</span>
              <input type="number" className={campo} value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} /></label>
            <label className="sm:col-span-2"><span className="text-sm font-semibold">Descrição</span>
              <textarea rows={3} className={campo} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></label>
            <label><span className="text-sm font-semibold">Ordem</span>
              <input type="number" className={campo} value={form.ordem} onChange={(e) => setForm({ ...form, ordem: e.target.value })} /></label>
            <label className="flex items-center gap-2 self-end pb-2.5">
              <input type="checkbox" checked={form.publicado} onChange={(e) => setForm({ ...form, publicado: e.target.checked })} />
              <span className="text-sm font-semibold">Publicado (visível ao público)</span></label>
          </div>
          {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
          <div className="mt-5 flex justify-end">
            <button onClick={salvar} disabled={salvando} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#047857] px-6 font-bold text-white disabled:opacity-60">
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl bg-white p-10 text-zinc-500"><Loader2 className="h-5 w-5 animate-spin" /> Carregando…</div>
      ) : docs.length === 0 && !semTabela ? (
        <div className="rounded-3xl border-2 border-dashed border-zinc-200 p-10 text-center text-zinc-500">Nenhum documento cadastrado.</div>
      ) : (
        <ul className="space-y-3">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:flex-row sm:items-center">
              <FileText className="hidden h-5 w-5 shrink-0 text-emerald-700 sm:block" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-zinc-900">{d.titulo}</p>
                <p className="text-xs text-zinc-500">{CATEGORIAS_DOC[d.categoria] ?? d.categoria}{d.ano ? ` • ${d.ano}` : ""} • {d.publicado ? "Publicado" : "Rascunho"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => alternar(d)} className="rounded-xl border border-zinc-200 p-2" aria-label={d.publicado ? "Despublicar" : "Publicar"}>
                  {d.publicado ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => abrir(d)} className="rounded-xl border border-zinc-200 p-2" aria-label="Editar"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => excluir(d)} className="rounded-xl border border-red-200 p-2 text-red-600" aria-label="Excluir"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
