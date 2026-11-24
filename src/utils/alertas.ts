/**
 * alertas — avisos e confirmações do site
 * ------------------------------------------------------------
 * avisar(): virou o aviso rápido único (toast) do canto da tela, igual
 *           em todo o site. Não precisa mais apertar "OK".
 * confirmar(): continua com SweetAlert2, só para perguntas de verdade
 *           ("excluir?", "sair?"), com a cara da ACMRB (globals.css, "swal-acmrb").
 *
 *   avisar("Salvo!", "sucesso")
 *   avisar("Algo deu errado", "erro")
 *   if (await confirmar({ titulo: "Excluir?", mensagem: "...", perigo: true })) { ... }
 *
 * Só funciona no navegador (use dentro de eventos/efeitos, não na renderização).
 */

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import type { ReactElement } from "react";
import { aviso } from "@/components/ui/Toast";

type Conteudo = string | ReactElement;

const Alerta = withReactContent(Swal);

export type TipoAlerta = "sucesso" | "erro" | "aviso" | "info";

// Classes (definidas em globals.css) que dão a cara da ACMRB
const CLASSES = {
  popup: "swal-acmrb",
  title: "swal-acmrb-titulo",
  htmlContainer: "swal-acmrb-texto",
  confirmButton: "swal-acmrb-confirmar",
  cancelButton: "swal-acmrb-cancelar",
  actions: "swal-acmrb-acoes",
};

/** Aviso rápido no canto da tela (toast). A mensagem pode ser texto ou um elemento React. */
export function avisar(mensagem: Conteudo, tipo: TipoAlerta = "info", titulo?: string): Promise<void> {
  aviso(tipo, mensagem, titulo);
  return Promise.resolve();
}

type OpcoesConfirmar = {
  titulo: string;
  mensagem?: Conteudo;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Ação perigosa (excluir, desativar...): botão vermelho */
  perigo?: boolean;
};

/** Pergunta "tem certeza?" e devolve true se a pessoa confirmou. */
export async function confirmar({
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  perigo = false,
}: OpcoesConfirmar): Promise<boolean> {
  const r = await Alerta.fire({
    icon: perigo ? "warning" : "question",
    title: titulo,
    html: mensagem,
    showCancelButton: true,
    focusCancel: true, // escolha segura: o foco começa no "Cancelar"
    confirmButtonText: textoConfirmar,
    cancelButtonText: textoCancelar,
    reverseButtons: true,
    buttonsStyling: false,
    customClass: { ...CLASSES, confirmButton: perigo ? "swal-acmrb-perigo" : CLASSES.confirmButton },
  });
  return r.isConfirmed;
}
