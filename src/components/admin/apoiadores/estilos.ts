/**
 * Classes do Tailwind usadas nas telas "Apoiadores e Mapa" e "Logística Reversa"
 * ------------------------------------------------------------
 * Ficam aqui para as duas seções (e o painel lateral) terem o mesmo visual
 * do painel de notícias, sem repetir a mesma lista de classes toda hora.
 * (Antes era o arquivo admin-apoiadores.css, que foi apagado.)
 */

// cartão branco padrão do painel
export const CARTAO = "rounded-card border border-black/5 bg-white shadow-card";

// select dos filtros
export const SELECT =
  "h-11 min-w-0 rounded-control border border-line bg-white px-3 text-[0.88rem] text-ink outline-none transition focus:border-brand focus:shadow-focus";

// botões pequenos de ação da lista (no celular fica só o ícone)
export const BOTAO_ACAO =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 text-[0.78rem] font-bold text-zinc-700 no-underline transition hover:border-brand-line hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-bright disabled:cursor-not-allowed disabled:opacity-50";
export const BOTAO_PERIGO = "text-danger hover:border-red-200 hover:bg-danger-soft hover:text-danger";
export const TEXTO_ACAO = "max-sm:sr-only";

// caixa de "nada encontrado" / erro
export const CAIXA_VAZIA =
  "flex flex-col items-center gap-3 rounded-card border border-dashed border-brand-line bg-white/60 p-8 text-center text-ink-soft";

// selinho colorido (categoria, situação...)
export const SELO = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-extrabold";

// ---------- formulário (dentro do painel lateral) ----------
export const BLOCO = "flex min-w-0 flex-col gap-3.5 rounded-card border border-black/5 bg-white p-4 shadow-card sm:p-5";
export const TITULO_BLOCO =
  "float-left w-full border-b border-line pb-2.5 text-[0.82rem] font-extrabold uppercase tracking-wide text-brand";
export const CAMPO = "flex min-w-0 flex-col gap-1.5";
export const ROTULO = "text-[0.8rem] font-bold text-zinc-700";
export const CONTROLE =
  "w-full min-w-0 rounded-control border border-line bg-white px-3.5 py-2.5 text-[0.92rem] text-ink outline-none transition focus:border-brand focus:shadow-focus aria-[invalid=true]:border-danger";
export const LINHA = "grid gap-3.5 sm:grid-cols-2";
// campo + botão lado a lado (um embaixo do outro no celular)
export const EM_LINHA = "flex flex-col gap-2 sm:flex-row sm:[&>input]:flex-1";
export const DICA = "inline-flex items-center gap-1.5 text-[0.76rem] text-ink-muted";
export const ERRO = "text-[0.76rem] font-bold text-danger";
// caixinha de marcar com o texto do lado
export const MARCAR = "flex min-h-10 cursor-pointer items-center gap-2.5 text-[0.9rem] text-zinc-800 [&>input]:size-[1.1rem] [&>input]:shrink-0 [&>input]:accent-brand";
// enquanto o mapa (Leaflet) carrega
export const MAPA_CARREGANDO =
  "flex h-80 items-center justify-center rounded-card bg-brand-soft font-bold text-brand";
