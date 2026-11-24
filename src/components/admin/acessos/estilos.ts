/**
 * Classes do Tailwind das abas de acessos e aparelhos (painel do ADM DEUS)
 * ------------------------------------------------------------
 * Tempo real, Acessos, Visitas, Aparelhos, Segurança, a gaveta do aparelho e
 * a janela de bloquear/suspender usam estas constantes (import * as E).
 * Antes eram os arquivos admin-acessos.css e admin-aparelhos.css, que foram apagados.
 * Tabelas: no computador são tabelas normais; no celular (até md) cada linha
 * vira um cartão e o nome da coluna aparece antes do valor (atributo data-rotulo).
 */

import type { SituacaoAparelho } from "@/types/aparelhos";

export const RAIZ =
  "flex min-w-0 flex-col gap-4";
export const BARRA =
  "flex flex-wrap items-center justify-between gap-2.5";
export const GRUPO =
  "flex flex-wrap gap-2 max-sm:w-full max-sm:[&>button]:flex-1";
export const CHIP =
  "h-9 cursor-pointer rounded-full border border-line bg-white px-3.5 text-[0.84rem] font-bold text-zinc-600 transition hover:border-brand-line hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
export const CHIP_ATIVO =
  "border-brand bg-brand text-white hover:border-brand hover:text-white";
export const CHIPS =
  "flex flex-wrap gap-1.5";
export const NOTA =
  "text-[0.78rem] text-ink-muted";
export const ERRO =
  "rounded-control border border-red-200 bg-danger-soft px-4 py-3 text-[0.86rem] font-bold text-danger";
export const VAZIO =
  "flex flex-wrap items-center justify-center gap-2 rounded-card border border-dashed border-brand-line bg-white/60 p-8 text-center text-[0.9rem] text-ink-soft";
export const CODIGO =
  "inline-block max-w-[min(16rem,55vw)] truncate rounded-md bg-brand-soft px-1.5 py-0.5 align-bottom font-mono text-[0.78rem] text-brand-dark";
export const CARTOES =
  "grid grid-cols-2 gap-3 lg:grid-cols-4";
export const CARTAO_NUM =
  "flex min-w-0 flex-col gap-1.5 rounded-card border border-black/5 bg-white p-3 shadow-card sm:p-4 [&>svg]:box-content [&>svg]:size-[18px] [&>svg]:rounded-xl [&>svg]:bg-brand-mint [&>svg]:p-2 [&>svg]:text-brand [&>strong]:text-2xl [&>strong]:font-black [&>strong]:leading-none [&>strong]:text-ink [&>span]:text-[0.78rem] [&>span]:font-semibold [&>span]:leading-tight [&>span]:text-ink-soft";
export const CARTAO_DESTAQUE =
  "border-brand bg-brand [&>svg]:bg-white/15! [&>svg]:text-white! [&>strong]:text-white! [&>span]:text-white/85!";
export const GRADE =
  "grid min-w-0 gap-4 lg:grid-cols-2";
export const GRADE_3 =
  "lg:grid-cols-3";
export const BLOCO =
  "flex min-w-0 flex-col gap-3 rounded-card border border-black/5 bg-white p-4 shadow-card sm:p-5 [&>h3]:flex [&>h3]:items-center [&>h3]:gap-2 [&>h3]:text-[0.92rem] [&>h3]:font-extrabold [&>h3]:text-ink [&>h3>svg]:shrink-0 [&>h3>svg]:text-brand";
export const RANKING =
  "flex flex-col gap-2 [&>li]:grid [&>li]:grid-cols-[minmax(0,1.3fr)_1fr_auto] [&>li]:items-center [&>li]:gap-2 [&>li]:text-[0.82rem] [&>li]:text-zinc-700 [&_b]:font-extrabold [&_b]:text-brand [&_small]:col-span-full [&_small]:-mt-1 [&_small]:text-[0.72rem] [&_small]:text-ink-muted";
export const RANKING_NOME =
  "truncate";
export const RANKING_BARRA =
  "h-2 overflow-hidden rounded-full bg-brand-soft [&>i]:block [&>i]:h-full [&>i]:rounded-full [&>i]:bg-leaf-bright";
export const PILHA =
  "flex h-4 overflow-hidden rounded-full bg-zinc-100";
export const COR_ANONIMO =
  "bg-emerald-300";
export const COR_LOGADO =
  "bg-brand-dark";
export const LEGENDA =
  "flex flex-col gap-1.5 text-[0.86rem] text-zinc-700 [&_b]:text-ink";
export const PONTO_LEGENDA =
  "mr-1.5 inline-block size-2.5 rounded-full";
export const COLUNAS =
  "flex h-36 items-end gap-px sm:h-44 sm:gap-1";
export const COLUNA =
  "flex h-full min-w-0 flex-1 flex-col items-center gap-1";
export const COLUNA_VALOR =
  "min-h-3.5 text-[0.66rem] font-extrabold text-brand max-sm:hidden";
export const COLUNA_BARRA =
  "flex w-full max-w-10 flex-1 items-end";
export const COLUNA_TOTAL =
  "relative flex min-h-0.5 w-full items-end overflow-hidden rounded-t-md bg-emerald-300 [&>b]:block [&>b]:w-full [&>b]:bg-brand-dark";
export const COLUNA_DIA =
  "w-full truncate text-center text-[0.62rem] text-ink-muted";
export const FILTROS =
  "grid gap-2.5 rounded-card border border-black/5 bg-white p-3 shadow-card sm:grid-cols-2 lg:grid-cols-4";
export const SELO =
  "inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[0.72rem] font-extrabold whitespace-nowrap text-zinc-600";
export const SELO_OK =
  "bg-brand-mint text-brand-dark";
export const SELO_ERRO =
  "bg-red-100 text-red-800";
export const SELO_AGORA =
  "bg-brand text-white";
export const FUNDO_JANELA =
  "fixed inset-0 z-80 flex animate-aparecer items-center justify-center bg-ink/50 p-4 motion-reduce:animate-none";
export const JANELA =
  "flex max-h-[90dvh] w-full max-w-xl flex-col gap-3 overflow-y-auto rounded-card bg-white p-4 shadow-pop sm:p-5 [&_h3]:text-[1.05rem] [&_h3]:font-black [&_h3]:text-ink";
export const LISTA_PAGINAS =
  "flex flex-col gap-2 [&>li]:flex [&>li]:justify-between [&>li]:gap-3 [&>li]:border-b [&>li]:border-line [&>li]:pb-2 [&>li]:text-[0.84rem] [&>li]:text-zinc-700 [&>li>*]:min-w-0 [&_span]:whitespace-nowrap [&_span]:text-ink-muted max-sm:[&>li]:flex-col max-sm:[&>li]:gap-0.5";
export const SR =
  "sr-only";
export const BUSCA =
  "flex h-11 min-w-0 items-center gap-2 rounded-control border border-line bg-white px-3 text-ink-muted focus-within:border-brand focus-within:shadow-focus sm:col-span-2 lg:col-span-1 [&>input]:h-full [&>input]:min-w-0 [&>input]:flex-1 [&>input]:border-0 [&>input]:bg-transparent [&>input]:text-[0.9rem] [&>input]:text-ink [&>input]:outline-none [&>svg]:shrink-0";
export const SELECT =
  "h-11 w-full min-w-0 rounded-control border border-line bg-white px-3 text-[0.88rem] text-ink outline-none transition focus:border-brand focus:shadow-focus";
export const CONTAGEM =
  "text-[0.82rem] text-ink-muted";
export const BOTAO =
  "inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-control border-0 bg-brand px-4 text-[0.86rem] font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50";
export const BOTAO_PERIGO =
  "bg-red-600 hover:bg-red-700";
export const BOTAO_AVISO =
  "bg-amber-100 text-amber-800 hover:bg-amber-200";
export const GIRO =
  "animate-spin";
export const TABELA_CAIXA =
  "relative overflow-x-auto rounded-card border border-black/5 bg-white shadow-card max-md:overflow-visible max-md:border-0 max-md:bg-transparent max-md:shadow-none";
export const TABELA =
  "w-full border-collapse text-[0.88rem] [&_th]:bg-surface-alt [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-[0.72rem] [&_th]:font-extrabold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-ink-muted [&_td]:border-t [&_td]:border-line [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle [&_td]:text-zinc-700 [&_tbody_tr]:transition [&_tbody_tr:hover]:bg-surface-alt max-md:block max-md:[&_thead]:hidden max-md:[&_tbody]:flex max-md:[&_tbody]:flex-col max-md:[&_tbody]:gap-3 max-md:[&_tr]:block max-md:[&_tr]:rounded-card max-md:[&_tr]:border max-md:[&_tr]:border-black/5 max-md:[&_tr]:bg-white max-md:[&_tr]:p-3.5 max-md:[&_tr]:shadow-card max-md:[&_td]:flex max-md:[&_td]:min-w-0 max-md:[&_td]:items-start max-md:[&_td]:justify-between max-md:[&_td]:gap-4 max-md:[&_td]:border-0 max-md:[&_td]:px-0 max-md:[&_td]:py-1 max-md:[&_td]:text-right max-md:[&_td]:break-words max-md:[&_td]:before:shrink-0 max-md:[&_td]:before:text-left max-md:[&_td]:before:text-[0.74rem] max-md:[&_td]:before:font-bold max-md:[&_td]:before:text-ink-muted max-md:[&_td]:before:content-[attr(data-rotulo)] max-md:[&_td:first-child]:block max-md:[&_td:first-child]:pb-2 max-md:[&_td:first-child]:text-left max-md:[&_td:first-child]:before:hidden";
export const NOME =
  "block font-extrabold text-ink";
export const DETALHE =
  "block break-words text-[0.8rem] text-ink-muted";
export const ACAO_TD =
  "text-right max-md:block! max-md:pt-2.5! max-md:text-left! max-md:before:hidden";
export const ACOES_LINHA =
  "flex flex-wrap justify-end gap-1.5 max-md:justify-start max-sm:[&>*]:flex-1";
export const PAGINACAO =
  "flex items-center justify-center gap-2 text-[0.85rem] text-zinc-600";
export const FILTROS_APA =
  "grid gap-2.5 rounded-card border border-black/5 bg-white p-3 shadow-card lg:grid-cols-[minmax(0,1fr)_14rem]";
export const LINK =
  "inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 font-bold text-brand underline";
export const SITUACAO_TOPO =
  "flex flex-wrap gap-1.5";
export const SITUACAO_TEXTO =
  "text-[0.86rem] text-zinc-700";
export const ACOES =
  "flex flex-wrap gap-2 max-sm:[&>*]:flex-1";
export const DADOS =
  "grid gap-x-4 gap-y-3 sm:grid-cols-2 [&_dt]:text-[0.7rem] [&_dt]:font-extrabold [&_dt]:uppercase [&_dt]:tracking-wide [&_dt]:text-ink-muted [&_dd]:break-words [&_dd]:text-[0.88rem] [&_dd]:text-ink";
export const PAGINAS =
  "mt-1.5 flex flex-col gap-1 pl-1 [&>li]:flex [&>li]:min-w-0 [&>li]:items-center [&>li]:gap-2 [&>li]:text-[0.78rem]";
export const FUNDO_CONFIRMA =
  "fixed inset-0 z-95 flex animate-aparecer items-center justify-center bg-ink/55 p-4 motion-reduce:animate-none";
export const CONFIRMA =
  "flex max-h-[92dvh] w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-card bg-white p-4 shadow-pop sm:p-5";
export const CONFIRMA_TOPO =
  "flex items-center justify-between gap-2.5";
export const CONFIRMA_TITULO =
  "flex items-center gap-2 text-[1.1rem] font-black text-ink";
export const CONFIRMA_TITULO_PERIGO =
  "text-danger";
export const CONFIRMA_ALVO =
  "break-words rounded-xl bg-surface-alt px-3 py-2 text-[0.84rem] font-bold text-zinc-700";
export const CONFIRMA_EFEITO =
  "text-[0.86rem] text-zinc-600";
export const CONFIRMA_BOTOES =
  "flex justify-end gap-2 max-sm:flex-col-reverse max-sm:[&>*]:w-full";
export const CAMPO =
  "flex min-w-0 flex-col gap-1.5 text-[0.82rem] font-bold text-zinc-700";
export const TEXTO_LONGO =
  "min-h-18 resize-y";
export const CONTADOR =
  "text-[0.72rem] font-normal text-ink-muted";
export const CHECK =
  "flex cursor-pointer items-start gap-2.5 rounded-control border border-amber-200 bg-amber-50 px-3 py-2.5 text-[0.84rem] text-zinc-700 [&_input]:mt-1 [&_input]:shrink-0 [&_input]:accent-amber-600 [&_small]:mt-0.5 [&_small]:block [&_small]:text-[0.76rem] [&_small]:text-amber-800";
export const CHECK_NEUTRO =
  "border-line bg-zinc-50 [&_input]:accent-brand! [&_small]:text-zinc-600!";
export const PRAZO =
  "flex flex-col gap-2 rounded-control border border-line bg-surface-alt p-3";
export const PRAZO_LINHA =
  "grid grid-cols-2 gap-2 sm:grid-cols-[7rem_1fr]";
export const PRAZO_PREVIA =
  "text-[0.8rem] font-bold text-brand";
export const PRAZO_PREVIA_ERRO =
  "text-danger";
export const FUNDO_GAVETA =
  "fixed inset-0 z-100 flex animate-aparecer justify-end bg-ink/45 motion-reduce:animate-none";
export const GAVETA =
  "flex h-full w-full animate-subir flex-col bg-surface-alt shadow-[-10px_0_40px_rgb(0_0_0/0.2)] motion-reduce:animate-none sm:w-[min(44rem,100%)]";
export const GAVETA_TOPO =
  "flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3.5 sm:px-5";
export const GAVETA_ID =
  "flex min-w-0 items-center gap-3";
export const GAVETA_ICONE =
  "grid size-11 shrink-0 place-items-center rounded-xl bg-brand-mint text-brand";
export const GAVETA_TITULO =
  "truncate text-[1.1rem] font-black tracking-tight text-ink";
export const GAVETA_SUB =
  "break-all text-[0.8rem] text-ink-muted";
export const FECHAR =
  "grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-zinc-100 text-zinc-600 transition hover:bg-brand-mint hover:text-brand focus-visible:outline-2 focus-visible:outline-brand";
export const GAVETA_CORPO =
  "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden p-3 sm:p-5";
export const VAZIO_PEQUENO =
  "flex items-center gap-2 text-[0.86rem] text-ink-muted";
export const BLOCO_GAVETA =
  "min-w-0 rounded-card border border-black/5 bg-white p-4 shadow-card [&>h3]:mb-3 [&>h3]:flex [&>h3]:items-center [&>h3]:gap-2 [&>h3]:text-[0.9rem] [&>h3]:font-extrabold [&>h3]:text-ink [&>h3>svg]:shrink-0 [&>h3>svg]:text-brand";
export const LINHA_TEMPO =
  "flex flex-col gap-2.5 [&>li]:flex [&>li]:min-w-0 [&>li]:gap-2.5 [&>li]:text-[0.82rem] [&_strong]:block [&_strong]:break-words [&_strong]:font-bold [&_strong]:text-ink [&_span]:text-ink-muted";
export const PONTO =
  "mt-1.5 size-2 shrink-0 rounded-full bg-brand";
export const PONTO_CLIQUE =
  "bg-amber-500";
export const PONTO_VERMELHO =
  "bg-red-600";
export const CONTROLE =
  "w-full min-w-0 rounded-control border border-line bg-white px-3.5 py-2.5 text-[0.92rem] font-normal text-ink outline-none transition focus:border-brand focus:shadow-focus disabled:bg-zinc-100 disabled:text-ink-muted";
export const INFO =
  "text-[0.78rem] text-ink-muted";
export const SELO_SITUACAO =
  "inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[0.72rem] font-extrabold whitespace-nowrap text-zinc-600";
export const SELO_ONLINE =
  "bg-brand text-white";

// cores por situação do aparelho
export const CAIXA_SITUACAO = "flex flex-col gap-3 rounded-card border border-black/5 bg-white p-4 shadow-card";
export const COR_SELO_SITUACAO: Record<SituacaoAparelho, string> = { ativo: "bg-brand-mint text-brand-dark", bloqueado: "bg-red-100 text-red-800", suspenso: "bg-amber-100 text-amber-900" };
export const COR_CAIXA_SITUACAO: Record<SituacaoAparelho, string> = { ativo: "", bloqueado: "border-red-200 bg-red-50", suspenso: "border-amber-200 bg-amber-50" };
export const COR_LINHA_SITUACAO: Record<SituacaoAparelho, string> = { ativo: "", bloqueado: "[&>td:first-child]:shadow-[inset_3px_0_0_#dc2626] max-md:border-l-4! max-md:border-l-red-600! max-md:[&>td:first-child]:shadow-none", suspenso: "[&>td:first-child]:shadow-[inset_3px_0_0_#d97706] max-md:border-l-4! max-md:border-l-amber-600! max-md:[&>td:first-child]:shadow-none" };
