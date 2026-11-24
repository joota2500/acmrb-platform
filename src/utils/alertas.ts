/**
 * alertas — avisos e confirmações do site com SweetAlert2
 * ------------------------------------------------------------
 * Troca o alert() e o confirm() do navegador por caixas bonitas, nas
 * cores da ACMRB (o visual está em globals.css, classes "swal-acmrb").
 *
 *   avisar("Salvo!", "sucesso")            → caixa com botão OK
 *   avisar("Algo deu errado", "erro")
 *   if (await confirmar({ titulo: "Excluir?", mensagem: "...", perigo: true })) { ... }
 *
 * Só funciona no navegador (use dentro de eventos/efeitos, não na renderização).
 */

import Swal, { type SweetAlertIcon } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import type { ReactElement } from "react";

type Conteudo = string | ReactElement;

const Alerta = withReactContent(Swal);

export type TipoAlerta = "sucesso" | "erro" | "aviso" | "info";

const ICONES: Record<TipoAlerta, SweetAlertIcon> = {
  sucesso: "success",
  erro: "error",
  aviso: "warning",
  info: "info",
};

const TITULOS: Record<TipoAlerta, string> = {
  sucesso: "Tudo certo",
  erro: "Ops, algo deu errado",
  aviso: "Atenção",
  info: "Aviso",
};

// Classes (definidas em globals.css) que dão a cara da ACMRB
const CLASSES = {
  popup: "swal-acmrb",
  title: "swal-acmrb-titulo",
  htmlContainer: "swal-acmrb-texto",
  confirmButton: "swal-acmrb-confirmar",
  cancelButton: "swal-acmrb-cancelar",
  actions: "swal-acmrb-acoes",
};

/** Caixa de aviso com botão OK. A mensagem pode ser texto ou um elemento React. */
export function avisar(mensagem: Conteudo, tipo: TipoAlerta = "info", titulo?: string): Promise<void> {
  return Alerta.fire({
    icon: ICONES[tipo],
    title: titulo ?? TITULOS[tipo],
    html: mensagem,
    confirmButtonText: "Ok",
    buttonsStyling: false,
    customClass: CLASSES,
  }).then(() => undefined);
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
