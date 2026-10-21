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
 * CSS: src/styles/agendar-coleta.css (prefixo "agc").
 */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, Loader2, LocateFixed, MapPin, Send, Trash2 } from "lucide-react";

import "@/styles/agendar-coleta.css";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { geocodificar } from "@/lib/apoiadoresAdmin";
import PedirLogin from "@/components/coletas/PedirLogin";
import {
  MATERIAIS_COLETA, PERIODOS, enviarFoto, esquemaSolicitacao, listarCalendario, validarFoto, type Periodo,
} from "@/lib/coletas";

const MapaSeletor = dynamic(() => import("@/components/mapa/MapaSeletor"), {
  ssr: false,
  loading: () => <div className="agc-mapa-carregando">Carregando mapa…</div>,
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

  if (loading) return <p className="pcol__carregando"><Loader2 className="agc-giro" aria-label="Carregando" /></p>;
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
    <form className="agc" onSubmit={enviar} noValidate>
      {/* 1. Local */}
      <fieldset className="agc-bloco">
        <legend className="agc-bloco__titulo"><MapPin size={18} aria-hidden="true" /> Onde buscar</legend>

        <div className="agc-linha">
          <label className="agc-campo">
            Bairro
            {bairros.length ? (
              <select id="agc-bairro" value={bairroSel} onChange={(e) => setBairroSel(e.target.value)} aria-invalid={!!erros.bairro}>
                <option value="">Escolha o bairro…</option>
                {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
                <option value={OUTRO}>Outro bairro</option>
              </select>
            ) : (
              <input id="agc-bairro" value={bairroOutro} maxLength={80} onChange={(e) => setBairroOutro(e.target.value)} placeholder="Seu bairro" aria-invalid={!!erros.bairro} />
            )}
            {bairroSel === OUTRO && bairros.length > 0 && (
              <input value={bairroOutro} maxLength={80} onChange={(e) => setBairroOutro(e.target.value)} placeholder="Digite o bairro" aria-label="Nome do bairro" />
            )}
            {erros.bairro && <span className="agc-erro">{erros.bairro}</span>}
          </label>

          <label className="agc-campo agc-campo--largo">
            Endereço (rua, número e referência)
            <div className="agc-com-botao">
              <input id="agc-endereco" value={endereco} maxLength={200} autoComplete="street-address" onChange={(e) => setEndereco(e.target.value)} placeholder="Ex.: Rua Kaolim, 252" aria-invalid={!!erros.endereco} />
              <button type="button" className="agc-btn agc-btn--leve" onClick={() => void localizar()} disabled={buscando}>
                {buscando ? <Loader2 size={16} className="agc-giro" aria-hidden="true" /> : <LocateFixed size={16} aria-hidden="true" />}
                <span>Localizar</span>
              </button>
            </div>
            {erros.endereco && <span className="agc-erro">{erros.endereco}</span>}
          </label>
        </div>

        <div className="agc-mapa">
          <MapaSeletor latitude={lat} longitude={lng} categoria="Coleta" onChange={(a, b) => { setLat(a); setLng(b); setGeoMsg("Ponto marcado no mapa."); }} />
        </div>
        <p className="agc-dica" aria-live="polite">{geoMsg || "Use “Localizar” ou toque no mapa para marcar o local exato. O pino pode ser arrastado."}</p>
      </fieldset>

      {/* 2. Material */}
      <fieldset className="agc-bloco">
        <legend className="agc-bloco__titulo">O que vamos recolher</legend>
        <div className="agc-campo">
          <span id="agc-materiais-rotulo">Tipos de material</span>
          <div id="agc-materiais" className="agc-chips" role="group" aria-labelledby="agc-materiais-rotulo" tabIndex={-1}>
            {MATERIAIS_COLETA.map((m) => (
              <button key={m} type="button" aria-pressed={materiais.includes(m)} className={`agc-chip${materiais.includes(m) ? " agc-chip--ativo" : ""}`} onClick={() => alternar(m)}>
                {materiais.includes(m) && <CheckCircle2 size={14} aria-hidden="true" />} {m}
              </button>
            ))}
          </div>
          {erros.materiais && <span className="agc-erro">{erros.materiais}</span>}
        </div>
        <label className="agc-campo">
          Quantidade aproximada
          <select id="agc-quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} aria-invalid={!!erros.quantidade}>
            <option value="">Escolha…</option>
            {QUANTIDADES.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
          {erros.quantidade && <span className="agc-erro">{erros.quantidade}</span>}
        </label>
      </fieldset>

      {/* 3. Quando */}
      <fieldset className="agc-bloco">
        <legend className="agc-bloco__titulo">Quando prefere</legend>
        <div className="agc-linha">
          <label className="agc-campo">
            Data preferida (opcional)
            <input id="agc-data_preferida" type="date" min={hoje} value={data} onChange={(e) => setData(e.target.value)} aria-invalid={!!erros.data_preferida} />
            {erros.data_preferida && <span className="agc-erro">{erros.data_preferida}</span>}
          </label>
          <div className="agc-campo">
            <span>Período</span>
            <div className="agc-chips" role="radiogroup" aria-label="Período">
              {(Object.keys(PERIODOS) as Periodo[]).map((p) => (
                <button key={p} type="button" role="radio" aria-checked={periodo === p} className={`agc-chip${periodo === p ? " agc-chip--ativo" : ""}`} onClick={() => setPeriodo(p)}>
                  {PERIODOS[p]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="agc-campo">
          Observações (opcional)
          <textarea id="agc-observacoes" rows={3} maxLength={1000} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: material separado na garagem; tocar o interfone." />
          <span className="agc-contador">{obs.length}/1000</span>
        </label>

        <div className="agc-campo">
          <span>Foto do material (opcional)</span>
          {previa ? (
            <div className="agc-foto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previa} alt="Prévia da foto do material" />
              <button type="button" className="agc-btn agc-btn--leve" onClick={() => escolherFoto(null)}><Trash2 size={15} aria-hidden="true" /> Remover</button>
            </div>
          ) : (
            <label className="agc-upload">
              <Camera size={20} aria-hidden="true" />
              <span>Toque para escolher uma foto (JPG, PNG ou WEBP, até 5 MB)</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => escolherFoto(e.target.files?.[0] ?? null)} />
            </label>
          )}
          {erros.foto && <span className="agc-erro">{erros.foto}</span>}
        </div>
      </fieldset>

      {erroGeral && <p className="agc-alerta" role="alert">{erroGeral}</p>}

      <div className="agc-rodape">
        <Link href="/calendario-coleta" className="agc-link">Ver calendário do meu bairro</Link>
        <button type="submit" className="agc-btn agc-btn--enviar" disabled={enviando}>
          {enviando ? <Loader2 size={18} className="agc-giro" aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
          {enviando ? "Enviando…" : "Enviar pedido de coleta"}
        </button>
      </div>
    </form>
  );
}
