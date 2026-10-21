"use client";

/**
 * MensagensSection — chat geral com os visitantes (painel, deus e admin)
 * ------------------------------------------------------------
 * Esquerda: lista de conversas (nome, telefone, última mensagem, hora,
 * selo de não lidas, busca). Direita: contato do visitante (WhatsApp,
 * ligação, cidade/bairro, canal preferido) + conversa (ChatGeral).
 * Abrir a conversa marca as mensagens do visitante como lidas.
 * Dados do visitante vêm da função chat_admin_conversas() (security
 * definer, só is_active_admin), pois o admin normal não lê visitantes.
 * Celular: uma coluna por vez, com botão "voltar".
 * CSS: src/styles/admin-mensagens.css (prefixo "amsg").
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Mail, MapPin, MessageCircle, Phone, RefreshCw, Search, Star } from "lucide-react";
import "@/styles/admin-mensagens.css";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ChatGeral from "@/components/chat/ChatGeral";
import { INTERVALO_CHAT_MS, listarConversasAdmin, quandoCurto, type ConversaAdmin } from "@/lib/chatGeral";
import { CANAIS_CONTATO, linkLigar, linkWhats } from "@/lib/contaVisitante";
import { EVENTO_CHAT_LIDO } from "@/hooks/useChatNaoLidas";
import { mascaraTelefone } from "@/lib/validacao";

const semAcento = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function MensagensSection() {
  const { user, perfil } = useAuth();
  const [lista, setLista] = useState<ConversaAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [abertaId, setAbertaId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLista(await listarConversasAdmin());
      setErro("");
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
    const t = setInterval(() => document.visibilityState === "visible" && void carregar(), INTERVALO_CHAT_MS);
    const canal = supabase
      .channel("admin-chat-conversas")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_mensagens" }, () => void carregar())
      .subscribe();
    const aoLer = () => void carregar();
    window.addEventListener(EVENTO_CHAT_LIDO, aoLer);
    return () => {
      clearInterval(t);
      window.removeEventListener(EVENTO_CHAT_LIDO, aoLer);
      void supabase.removeChannel(canal);
    };
  }, [carregar]);

  const filtradas = useMemo(() => {
    const q = semAcento(busca.trim());
    if (!q) return lista;
    const qDig = q.replace(/\D/g, "");
    return lista.filter(
      (c) =>
        semAcento(`${c.nome ?? ""} ${c.cidade ?? ""} ${c.bairro ?? ""} ${c.email ?? ""} ${c.ultima_msg_texto ?? ""}`).includes(q) ||
        (qDig.length >= 3 && (c.telefone ?? "").replace(/\D/g, "").includes(qDig)),
    );
  }, [lista, busca]);

  const aberta = lista.find((c) => c.conversa_id === abertaId) ?? null;
  const totalNaoLidas = lista.reduce((s, c) => s + (c.nao_lidas || 0), 0);

  return (
    <div className={`amsg ${aberta ? "amsg--aberta" : ""}`}>
      {/* ===== Lista de conversas ===== */}
      <aside className="amsg-lista" aria-label="Conversas com visitantes">
        <div className="amsg-lista__topo">
          <div className="amsg-lista__titulo">
            <h2>Conversas</h2>
            <span>{totalNaoLidas ? `${totalNaoLidas} não lida${totalNaoLidas > 1 ? "s" : ""}` : "tudo lido"}</span>
          </div>
          <button type="button" className="amsg-icone" onClick={() => void carregar()} aria-label="Atualizar lista">
            <RefreshCw size={16} aria-hidden="true" />
          </button>
        </div>
        <label className="amsg-busca">
          <Search size={16} aria-hidden="true" />
          <span className="amsg-sr">Buscar conversa</span>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, telefone, cidade…" />
        </label>

        {carregando ? (
          <p className="amsg-vazio"><Loader2 size={16} className="amsg-giro" aria-hidden="true" /> Carregando…</p>
        ) : erro ? (
          <p className="amsg-vazio amsg-vazio--erro" role="alert">{erro}</p>
        ) : filtradas.length === 0 ? (
          <p className="amsg-vazio">{busca ? "Nenhuma conversa encontrada." : "Nenhum visitante mandou mensagem ainda."}</p>
        ) : (
          <ul className="amsg-itens">
            {filtradas.map((c) => (
              <li key={c.conversa_id}>
                <button
                  type="button"
                  className="amsg-item"
                  aria-current={c.conversa_id === abertaId}
                  onClick={() => setAbertaId(c.conversa_id)}
                >
                  <span className="amsg-avatar" aria-hidden="true">{(c.nome ?? "V").charAt(0).toUpperCase()}</span>
                  <span className="amsg-item__corpo">
                    <span className="amsg-item__linha">
                      <strong>{c.nome ?? "Visitante"}</strong>
                      <time className={c.nao_lidas ? "amsg-item__hora--nova" : undefined}>{quandoCurto(c.ultima_msg_em)}</time>
                    </span>
                    <span className="amsg-item__linha">
                      <span className="amsg-item__previa">
                        {c.ultima_msg_autor === "admin" && <span className="amsg-item__voce">Você: </span>}
                        {c.ultima_msg_texto ?? ""}
                      </span>
                      {c.nao_lidas > 0 && <span className="amsg-selo" aria-label={`${c.nao_lidas} não lidas`}>{c.nao_lidas}</span>}
                    </span>
                    {c.telefone && <span className="amsg-item__tel">{mascaraTelefone(c.telefone)}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* ===== Conversa aberta ===== */}
      <section className="amsg-conversa" aria-label="Conversa aberta">
        {!aberta || !user ? (
          <div className="amsg-placeholder">
            <MessageCircle size={40} aria-hidden="true" />
            <p>Escolha uma conversa para ler e responder.</p>
          </div>
        ) : (
          <>
            <header className="amsg-contato">
              <button type="button" className="amsg-icone amsg-voltar" onClick={() => setAbertaId(null)} aria-label="Voltar para a lista">
                <ArrowLeft size={18} aria-hidden="true" />
              </button>
              <span className="amsg-avatar amsg-avatar--grande" aria-hidden="true">{(aberta.nome ?? "V").charAt(0).toUpperCase()}</span>
              <div className="amsg-contato__info">
                <strong>{aberta.nome ?? "Visitante"}</strong>
                <span className="amsg-contato__linha">
                  {aberta.telefone ? mascaraTelefone(aberta.telefone) : "Sem telefone informado"}
                  {(aberta.cidade || aberta.bairro) && (
                    <>
                      {" · "}
                      <MapPin size={12} aria-hidden="true" /> {[aberta.bairro, aberta.cidade].filter(Boolean).join(", ")}
                    </>
                  )}
                </span>
                {aberta.contato_preferido && (
                  <span className="amsg-contato__pref">
                    <Star size={12} aria-hidden="true" /> Prefere {CANAIS_CONTATO[aberta.contato_preferido as keyof typeof CANAIS_CONTATO] ?? aberta.contato_preferido}
                  </span>
                )}
              </div>
              <div className="amsg-contato__acoes">
                {linkWhats(aberta.telefone) && (
                  <a className="amsg-acao amsg-acao--whats" href={linkWhats(aberta.telefone)!} target="_blank" rel="noopener noreferrer" aria-label="Abrir WhatsApp">
                    <MessageCircle size={16} aria-hidden="true" /> <span>WhatsApp</span>
                  </a>
                )}
                {linkLigar(aberta.telefone) && (
                  <a className="amsg-acao" href={linkLigar(aberta.telefone)!} aria-label="Ligar">
                    <Phone size={16} aria-hidden="true" /> <span>Ligar</span>
                  </a>
                )}
                {aberta.email && (
                  <a className="amsg-acao" href={`mailto:${aberta.email}`} aria-label="Enviar e-mail">
                    <Mail size={16} aria-hidden="true" /> <span>E-mail</span>
                  </a>
                )}
              </div>
            </header>
            <ChatGeral
              key={aberta.conversa_id}
              conversaId={aberta.conversa_id}
              usuarioId={user.id}
              lado="admin"
              nome={perfil?.nome ?? "Equipe ACMRB"}
              className="amsg-chat"
              vazio="Nenhuma mensagem nesta conversa."
            />
          </>
        )}
      </section>
    </div>
  );
}
