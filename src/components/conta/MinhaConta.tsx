"use client";

/**
 * MinhaConta — dados de contato do visitante (/minha-conta)
 * ------------------------------------------------------------
 * Nome, telefone/WhatsApp, cidade, bairro (opcional) e canal preferido.
 * E-mail aparece só para leitura (não pode ser trocado aqui).
 * Validação com zod (src/lib/contaVisitante.ts).
 * CSS: src/styles/minha-conta.css (prefixo "mconta").
 */

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail, MessageCircle, Phone, Save } from "lucide-react";
import "@/styles/minha-conta.css";
import { useAuth } from "@/contexts/AuthContext";
import PedirLogin from "@/components/coletas/PedirLogin";
import { mascaraTelefone } from "@/lib/validacao";
import {
  CANAIS_CONTATO, carregarConta, esquemaConta, salvarConta, telefoneValido, type CanalContato, type ContaVisitante,
} from "@/lib/contaVisitante";

const ICONE_CANAL = { whatsapp: MessageCircle, ligacao: Phone, email: Mail } as const;

export default function MinhaConta() {
  const { user, perfil, loading } = useAuth();
  const [conta, setConta] = useState<ContaVisitante | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [canal, setCanal] = useState<CanalContato>("whatsapp");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!user || perfil?.tipo !== "visitante") return;
    carregarConta(user.id)
      .then((c) => {
        setConta(c);
        if (c) {
          setNome(c.nome ?? "");
          setTelefone(c.telefone ? mascaraTelefone(c.telefone) : "");
          setCidade(c.cidade ?? "");
          setBairro(c.bairro ?? "");
          setCanal(c.contato_preferido ?? "whatsapp");
        }
      })
      .catch((e: Error) => setAviso({ tipo: "erro", texto: e.message }))
      .finally(() => setCarregando(false));
  }, [user, perfil?.tipo]);

  if (loading) return <div className="pcol__carregando"><Loader2 className="mconta-giro" aria-hidden="true" /></div>;
  if (!user || !perfil) return <PedirLogin titulo="Entre para ver sua conta" texto="Acesse com sua conta de visitante para atualizar seus dados de contato." />;
  if (perfil.tipo !== "visitante")
    return <PedirLogin titulo="Conta de administrador" aviso="Administradores editam o próprio perfil em Painel → Minha conta." />;

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!conta) return;
    const r = esquemaConta.safeParse({ nome, telefone, cidade, bairro, contato_preferido: canal });
    if (!r.success) {
      const m: Record<string, string> = {};
      r.error.issues.forEach((i) => (m[String(i.path[0])] ??= i.message));
      setErros(m);
      return;
    }
    setErros({});
    setSalvando(true);
    try {
      await salvarConta(conta.id, r.data);
      setAviso({ tipo: "ok", texto: "Dados salvos! A equipe da ACMRB vai usar esse contato quando precisar falar com você." });
      window.dispatchEvent(new Event("acmrb-conta-atualizada"));
    } catch (err) {
      setAviso({ tipo: "erro", texto: (err as Error).message });
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <div className="pcol__carregando"><Loader2 className="mconta-giro" aria-hidden="true" /></div>;
  if (!conta)
    return <p className="mconta-aviso mconta-aviso--erro">Não encontramos seu perfil de visitante. Saia e entre novamente para criá-lo.</p>;

  const telOk = telefoneValido(telefone);

  return (
    <div className="mconta">
      <form className="mconta-card" onSubmit={salvar} noValidate>
        <h2 className="mconta-card__titulo">Seus dados de contato</h2>
        <p className="mconta-card__texto">Assim a equipe consegue falar com você sobre coletas, mensagens e avisos.</p>

        {aviso && (
          <p className={`mconta-aviso mconta-aviso--${aviso.tipo}`} role={aviso.tipo === "erro" ? "alert" : "status"}>
            {aviso.tipo === "ok" && <CheckCircle2 size={16} aria-hidden="true" />} {aviso.texto}
          </p>
        )}

        <div className="mconta-grade">
          <label className="mconta-campo mconta-campo--largo">
            <span>Nome completo</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" maxLength={120} aria-invalid={!!erros.nome} />
            {erros.nome && <small className="mconta-erro">{erros.nome}</small>}
          </label>

          <label className="mconta-campo">
            <span>Telefone / WhatsApp</span>
            <input
              value={telefone}
              onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
              inputMode="tel"
              autoComplete="tel"
              placeholder="(85) 99999-9999"
              aria-invalid={!!erros.telefone}
            />
            {erros.telefone ? <small className="mconta-erro">{erros.telefone}</small> : !telOk && <small className="mconta-dica">Com DDD. Ex.: (85) 99999-9999</small>}
          </label>

          <label className="mconta-campo">
            <span>E-mail</span>
            <input value={conta.email} readOnly aria-readonly="true" className="mconta-somente-leitura" />
            <small className="mconta-dica">O e-mail de acesso não pode ser alterado aqui.</small>
          </label>

          <label className="mconta-campo">
            <span>Cidade</span>
            <input value={cidade} onChange={(e) => setCidade(e.target.value)} autoComplete="address-level2" maxLength={80} aria-invalid={!!erros.cidade} />
            {erros.cidade && <small className="mconta-erro">{erros.cidade}</small>}
          </label>

          <label className="mconta-campo">
            <span>Bairro <em>(opcional)</em></span>
            <input value={bairro} onChange={(e) => setBairro(e.target.value)} maxLength={80} />
          </label>
        </div>

        <fieldset className="mconta-canais">
          <legend>Como prefere ser contatado?</legend>
          <div className="mconta-canais__opcoes">
            {(Object.keys(CANAIS_CONTATO) as CanalContato[]).map((c) => {
              const Icone = ICONE_CANAL[c];
              return (
                <label key={c} className="mconta-canal" data-ativo={canal === c}>
                  <input type="radio" name="canal" value={c} checked={canal === c} onChange={() => setCanal(c)} />
                  <Icone size={17} aria-hidden="true" /> {CANAIS_CONTATO[c]}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mconta-acoes">
          <button type="submit" className="pcol__btn" disabled={salvando}>
            {salvando ? <Loader2 size={16} className="mconta-giro" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />} Salvar dados
          </button>
          <Link href="/mensagens" className="mconta-link"><MessageCircle size={16} aria-hidden="true" /> Falar com a equipe</Link>
        </div>
      </form>
    </div>
  );
}
