"use client";

/**
 * Ações do deus sobre o administrador normal (dentro de Administradores):
 * desativar/reativar, redefinir senha e trocar e-mail.
 * Tudo passa pela rota do servidor, que grava auditoria.
 */

import { useState } from "react";
import { KeyRound, Mail, Power } from "lucide-react";
import { chamarApi } from "@/lib/apiAdmin";
import { RegrasSenha, senhaValida } from "@/components/ui/RegrasSenha";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Mostrar = (tipo: "sucesso" | "erro" | "aviso", mensagem: string) => void;

const campo =
  "w-full h-11 rounded-2xl border border-zinc-200 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-[#2E5E4E]/40";
const botao = "h-10 px-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-60";

export default function GerenciarAdmin({ alvo, mostrar, onAlterado }: {
  alvo: { id: string; nome: string; ativo: boolean };
  mostrar: Mostrar;
  onAlterado: () => void;
}) {
  const [aberto, setAberto] = useState<"senha" | "email" | null>(null);
  const [valor, setValor] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [confirmarSituacao, setConfirmarSituacao] = useState(false);

  async function executar(corpo: Record<string, unknown>, sucesso: string) {
    setOcupado(true);
    try {
      await chamarApi("PATCH", "/api/admin/administradores", { id: alvo.id, ...corpo });
      mostrar("sucesso", sucesso);
      setAberto(null);
      setValor("");
      onAlterado();
    } catch (err) {
      mostrar("erro", (err as Error).message);
    } finally {
      setOcupado(false);
      setConfirmarSituacao(false);
    }
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (aberto === "senha") {
      if (!senhaValida(valor)) return mostrar("aviso", "A senha não atende aos requisitos.");
      executar({ acao: "senha", novaSenha: valor }, "Senha redefinida. Envie a nova senha por um canal seguro.");
    } else if (aberto === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())) return mostrar("aviso", "E-mail inválido.");
      executar({ acao: "email", novoEmail: valor }, "E-mail alterado.");
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={botao} onClick={() => { setAberto(aberto === "senha" ? null : "senha"); setValor(""); }}>
          <KeyRound size={14} aria-hidden="true" /> Redefinir senha
        </button>
        <button type="button" className={botao} onClick={() => { setAberto(aberto === "email" ? null : "email"); setValor(""); }}>
          <Mail size={14} aria-hidden="true" /> Trocar e-mail
        </button>
        <button type="button" className={botao} onClick={() => setConfirmarSituacao(true)}>
          <Power size={14} aria-hidden="true" /> {alvo.ativo ? "Desativar" : "Reativar"}
        </button>
      </div>

      {aberto && (
        <form onSubmit={enviar} className="space-y-2" noValidate>
          <input
            className={campo}
            type={aberto === "email" ? "email" : "text"}
            autoComplete="off"
            placeholder={aberto === "email" ? "novo@email.com" : "Nova senha temporária"}
            aria-label={aberto === "email" ? "Novo e-mail" : "Nova senha temporária"}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          {aberto === "senha" && <RegrasSenha senha={valor} />}
          <button type="submit" disabled={ocupado} className="h-10 px-4 rounded-xl bg-[#2E5E4E] text-white text-sm font-bold disabled:opacity-60">
            Salvar
          </button>
        </form>
      )}

      <ConfirmDialog
        aberto={confirmarSituacao}
        titulo={alvo.ativo ? "Desativar administrador?" : "Reativar administrador?"}
        mensagem={alvo.ativo
          ? `${alvo.nome} não conseguirá entrar no painel até ser reativado.`
          : `${alvo.nome} voltará a ter acesso ao painel.`}
        textoConfirmar={alvo.ativo ? "Desativar" : "Reativar"}
        perigo={alvo.ativo}
        carregando={ocupado}
        onConfirmar={() => executar({ acao: alvo.ativo ? "desativar" : "ativar" },
          alvo.ativo ? "Administrador desativado." : "Administrador reativado.")}
        onCancelar={() => setConfirmarSituacao(false)}
      />
    </div>
  );
}
