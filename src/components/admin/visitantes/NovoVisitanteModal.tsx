"use client";

/**
 * NovoVisitanteModal — o deus cadastra um visitante pelo painel
 * ------------------------------------------------------------
 * Envia para POST /api/admin/visitantes { acao: "criar" } (service role no
 * servidor). A conta já nasce com o e-mail confirmado.
 * CSS: src/styles/admin-visitante-novo.css (prefixo "advn-").
 */

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, UserPlus, X } from "lucide-react";

import "@/styles/admin-visitante-novo.css";
import { chamarApi } from "@/lib/apiAdmin";
import { mascaraTelefone } from "@/lib/validacao";
import { RegrasSenha, senhaValida } from "@/components/ui/RegrasSenha";

interface Props {
  onFechar: () => void;
  onCriado: (msg: string) => void;
}

export default function NovoVisitanteModal({ onFechar, onCriado }: Props) {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", telefone: "", cidade: "", data_nascimento: "" });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onFechar]);

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
    <div className="advn-fundo" onClick={onFechar} role="presentation">
      <div className="advn" role="dialog" aria-modal="true" aria-labelledby="advn-titulo" onClick={(e) => e.stopPropagation()}>
        <div className="advn-topo">
          <h2 id="advn-titulo"><UserPlus size={18} aria-hidden="true" /> Novo visitante</h2>
          <button type="button" className="advn-fechar" onClick={onFechar} aria-label="Fechar"><X size={20} /></button>
        </div>
        <form className="advn-form" onSubmit={enviar}>
          <label>Nome completo<input className="advn-input" value={form.nome} maxLength={100} onChange={(e) => muda("nome", e.target.value)} required /></label>
          <label>E-mail (será o login)<input className="advn-input" type="email" value={form.email} onChange={(e) => muda("email", e.target.value)} required /></label>
          <label>
            Senha provisória
            <input className="advn-input" type="text" autoComplete="new-password" value={form.senha} onChange={(e) => muda("senha", e.target.value)} required />
            <RegrasSenha senha={form.senha} />
          </label>
          <div className="advn-linha">
            <label>Telefone<input className="advn-input" value={form.telefone} onChange={(e) => muda("telefone", mascaraTelefone(e.target.value))} /></label>
            <label>Nascimento<input className="advn-input" type="date" value={form.data_nascimento} onChange={(e) => muda("data_nascimento", e.target.value)} /></label>
          </div>
          <label>Cidade<input className="advn-input" value={form.cidade} maxLength={80} onChange={(e) => muda("cidade", e.target.value)} /></label>
          <p className="advn-dica">A conta já nasce com o e-mail confirmado. Depois você pode enviar um link para o visitante trocar a senha.</p>
          {erro && <p role="alert" style={{ color: "#b91c1c", fontSize: "0.86rem", fontWeight: 700 }}>{erro}</p>}
          <div className="advn-acoes">
            <button type="button" className="advn-btn advn-btn--soft" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="advn-btn" disabled={salvando}>
              {salvando ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <UserPlus size={16} aria-hidden="true" />} Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
