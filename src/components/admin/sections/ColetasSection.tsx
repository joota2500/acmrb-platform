"use client";

/**
 * Seção "Coletas" do painel (deus e admin normal)
 * ------------------------------------------------------------
 * Abas:
 *  - Pedidos: lista com filtros (status, bairro, data do pedido) e
 *    contagem de mensagens não lidas.
 *  - Mapa: pedidos no mapa (cor = status).
 *  - Rota do dia: agendados para a data escolhida, ordenados por
 *    bairro, com link de rota no Google Maps encadeando os endereços.
 * Detalhe (gaveta): ao abrir, "enviado" vira "recebido"; mostra foto,
 * linha do tempo, permite mudar status e data agendada; e o chat.
 * RLS: is_active_admin(). CSS: src/styles/admin-coletas.css ("adcol").
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ExternalLink, Loader2, MapPin, MessageCircle, Navigation, RefreshCw, Save, X } from "lucide-react";
import "@/styles/admin-coletas.css";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ToastArea, useToast } from "@/components/ui/Toast";
import ChatColeta from "@/components/coletas/ChatColeta";
import LinhaTempoColeta from "@/components/coletas/LinhaTempoColeta";
import {
  PERIODOS, ROTULO_STATUS, STATUS_COLETA, dataBR, dataHoraBR, linkRota, urlFoto, type Solicitacao, type StatusColeta,
} from "@/lib/coletas";

const MapaColetas = dynamic(() => import("@/components/mapa/MapaColetas"), {
  ssr: false,
  loading: () => <div className="adcol-mapa-carregando">Carregando mapa…</div>,
});

type Aba = "pedidos" | "mapa" | "rota";
const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const diaLocal = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function ColetasSection() {
  const { user, perfil } = useAuth();
  const { toasts, mostrar, fechar } = useToast();
  const [aba, setAba] = useState<Aba>("pedidos");
  const [lista, setLista] = useState<Solicitacao[]>([]);
  const [naoLidas, setNaoLidas] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [fStatus, setFStatus] = useState<StatusColeta | "">("");
  const [fBairro, setFBairro] = useState("");
  const [fData, setFData] = useState("");
  const [diaRota, setDiaRota] = useState(hojeISO());
  const [abertoId, setAbertoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const { data, error } = await supabase.from("coleta_solicitacoes").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) {
      mostrar("erro", "Não foi possível carregar os pedidos. A migration de coletas já foi rodada?");
      setCarregando(false);
      return;
    }
    setLista((data ?? []) as Solicitacao[]);
    // mensagens de visitantes ainda não lidas, por pedido
    const { data: msgs } = await supabase.from("coleta_mensagens").select("solicitacao_id").eq("autor_tipo", "visitante").is("lida_em", null).limit(1000);
    const mapa: Record<string, number> = {};
    for (const m of (msgs ?? []) as { solicitacao_id: string }[]) mapa[m.solicitacao_id] = (mapa[m.solicitacao_id] ?? 0) + 1;
    setNaoLidas(mapa);
    setCarregando(false);
  }, [mostrar]);

  useEffect(() => {
    void carregar();
    const t = setInterval(() => document.visibilityState === "visible" && void carregar(), 30_000);
    return () => clearInterval(t);
  }, [carregar]);

  const bairros = useMemo(() => Array.from(new Set(lista.map((s) => s.bairro))).sort((a, b) => a.localeCompare(b, "pt-BR")), [lista]);
  const filtrados = lista.filter(
    (s) => (!fStatus || s.status === fStatus) && (!fBairro || s.bairro === fBairro) && (!fData || diaLocal(s.created_at) === fData),
  );
  const rota = lista
    .filter((s) => s.status === "agendado" && s.data_agendada === diaRota)
    .sort((a, b) => a.bairro.localeCompare(b.bairro, "pt-BR") || a.endereco.localeCompare(b.endereco, "pt-BR"));
  const urlRota = linkRota(rota);
  const contagem = (st: StatusColeta) => lista.filter((s) => s.status === st).length;
  const aberto = lista.find((s) => s.id === abertoId) ?? null;

  return (
    <div className="adcol">
      <ul className="adcol-resumo" aria-label="Pedidos por status">
        {STATUS_COLETA.map((st) => (
          <li key={st}>
            <button type="button" className={`adcol-resumo__item adcol-st--${st}${fStatus === st ? " adcol-resumo__item--ativo" : ""}`} onClick={() => { setFStatus(fStatus === st ? "" : st); setAba("pedidos"); }}>
              <strong>{contagem(st)}</strong>
              <span>{ROTULO_STATUS[st]}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="adcol-abas" role="tablist">
        {(["pedidos", "mapa", "rota"] as Aba[]).map((a) => (
          <button key={a} type="button" role="tab" aria-selected={aba === a} className={`adcol-aba${aba === a ? " adcol-aba--ativa" : ""}`} onClick={() => setAba(a)}>
            {a === "pedidos" ? "Pedidos" : a === "mapa" ? "Mapa" : "Rota do dia"}
          </button>
        ))}
        <button type="button" className="adcol-atualizar" onClick={() => void carregar()} aria-label="Atualizar"><RefreshCw size={16} /></button>
      </div>

      {aba !== "rota" && (
        <div className="adcol-filtros">
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value as StatusColeta | "")} aria-label="Filtrar por status">
            <option value="">Todos os status</option>
            {STATUS_COLETA.map((s) => <option key={s} value={s}>{ROTULO_STATUS[s]}</option>)}
          </select>
          <select value={fBairro} onChange={(e) => setFBairro(e.target.value)} aria-label="Filtrar por bairro">
            <option value="">Todos os bairros</option>
            {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <label className="adcol-data">
            <span>Pedido em</span>
            <input type="date" value={fData} onChange={(e) => setFData(e.target.value)} />
          </label>
          {(fStatus || fBairro || fData) && (
            <button type="button" className="adcol-btn adcol-btn--leve" onClick={() => { setFStatus(""); setFBairro(""); setFData(""); }}>Limpar</button>
          )}
        </div>
      )}

      {carregando ? (
        <p className="adcol-vazio"><Loader2 size={18} className="adcol-giro" aria-hidden="true" /> Carregando pedidos…</p>
      ) : aba === "pedidos" ? (
        filtrados.length === 0 ? (
          <p className="adcol-vazio">{lista.length ? "Nenhum pedido com esses filtros." : "Nenhum pedido de coleta recebido ainda."}</p>
        ) : (
          <ul className="adcol-lista">
            {filtrados.map((s) => (
              <li key={s.id}>
                <button type="button" className="adcol-item" onClick={() => setAbertoId(s.id)}>
                  <span className={`adcol-selo adcol-st--${s.status}`}>{ROTULO_STATUS[s.status]}</span>
                  <span className="adcol-item__principal">
                    <strong>{s.bairro}</strong>
                    <span>{s.endereco}</span>
                  </span>
                  <span className="adcol-item__meta">
                    <span>{s.materiais.join(", ")} · {s.quantidade}</span>
                    <small>{s.data_agendada ? `Agendado: ${dataBR(s.data_agendada)}` : `Pedido em ${dataHoraBR(s.created_at)}`}</small>
                  </span>
                  {naoLidas[s.id] ? <span className="adcol-badge" aria-label={`${naoLidas[s.id]} mensagens não lidas`}><MessageCircle size={13} aria-hidden="true" /> {naoLidas[s.id]}</span> : null}
                </button>
              </li>
            ))}
          </ul>
        )
      ) : aba === "mapa" ? (
        <div className="adcol-mapa">
          <MapaColetas pedidos={filtrados} onSelecionar={setAbertoId} />
          <p className="adcol-legenda">{filtrados.filter((s) => s.latitude == null).length} pedido(s) sem ponto no mapa não aparecem aqui.</p>
        </div>
      ) : (
        <div className="adcol-rota">
          <div className="adcol-rota__topo">
            <label className="adcol-data">
              <span>Data</span>
              <input type="date" value={diaRota} onChange={(e) => setDiaRota(e.target.value)} />
            </label>
            {urlRota && (
              <a className="adcol-btn" href={urlRota} target="_blank" rel="noopener noreferrer">
                <Navigation size={16} aria-hidden="true" /> Abrir rota no Google Maps
              </a>
            )}
          </div>
          {rota.length === 0 ? (
            <p className="adcol-vazio">Nenhuma coleta agendada para {dataBR(diaRota)}.</p>
          ) : (
            <>
              {rota.length > 10 && <p className="adcol-legenda">O Google Maps aceita até 10 paradas por rota; divida o trajeto se necessário.</p>}
              <ol className="adcol-paradas">
                {rota.map((s, i) => (
                  <li key={s.id}>
                    <span className="adcol-paradas__n">{i + 1}</span>
                    <button type="button" onClick={() => setAbertoId(s.id)}>
                      <strong>{s.bairro} — {s.endereco}</strong>
                      <span>{s.janela_agendada || PERIODOS[s.periodo]} · {s.materiais.join(", ")} · {s.quantidade}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}

      {aberto && user && (
        <DetalheColeta
          s={aberto}
          adminId={user.id}
          adminNome={perfil?.nome ?? "Equipe"}
          onFechar={() => setAbertoId(null)}
          onSalvo={(msg) => { mostrar("sucesso", msg); void carregar(); }}
          onErro={(msg) => mostrar("erro", msg)}
          onLidas={() => setNaoLidas((m) => ({ ...m, [aberto.id]: 0 }))}
        />
      )}
      <ToastArea toasts={toasts} onFechar={fechar} />
    </div>
  );
}

/* ---------- Gaveta de detalhe ---------- */
function DetalheColeta({
  s, adminId, adminNome, onFechar, onSalvo, onErro, onLidas,
}: {
  s: Solicitacao; adminId: string; adminNome: string;
  onFechar: () => void; onSalvo: (m: string) => void; onErro: (m: string) => void; onLidas: () => void;
}) {
  const [status, setStatus] = useState<StatusColeta>(s.status);
  const [data, setData] = useState(s.data_agendada ?? "");
  const [janela, setJanela] = useState(s.janela_agendada ?? "");
  const [foto, setFoto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Ao abrir: "enviado" vira "recebido" automaticamente
  useEffect(() => {
    if (s.status === "enviado") {
      void supabase.from("coleta_solicitacoes").update({ status: "recebido" }).eq("id", s.id).eq("status", "enviado")
        .then(({ error }) => { if (!error) onSalvo("Pedido marcado como recebido."); });
    }
    onLidas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.id]);

  useEffect(() => {
    setStatus(s.status);
    setData(s.data_agendada ?? "");
    setJanela(s.janela_agendada ?? "");
  }, [s.status, s.data_agendada, s.janela_agendada]);

  useEffect(() => {
    if (s.foto_path) void urlFoto(s.foto_path).then(setFoto);
  }, [s.foto_path]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);

  async function salvar() {
    if (status === "agendado" && !data) return onErro("Informe a data agendada.");
    setSalvando(true);
    const { error } = await supabase
      .from("coleta_solicitacoes")
      .update({ status, data_agendada: data || null, janela_agendada: janela.trim() || null })
      .eq("id", s.id);
    setSalvando(false);
    if (error) return onErro("Não foi possível salvar.");
    onSalvo("Pedido atualizado.");
  }

  const mapsLink = s.latitude != null
    ? `https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.endereco}, ${s.bairro}, Baturité - CE`)}`;

  return (
    <div className="adcol-fundo" onClick={onFechar} role="presentation">
      <aside className="adcol-gaveta" role="dialog" aria-modal="true" aria-labelledby="adcol-titulo" onClick={(e) => e.stopPropagation()}>
        <header className="adcol-gaveta__topo">
          <div>
            <h2 id="adcol-titulo">Coleta em {s.bairro}</h2>
            <p>Pedido em {dataHoraBR(s.created_at)}</p>
          </div>
          <button type="button" className="adcol-fechar" onClick={onFechar} aria-label="Fechar"><X size={20} /></button>
        </header>

        <div className="adcol-gaveta__corpo">
          <LinhaTempoColeta s={s} />

          <dl className="adcol-dados">
            <div className="adcol-dados__largo"><dt>Endereço</dt><dd>{s.endereco} <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="adcol-link"><MapPin size={13} aria-hidden="true" /> mapa <ExternalLink size={11} aria-hidden="true" /></a></dd></div>
            <div><dt>Materiais</dt><dd>{s.materiais.join(", ")}</dd></div>
            <div><dt>Quantidade</dt><dd>{s.quantidade}</dd></div>
            <div><dt>Preferência</dt><dd>{s.data_preferida ? dataBR(s.data_preferida) : "Sem data"} · {PERIODOS[s.periodo]}</dd></div>
            {s.observacoes && <div className="adcol-dados__largo"><dt>Observações</dt><dd>{s.observacoes}</dd></div>}
          </dl>

          {foto && (
            <a href={foto} target="_blank" rel="noopener noreferrer" className="adcol-foto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="Foto do material enviada pelo visitante" />
            </a>
          )}

          <div className="adcol-edicao">
            <label>
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value as StatusColeta)}>
                {STATUS_COLETA.map((st) => <option key={st} value={st}>{ROTULO_STATUS[st]}</option>)}
              </select>
            </label>
            <label>
              Data agendada
              <input type="date" value={data} onChange={(e) => { setData(e.target.value); if (e.target.value && (status === "enviado" || status === "recebido")) setStatus("agendado"); }} />
            </label>
            <label>
              Janela / horário
              <input value={janela} maxLength={60} onChange={(e) => setJanela(e.target.value)} placeholder="Ex.: 8h às 11h" />
            </label>
            <button type="button" className="adcol-btn" onClick={() => void salvar()} disabled={salvando}>
              {salvando ? <Loader2 size={16} className="adcol-giro" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />} Salvar
            </button>
          </div>

          <h3 className="adcol-chat-titulo">Conversa com o visitante</h3>
          <ChatColeta solicitacaoId={s.id} usuarioId={adminId} lado="admin" nome={adminNome} />
        </div>
      </aside>
    </div>
  );
}
