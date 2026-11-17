"use client";

/**
 * FormAgendarColeta — pedido de coleta do visitante (/agendar-coleta)
 * ------------------------------------------------------------
 * - Sem login: convite para entrar/criar conta (PedirLogin).
 * - Admin logado: aviso para usar o painel (admins não pedem coleta).
 * - Visitante: endereço (geocodificado por /api/geocodificar) com pino
 *   ajustável no mapa, bairro (lista do calendário ou "outro"),
 *   materiais, quantidade, data e período preferidos, observações e
 *   foto opcional (bucket privado "coletas"). Validação com zod.
 * Visual: Tailwind + ui (Input, Select, Textarea, Button, Spinner).
 */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, LocateFixed, MapPin, Send, Trash2 } from "lucide-react";

import Input, { Select, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { geocodificar } from "@/services/apoiadoresAdmin";
import PedirLogin from "@/components/coletas/PedirLogin";
import {
  MATERIAIS_COLETA, PERIODOS, enviarFoto, esquemaSolicitacao, listarCalendario, validarFoto, type Periodo,
} from "@/services/coletas";

const MapaSeletor = dynamic(() => import("@/components/mapa/MapaSeletor"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center rounded-2xl bg-emerald-50 font-bold text-leaf">Carregando mapa…</div>,
});

const QUANTIDADES = ["Até 1 saco", "2 a 5 sacos", "6 a 10 sacos", "Mais de 10 sacos", "Grande volume (carro/caminhão)"];
const OUTRO = "__outro__";

export default function FormAgendarColeta() {
  const router = useRouter();
  const { user, perfil, loading } = useAuth();

  const [bairros, setBairros] = useState<string[]>([]);
  const [endereco, setEndereco] = useState("");
  const [bairroSel, setBairroSel] = useState("");
  const [bairroOutro, setBairroOutro] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geoMsg, setGeoMsg] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [materiais, setMateriais] = useState<string[]>([]);
  const [quantidade, setQuantidade] = useState("");
  const [data, setData] = useState("");
  const [periodo, setPeriodo] = useState<Periodo>("qualquer");
  const [obs, setObs] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [previa, setPrevia] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  // Bairros do calendário (se ainda não houver, só o campo "outro")
  useEffect(() => {
    listarCalendario()
      .then((l) => setBairros(Array.from(new Set(l.map((c) => c.bairro.trim()))).sort((a, b) => a.localeCompare(b, "pt-BR"))))
      .catch(() => setBairros([]));
  }, []);

  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);

  const bairro = bairroSel === OUTRO || !bairros.length ? bairroOutro : bairroSel;
  const hoje = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function localizar() {
    if (endereco.trim().length < 5) {
      setErros((e) => ({ ...e, endereco: "Digite a rua e o número antes de localizar." }));
      return;
    }
    setBuscando(true);
    setGeoMsg("");
    try {
      const r = await geocodificar({ q: endereco.trim(), bairro: bairro.trim(), cidade: "Baturité", uf: "CE" });
      if (!r.length) setGeoMsg("Endereço não encontrado. Toque no mapa para marcar o local.");
      else {
        setLat(r[0].lat);
        setLng(r[0].lng);
        setGeoMsg(`Ponto encontrado (${r[0].rotulo_precisao ?? "aproximado"}). Arraste o pino para ajustar, se precisar.`);
      }
    } catch (e) {
      setGeoMsg((e as Error).message);
    } finally {
      setBuscando(false);
    }
  }

  function escolherFoto(f: File | null) {
    if (previa) URL.revokeObjectURL(previa);
    setPrevia("");
    setFoto(null);
    setErros((e) => ({ ...e, foto: "" }));
    if (!f) return;
    const erro = validarFoto(f);
    if (erro) return setErros((e) => ({ ...e, foto: erro }));
    setFoto(f);
    setPrevia(URL.createObjectURL(f));
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    if (!user || enviando) return;
    setErroGeral("");
    const r = esquemaSolicitacao.safeParse({
      endereco, bairro, latitude: lat, longitude: lng, materiais, quantidade,
      data_preferida: data || null, periodo, observacoes: obs.trim() || null,
    });
    if (!r.success) {
      const e: Record<string, string> = {};
      for (const i of r.error.issues) e[String(i.path[0])] ??= i.message;
      setErros(e);
      document.getElementById(`agc-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      const foto_path = foto ? await enviarFoto(user.id, foto) : null;
      const { data: novo, error } = await supabase
        .from("coleta_solicitacoes")
        .insert({ ...r.data, auth_user_id: user.id, foto_path })
        .select("id")
        .single();
      if (error || !novo) throw new Error("Não foi possível enviar o pedido. Tente de novo em instantes.");
      router.push(`/minhas-coletas?pedido=${novo.id}&novo=1`);
    } catch (e) {
      setErroGeral((e as Error).message);
      setEnviando(false);
    }
  }

  if (loading) return <Spinner centralizado />;
  if (!user || !perfil) return <PedirLogin />;
  if (perfil.tipo === "admin") {
    return (
      <PedirLogin
        titulo="Você está com uma conta administrativa"
        texto="Pedidos de coleta são feitos por contas de visitante. Pelo painel você acompanha e responde todos os pedidos."
        aviso="Para testar como visitante, saia e entre com uma conta de visitante."
      />
    );
  }

  const alternar = (m: string) => setMateriais((l) => (l.includes(m) ? l.filter((x) => x !== m) : [...l, m]));

  return (
    <form className="flex flex-col gap-4" onSubmit={enviar} noValidate>
      {/* 1. Local */}
      <fieldset className={BLOCO}>
        <legend className={TITULO_BLOCO}>
          <MapPin size={18} aria-hidden="true" /> Onde buscar
        </legend>

        <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <label className={CAMPO}>
            Bairro
            {bairros.length ? (
              <Select id="agc-bairro" value={bairroSel} onChange={(e) => setBairroSel(e.target.value)} invalido={!!erros.bairro}>
                <option value="">Escolha o bairro…</option>
                {bairros.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value={OUTRO}>Outro bairro</option>
              </Select>
            ) : (
              <Input id="agc-bairro" value={bairroOutro} maxLength={80} onChange={(e) => setBairroOutro(e.target.value)} placeholder="Seu bairro" invalido={!!erros.bairro} />
            )}
            {bairroSel === OUTRO && bairros.length > 0 && (
              <Input value={bairroOutro} maxLength={80} onChange={(e) => setBairroOutro(e.target.value)} placeholder="Digite o bairro" aria-label="Nome do bairro" />
            )}
            {erros.bairro && <span className={ERRO}>{erros.bairro}</span>}
          </label>

          <label className={CAMPO}>
            Endereço (rua, número e referência)
            <div className="flex gap-2">
              <Input
                id="agc-endereco"
                value={endereco}
                maxLength={200}
                autoComplete="street-address"
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex.: Rua Kaolim, 252"
                invalido={!!erros.endereco}
                className="min-w-0 flex-1"
              />
              <Button variante="secundario" onClick={() => void localizar()} disabled={buscando} className="shrink-0 whitespace-nowrap">
                {buscando ? <Spinner tamanho={16} /> : <LocateFixed size={16} aria-hidden="true" />}
                <span className="max-sm:hidden">Localizar</span>
              </Button>
            </div>
            {erros.endereco && <span className={ERRO}>{erros.endereco}</span>}
          </label>
        </div>

        <div className="h-[clamp(260px,42dvh,380px)] [&_.mapa-wrap--seletor]:h-full">
          <MapaSeletor latitude={lat} longitude={lng} categoria="Coleta" onChange={(a, b) => { setLat(a); setLng(b); setGeoMsg("Ponto marcado no mapa."); }} />
        </div>
        <p className="text-xs text-ink-muted" aria-live="polite">
          {geoMsg || "Use “Localizar” ou toque no mapa para marcar o local exato. O pino pode ser arrastado."}
        </p>
      </fieldset>

      {/* 2. Material */}
      <fieldset className={BLOCO}>
        <legend className={TITULO_BLOCO}>O que vamos recolher</legend>
        <div className={CAMPO}>
          <span id="agc-materiais-rotulo">Tipos de material</span>
          <div id="agc-materiais" className="flex flex-wrap gap-1.5" role="group" aria-labelledby="agc-materiais-rotulo" tabIndex={-1}>
            {MATERIAIS_COLETA.map((m) => (
              <button key={m} type="button" aria-pressed={materiais.includes(m)} className={chip(materiais.includes(m))} onClick={() => alternar(m)}>
                {materiais.includes(m) && <CheckCircle2 size={14} aria-hidden="true" />} {m}
              </button>
            ))}
          </div>
          {erros.materiais && <span className={ERRO}>{erros.materiais}</span>}
        </div>
        <label className={CAMPO}>
          Quantidade aproximada
          <Select id="agc-quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} invalido={!!erros.quantidade}>
            <option value="">Escolha…</option>
            {QUANTIDADES.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </Select>
          {erros.quantidade && <span className={ERRO}>{erros.quantidade}</span>}
        </label>
      </fieldset>

      {/* 3. Quando */}
      <fieldset className={BLOCO}>
        <legend className={TITULO_BLOCO}>Quando prefere</legend>
        <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <label className={CAMPO}>
            Data preferida (opcional)
            <Input id="agc-data_preferida" type="date" min={hoje} value={data} onChange={(e) => setData(e.target.value)} invalido={!!erros.data_preferida} />
            {erros.data_preferida && <span className={ERRO}>{erros.data_preferida}</span>}
          </label>
          <div className={CAMPO}>
            <span>Período</span>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Período">
              {(Object.keys(PERIODOS) as Periodo[]).map((p) => (
                <button key={p} type="button" role="radio" aria-checked={periodo === p} className={chip(periodo === p)} onClick={() => setPeriodo(p)}>
                  {PERIODOS[p]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className={CAMPO}>
          Observações (opcional)
          <Textarea id="agc-observacoes" rows={3} maxLength={1000} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: material separado na garagem; tocar o interfone." className="resize-y" />
          <span className="self-end text-xs font-medium text-zinc-400">{obs.length}/1000</span>
        </label>

        <div className={CAMPO}>
          <span>Foto do material (opcional)</span>
          {previa ? (
            <div className="flex flex-wrap items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previa} alt="Prévia da foto do material" className="h-24 w-32 rounded-xl border border-zinc-200 object-cover" />
              <Button variante="secundario" onClick={() => escolherFoto(null)}>
                <Trash2 size={15} aria-hidden="true" /> Remover
              </Button>
            </div>
          ) : (
            <label className="relative flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-brand-line bg-green-50 p-4 text-sm font-semibold text-emerald-800 focus-within:outline-3 focus-within:outline-brand/30">
              <Camera size={20} aria-hidden="true" />
              <span>Toque para escolher uma foto (JPG, PNG ou WEBP, até 5 MB)</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => escolherFoto(e.target.files?.[0] ?? null)} className="absolute inset-0 cursor-pointer opacity-0" />
            </label>
          )}
          {erros.foto && <span className={ERRO}>{erros.foto}</span>}
        </div>
      </fieldset>

      {erroGeral && (
        <p className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {erroGeral}
        </p>
      )}

      <div className="flex flex-col-reverse items-stretch gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <Link href="/calendario-coleta" className="text-sm font-bold text-brand underline">
          Ver calendário do meu bairro
        </Link>
        <Button type="submit" tamanho="grande" carregando={enviando} className="w-full sm:w-auto">
          {!enviando && <Send size={18} aria-hidden="true" />}
          {enviando ? "Enviando…" : "Enviar pedido de coleta"}
        </Button>
      </div>
    </form>
  );
}

// ----- Classes repetidas do formulário -----
const BLOCO = "flex min-w-0 flex-col gap-3.5 rounded-3xl border border-brand-line/60 bg-white p-4 shadow-[0_10px_28px_-22px_rgb(46_94_78/0.5)] sm:p-5";
const TITULO_BLOCO = "inline-flex items-center gap-2 px-1 text-base font-black text-emerald-900";
const CAMPO = "flex min-w-0 flex-col gap-1.5 text-sm font-bold text-zinc-700";
const ERRO = "text-xs font-semibold text-red-600";

/** Botão de escolha (material, período): verde quando marcado */
const chip = (ativo: boolean) =>
  cn(
    "inline-flex min-h-10 items-center gap-1 rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-bold transition",
    ativo ? "border-brand bg-brand text-white" : "border-brand-line/60 bg-white text-zinc-700 hover:border-emerald-300",
  );
