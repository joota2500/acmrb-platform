"use client";

/**
 * NovoVisitanteModal — o deus cadastra um visitante pelo painel
 * ------------------------------------------------------------
 * Abre na gaveta (PainelLateral) com o formulário em blocos e o botão
 * de cadastrar no rodapé fixo.
 * Envia para POST /api/admin/visitantes { acao: "criar" } (service role no
 * servidor). A conta já nasce com o e-mail confirmado.
 */

import { useState, type FormEvent } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { chamarApi } from "@/services/apiAdmin";
import { mascaraTelefone } from "@/utils/validacao";
import { RegrasSenha, senhaValida } from "@/components/ui/RegrasSenha";
import Button from "@/components/ui/Button";
import PainelLateral from "@/components/admin/apoiadores/PainelLateral";
import { BLOCO, CAMPO, CONTROLE, DICA, ERRO, LINHA, ROTULO, TITULO_BLOCO } from "@/components/admin/apoiadores/estilos";

interface Props {
  onFechar: () => void;
  onCriado: (msg: string) => void;
}

export default function NovoVisitanteModal({ onFechar, onCriado }: Props) {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", telefone: "", cidade: "", data_nascimento: "" });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    if (salvando) return;
    setErro("");
    if (form.nome.trim().length < 3) return setErro("Informe o nome completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setErro("E-mail inválido.");
    if (!senhaValida(form.senha)) return setErro("A senha ainda não cumpre as regras.");
    setSalvando(true);
    try {
      await chamarApi("POST", "/api/admin/visitantes", { acao: "criar", ...form });
      onCriado(`Visitante ${form.nome.trim()} cadastrado.`);
    } catch (e) {
      setErro((e as Error).message);
      setSalvando(false);
    }
  }

  const muda = (campo: keyof typeof form, valor: string) => setForm((f) => ({ ...f, [campo]: valor }));

  return (
    <PainelLateral
      aberto
      titulo="Novo visitante"
      onFechar={onFechar}
      rodape={
        <>
          <Button type="button" variante="contorno" tamanho="pequeno" onClick={onFechar}>Cancelar</Button>
          <Button type="submit" form="form-novo-visitante" tamanho="pequeno" disabled={salvando}>
            {salvando ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <UserPlus size={16} aria-hidden="true" />} Cadastrar
          </Button>
        </>
      }
    >
      <form id="form-novo-visitante" className="flex flex-col gap-4" onSubmit={enviar} noValidate>
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Acesso</legend>
          <label className={CAMPO}>
            <span className={ROTULO}>Nome completo</span>
            <input className={CONTROLE} value={form.nome} maxLength={100} onChange={(e) => muda("nome", e.target.value)} required />
          </label>
          <label className={CAMPO}>
            <span className={ROTULO}>E-mail (será o login)</span>
            <input className={CONTROLE} type="email" value={form.email} onChange={(e) => muda("email", e.target.value)} required />
          </label>
          <label className={CAMPO}>
            <span className={ROTULO}>Senha provisória</span>
            <input className={CONTROLE} type="text" autoComplete="new-password" value={form.senha} onChange={(e) => muda("senha", e.target.value)} required />
          </label>
          <RegrasSenha senha={form.senha} />
        </fieldset>
        <fieldset className={BLOCO}>
          <legend className={TITULO_BLOCO}>Contato (opcional)</legend>
          <div className={LINHA}>
            <label className={CAMPO}>
              <span className={ROTULO}>Telefone</span>
              <input className={CONTROLE} inputMode="tel" value={form.telefone} onChange={(e) => muda("telefone", mascaraTelefone(e.target.value))} />
            </label>
            <label className={CAMPO}>
              <span className={ROTULO}>Nascimento</span>
              <input className={CONTROLE} type="date" value={form.data_nascimento} onChange={(e) => muda("data_nascimento", e.target.value)} />
            </label>
          </div>
          <label className={CAMPO}>
            <span className={ROTULO}>Cidade</span>
            <input className={CONTROLE} value={form.cidade} maxLength={80} onChange={(e) => muda("cidade", e.target.value)} />
          </label>
          <p className={DICA}>A conta já nasce com o e-mail confirmado. Depois você pode enviar um link para o visitante trocar a senha.</p>
        </fieldset>
        {erro && <p role="alert" className={ERRO}>{erro}</p>}
      </form>
    </PainelLateral>
  );
}
