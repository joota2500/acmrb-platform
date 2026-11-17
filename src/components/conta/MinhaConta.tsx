"use client";

/**
 * MinhaConta — dados de contato do visitante (/minha-conta)
 * ------------------------------------------------------------
 * Nome, telefone/WhatsApp, cidade, bairro (opcional) e canal preferido.
 * E-mail aparece só para leitura (não pode ser trocado aqui).
 * Validação com zod (src/services/contaVisitante.ts).
 * Visual: Tailwind + ui (Card, Campo, Input, Button).
 */

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Mail, MessageCircle, Phone, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Campo from "@/components/ui/Campo";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { cn } from "@/utils/cn";
import { useAuth } from "@/contexts/AuthContext";
import PedirLogin from "@/components/coletas/PedirLogin";
import { mascaraTelefone } from "@/utils/validacao";
import {
  CANAIS_CONTATO, carregarConta, esquemaConta, salvarConta, telefoneValido, type CanalContato, type ContaVisitante,
} from "@/services/contaVisitante";

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

  if (loading) return <Spinner centralizado />;
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

  if (carregando) return <Spinner centralizado />;
  if (!conta)
    return (
      <p className="flex items-center gap-1.5 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
        Não encontramos seu perfil de visitante. Saia e entre novamente para criá-lo.
      </p>
    );

  const telOk = telefoneValido(telefone);

  return (
    <Card espaco="grande" className="mx-auto max-w-3xl border-brand-mint p-5 sm:p-7">
      <form onSubmit={salvar} noValidate className="flex flex-col gap-4.5">
        <h2 className="text-left text-xl font-black text-brand-dark">Seus dados de contato</h2>
        <p className="texto-justo text-sm leading-relaxed text-zinc-600">
          Assim a equipe consegue falar com você sobre coletas, mensagens e avisos.
        </p>

        {aviso && (
          <p
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-left text-sm",
              aviso.tipo === "ok" ? "bg-brand-soft text-brand-dark" : "bg-danger-soft text-danger",
            )}
            role={aviso.tipo === "erro" ? "alert" : "status"}
          >
            {aviso.tipo === "ok" && <CheckCircle2 size={16} aria-hidden="true" />} {aviso.texto}
          </p>
        )}

        <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
          <Campo rotulo="Nome completo" erro={erros.nome} className="sm:col-span-2">
            <Input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" maxLength={120} invalido={!!erros.nome} />
          </Campo>

          <Campo rotulo="Telefone / WhatsApp" erro={erros.telefone} dica={!telOk ? "Com DDD. Ex.: (85) 99999-9999" : undefined}>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
              inputMode="tel"
              autoComplete="tel"
              placeholder="(85) 99999-9999"
              invalido={!!erros.telefone}
            />
          </Campo>

          <Campo rotulo="E-mail" dica="O e-mail de acesso não pode ser alterado aqui.">
            <Input value={conta.email} readOnly aria-readonly="true" className="bg-zinc-100 text-zinc-600" />
          </Campo>

          <Campo rotulo="Cidade" erro={erros.cidade}>
            <Input value={cidade} onChange={(e) => setCidade(e.target.value)} autoComplete="address-level2" maxLength={80} invalido={!!erros.cidade} />
          </Campo>

          <Campo rotulo="Bairro (opcional)">
            <Input value={bairro} onChange={(e) => setBairro(e.target.value)} maxLength={80} />
          </Campo>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-bold text-zinc-700">Como prefere ser contatado?</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CANAIS_CONTATO) as CanalContato[]).map((c) => {
              const Icone = ICONE_CANAL[c];
              return (
                <label
                  key={c}
                  className={cn(
                    "relative inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] px-4 py-2 text-sm font-bold focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand",
                    canal === c ? "border-brand bg-brand text-white" : "border-brand-mint bg-white text-brand",
                  )}
                >
                  <input type="radio" name="canal" value={c} checked={canal === c} onChange={() => setCanal(c)} className="absolute inset-0 cursor-pointer opacity-0" />
                  <Icone size={17} aria-hidden="true" /> {CANAIS_CONTATO[c]}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button type="submit" carregando={salvando} className="w-full sm:w-auto">
            {!salvando && <Save size={16} aria-hidden="true" />} Salvar dados
          </Button>
          <Link href="/mensagens" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
            <MessageCircle size={16} aria-hidden="true" /> Falar com a equipe
          </Link>
        </div>
      </form>
    </Card>
  );
}
