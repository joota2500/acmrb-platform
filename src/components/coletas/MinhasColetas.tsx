"use client";

/**
 * MinhasColetas — pedidos do visitante logado (/minhas-coletas)
 * ------------------------------------------------------------
 * Lista à esquerda (ou em cima, no celular) e detalhe do pedido
 * escolhido: linha do tempo, dados, foto, cancelar e chat.
 * ?pedido=<id> abre um pedido; &novo=1 mostra a confirmação de envio.
 * CSS: src/styles/minhas-coletas.css (prefixo "mcol").
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2, ChevronLeft, Loader2, PackagePlus, XCircle } from "lucide-react";
import "@/styles/minhas-coletas.css";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import PedirLogin from "@/components/coletas/PedirLogin";
import ChatColeta from "@/components/coletas/ChatColeta";
import LinhaTempoColeta from "@/components/coletas/LinhaTempoColeta";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PERIODOS, ROTULO_STATUS, dataBR, dataHoraBR, urlFoto, type Solicitacao } from "@/lib/coletas";

export default function MinhasColetas() {
  const { user, perfil, loading } = useAuth();
  const [lista, setLista] = useState<Solicitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [novo, setNovo] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);
  const [cancelar, setCancelar] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("coleta_solicitacoes")
      .select("*")
      .eq("auth_user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) setErro("Não foi possível carregar seus pedidos (a migration de coletas já foi rodada?).");
    else setLista((data ?? []) as Solicitacao[]);
    setCarregando(false);
  }, [user]);

  // Lê ?pedido= e ?novo= uma vez
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("pedido")) setAbertoId(p.get("pedido"));
    if (p.get("novo")) setNovo(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    void carregar();
    // status muda pelo painel: atualiza a cada 30 s
    const t = setInterval(() => document.visibilityState === "visible" && void carregar(), 30_000);
    return () => clearInterval(t);
  }, [user, carregar]);

  const aberto = lista.find((s) => s.id === abertoId) ?? null;

  useEffect(() => {
    setFoto(null);
    if (aberto?.foto_path) void urlFoto(aberto.foto_path).then(setFoto);
  }, [aberto?.id, aberto?.foto_path]);

  async function confirmarCancelamento() {
    if (!aberto) return;
    setSalvando(true);
    const { error } = await supabase.from("coleta_solicitacoes").update({ status: "cancelado" }).eq("id", aberto.id);
    setSalvando(false);
    setCancelar(false);
    if (error) setErro("Não foi possível cancelar o pedido.");
    else void carregar();
  }

  if (loading) return <p className="pcol__carregando"><Loader2 className="mcol-giro" aria-label="Carregando" /></p>;
  if (!user || !perfil) return <PedirLogin titulo="Entre para ver suas coletas" />;
  if (perfil.tipo === "admin") {
    return <PedirLogin titulo="Conta administrativa" texto="Os pedidos de coleta são acompanhados no painel, na seção Coletas." />;
  }

  return (
    <div className={`mcol${aberto ? " mcol--detalhe" : ""}`}>
      {novo && (
        <p className="mcol-sucesso" role="status">
          <CheckCircle2 size={18} aria-hidden="true" /> Pedido enviado! A equipe vai analisar e responder por aqui.
        </p>
      )}

      <aside className="mcol-lista" aria-label="Seus pedidos">
        <div className="mcol-lista__topo">
          <h2>Seus pedidos</h2>
          <Link href="/agendar-coleta" className="mcol-novo"><PackagePlus size={16} aria-hidden="true" /> Novo</Link>
        </div>
        {carregando ? (
          <p className="mcol-vazio"><Loader2 size={16} className="mcol-giro" aria-hidden="true" /> Carregando…</p>
        ) : erro ? (
          <p className="mcol-vazio">{erro}</p>
        ) : lista.length === 0 ? (
          <div className="mcol-vazio">
            <p>Você ainda não pediu nenhuma coleta.</p>
            <Link href="/agendar-coleta" className="pcol__btn">Agendar coleta</Link>
          </div>
        ) : (
          <ul>
            {lista.map((s) => (
              <li key={s.id}>
                <button type="button" className={`mcol-item${s.id === abertoId ? " mcol-item--ativo" : ""}`} onClick={() => { setAbertoId(s.id); setNovo(false); }}>
                  <span className={`mcol-status mcol-status--${s.status}`}>{ROTULO_STATUS[s.status]}</span>
                  <strong>{s.bairro}</strong>
                  <span>{s.materiais.join(", ")}</span>
                  <small>Pedido em {dataHoraBR(s.created_at)}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="mcol-detalhe" aria-label="Detalhes do pedido">
        {!aberto ? (
          <p className="mcol-vazio mcol-vazio--grande">Escolha um pedido para ver o andamento e conversar com a equipe.</p>
        ) : (
          <>
            <button type="button" className="mcol-voltar" onClick={() => setAbertoId(null)}><ChevronLeft size={16} aria-hidden="true" /> Todos os pedidos</button>
            <div className="mcol-cartao">
              <div className="mcol-cartao__topo">
                <div>
                  <h2>Coleta em {aberto.bairro}</h2>
                  <p>{aberto.endereco}</p>
                </div>
                <span className={`mcol-status mcol-status--${aberto.status}`}>{ROTULO_STATUS[aberto.status]}</span>
              </div>

              <LinhaTempoColeta s={aberto} />

              {aberto.data_agendada && aberto.status === "agendado" && (
                <p className="mcol-agenda"><CalendarClock size={18} aria-hidden="true" /> Coleta marcada para <strong>{dataBR(aberto.data_agendada)}</strong>{aberto.janela_agendada ? ` · ${aberto.janela_agendada}` : ""}</p>
              )}

              <dl className="mcol-dados">
                <div><dt>Materiais</dt><dd>{aberto.materiais.join(", ")}</dd></div>
                <div><dt>Quantidade</dt><dd>{aberto.quantidade}</dd></div>
                <div><dt>Preferência</dt><dd>{aberto.data_preferida ? dataBR(aberto.data_preferida) : "Sem data"} · {PERIODOS[aberto.periodo]}</dd></div>
                {aberto.observacoes && <div className="mcol-dados__largo"><dt>Observações</dt><dd>{aberto.observacoes}</dd></div>}
              </dl>

              {foto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="mcol-foto" src={foto} alt="Foto do material enviada no pedido" />
              )}

              {["enviado", "recebido", "agendado"].includes(aberto.status) && (
                <button type="button" className="mcol-cancelar" onClick={() => setCancelar(true)}>
                  <XCircle size={16} aria-hidden="true" /> Cancelar pedido
                </button>
              )}
            </div>

            <h3 className="mcol-chat-titulo">Conversa com a ACMRB</h3>
            <ChatColeta
              solicitacaoId={aberto.id}
              usuarioId={user.id}
              lado="visitante"
              nome={perfil.nome ?? "Visitante"}
              bloqueado={aberto.status === "cancelado" || aberto.status === "concluido"}
            />
          </>
        )}
      </section>

      <ConfirmDialog
        aberto={cancelar}
        titulo="Cancelar este pedido?"
        mensagem="A equipe será avisada pelo status do pedido. Você pode fazer um novo pedido quando quiser."
        textoConfirmar="Cancelar pedido"
        perigo
        carregando={salvando}
        onConfirmar={confirmarCancelamento}
        onCancelar={() => setCancelar(false)}
      />
    </div>
  );
}
