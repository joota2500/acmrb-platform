"use client";

/**
 * MinhasColetas — pedidos do visitante logado (/minhas-coletas)
 * ------------------------------------------------------------
 * Lista à esquerda (ou em cima, no celular) e detalhe do pedido
 * escolhido: linha do tempo, dados, foto, cancelar e chat.
 * ?pedido=<id> abre um pedido; &novo=1 mostra a confirmação de envio.
 * Visual: Tailwind + ui (Badge, Button, Spinner).
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2, ChevronLeft, PackagePlus, XCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import PedirLogin from "@/components/coletas/PedirLogin";
import ChatColeta from "@/components/coletas/ChatColeta";
import LinhaTempoColeta from "@/components/coletas/LinhaTempoColeta";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PERIODOS, ROTULO_STATUS, dataBR, dataHoraBR, urlFoto, type Solicitacao } from "@/services/coletas";
import { EsqueletoLista } from "@/components/ui/Esqueleto";

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

  if (loading) return <Spinner centralizado />;
  if (!user || !perfil) return <PedirLogin titulo="Entre para ver suas coletas" />;
  if (perfil.tipo === "admin") {
    return <PedirLogin titulo="Conta administrativa" texto="Os pedidos de coleta são acompanhados no painel, na seção Coletas." />;
  }

  return (
    <div className={cn("grid items-start gap-5 min-[900px]:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]")}>
      {novo && (
        <p className="flex items-center gap-2 rounded-2xl bg-brand-mint px-4 py-3 text-sm font-bold text-[#1f4a3c] min-[900px]:col-span-full" role="status">
          <CheckCircle2 size={18} aria-hidden="true" /> Pedido enviado! A equipe vai analisar e responder por aqui.
        </p>
      )}

      {/* Lista de pedidos (no celular e tablet some quando um pedido está aberto) */}
      <aside
        className={cn(
          "flex-col gap-3 rounded-3xl border border-brand-line/60 bg-white p-4 min-[900px]:sticky min-[900px]:top-24 min-[900px]:flex min-[900px]:max-h-[calc(100dvh-8rem)]",
          aberto ? "hidden" : "flex",
        )}
        aria-label="Seus pedidos"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-zinc-900">Seus pedidos</h2>
          <Link href="/agendar-coleta" className="inline-flex items-center gap-1 rounded-xl bg-brand-soft px-3 py-1.5 text-sm font-extrabold text-brand">
            <PackagePlus size={16} aria-hidden="true" /> Novo
          </Link>
        </div>
        {carregando ? (
          <EsqueletoLista quantidade={3} rotulo="Carregando seus pedidos" />
        ) : erro ? (
          <p className={VAZIO}>{erro}</p>
        ) : lista.length === 0 ? (
          <div className={VAZIO}>
            <p>Você ainda não pediu nenhuma coleta.</p>
            <Button href="/agendar-coleta">Agendar coleta</Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-2 overflow-y-auto">
            {lista.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full flex-col items-start gap-1 rounded-2xl border p-3 text-left transition",
                    s.id === abertoId ? "border-brand bg-brand-soft" : "border-zinc-100 bg-[#fafcfb] hover:border-brand-line",
                  )}
                  onClick={() => {
                    setAbertoId(s.id);
                    setNovo(false);
                  }}
                >
                  <StatusColeta status={s.status} />
                  <strong className="text-sm text-zinc-900">{s.bairro}</strong>
                  <span className="text-xs text-zinc-600">{s.materiais.join(", ")}</span>
                  <small className="text-[0.72rem] text-zinc-400">Pedido em {dataHoraBR(s.created_at)}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Detalhe do pedido escolhido */}
      <section className={cn("min-w-0 flex-col gap-4 min-[900px]:flex", aberto ? "flex" : "hidden")} aria-label="Detalhes do pedido">
        {!aberto ? (
          <p className={cn(VAZIO, "rounded-3xl border border-dashed border-brand-line bg-white px-4 py-12")}>
            Escolha um pedido para ver o andamento e conversar com a equipe.
          </p>
        ) : (
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1 self-start text-sm font-bold text-brand min-[900px]:hidden"
              onClick={() => setAbertoId(null)}
            >
              <ChevronLeft size={16} aria-hidden="true" /> Todos os pedidos
            </button>
            <div className="flex flex-col gap-4.5 rounded-3xl border border-brand-line/60 bg-white p-4 sm:p-5">
              <div className="flex flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:gap-4">
                <div>
                  <h2 className="text-lg font-black text-zinc-900">Coleta em {aberto.bairro}</h2>
                  <p className="text-sm text-ink-muted">{aberto.endereco}</p>
                </div>
                <StatusColeta status={aberto.status} />
              </div>

              <LinhaTempoColeta s={aberto} />

              {aberto.data_agendada && aberto.status === "agendado" && (
                <p className="flex items-center gap-2 rounded-2xl bg-warning-soft px-3.5 py-3 text-sm text-amber-800">
                  <CalendarClock size={18} aria-hidden="true" /> Coleta marcada para <strong>{dataBR(aberto.data_agendada)}</strong>
                  {aberto.janela_agendada ? ` · ${aberto.janela_agendada}` : ""}
                </p>
              )}

              <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Dado titulo="Materiais">{aberto.materiais.join(", ")}</Dado>
                <Dado titulo="Quantidade">{aberto.quantidade}</Dado>
                <Dado titulo="Preferência">
                  {aberto.data_preferida ? dataBR(aberto.data_preferida) : "Sem data"} · {PERIODOS[aberto.periodo]}
                </Dado>
                {aberto.observacoes && (
                  <Dado titulo="Observações" largo>
                    {aberto.observacoes}
                  </Dado>
                )}
              </dl>

              {foto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="max-h-72 w-auto max-w-full self-start rounded-2xl border border-zinc-200 object-contain"
                  src={foto}
                  alt="Foto do material enviada no pedido"
                />
              )}

              {["enviado", "recebido", "agendado"].includes(aberto.status) && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 self-start rounded-xl border border-red-200 px-3.5 py-2 text-sm font-bold text-danger hover:bg-danger-soft"
                  onClick={() => setCancelar(true)}
                >
                  <XCircle size={16} aria-hidden="true" /> Cancelar pedido
                </button>
              )}
            </div>

            <h3 className="text-base font-black text-zinc-900">Conversa com a ACMRB</h3>
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

/** Mensagem centralizada para lista vazia, erro ou carregando */
const VAZIO = "flex flex-col items-center gap-3 px-2 py-6 text-center text-sm text-ink-muted";

/** Selo colorido com o status do pedido */
function StatusColeta({ status }: { status: Solicitacao["status"] }) {
  const tom = { enviado: "neutro", recebido: "info", agendado: "aviso", concluido: "marca", cancelado: "perigo" } as const;
  return (
    <Badge tom={tom[status]} tamanho="pequeno" className="whitespace-nowrap">
      {ROTULO_STATUS[status]}
    </Badge>
  );
}

/** Um dado do pedido (título pequeno em cima, valor embaixo) */
function Dado({ titulo, largo, children }: { titulo: string; largo?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("min-w-0", largo && "sm:col-span-3")}>
      <dt className="text-[0.72rem] font-extrabold uppercase tracking-wide text-zinc-400">{titulo}</dt>
      <dd className="mt-0.5 text-sm text-zinc-800">{children}</dd>
    </div>
  );
}
