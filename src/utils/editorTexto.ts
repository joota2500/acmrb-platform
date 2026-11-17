/**
 * editorTexto — operações da barra de formatação do editor de notícias
 * ------------------------------------------------------------
 * Funções puras: recebem o texto e a seleção e devolvem a "troca" a
 * fazer (trecho substituído + nova seleção). Quem aplica na tela é a
 * BarraFormatacao (que usa execCommand para manter o Ctrl+Z funcionando).
 */

export interface Troca {
  /** Trecho do texto original que será substituído [inicio, fim) */
  inicio: number;
  fim: number;
  /** Novo texto desse trecho */
  novo: string;
  /** Seleção depois da troca (posições no texto novo inteiro) */
  selInicio: number;
  selFim: number;
}

const RE_MARCADOR = /^(\s*)(#{1,6}\s+|[-*•+]\s+|\d+[.)]\s+|>\s?)/;

/** Início e fim das linhas que a seleção toca */
function linhasDaSelecao(v: string, s: number, e: number) {
  const ini = v.lastIndexOf("\n", s - 1) + 1;
  const prox = v.indexOf("\n", e > s && v[e - 1] === "\n" ? e - 1 : e);
  return { ini, fim: prox === -1 ? v.length : prox };
}

/** Liga/desliga um prefixo de linha (título, lista, citação) nas linhas selecionadas */
export function prefixoDeLinha(
  v: string,
  s: number,
  e: number,
  tipo: "h1" | "h2" | "h3" | "ul" | "ol" | "citacao" | "normal",
): Troca {
  const { ini, fim } = linhasDaSelecao(v, s, e);
  const linhas = v.slice(ini, fim).split("\n");
  const prefixoFixo = { h1: "# ", h2: "## ", h3: "### ", ul: "- ", citacao: "> " } as const;

  const jaTem = (l: string) => {
    if (tipo === "normal") return false;
    if (tipo === "ol") return /^\s*\d+[.)]\s+/.test(l);
    const p = prefixoFixo[tipo];
    // "# " não pode confundir com "## ": compara o marcador inteiro
    const m = RE_MARCADOR.exec(l);
    return !!m && m[2].trimEnd() === p.trimEnd();
  };
  const naoVazias = linhas.filter((l) => l.trim());
  const desligar = naoVazias.length > 0 && naoVazias.every(jaTem);

  let n = 0;
  const novas = linhas.map((l) => {
    if (!l.trim()) return l;
    const limpa = l.replace(RE_MARCADOR, "$1");
    if (tipo === "normal" || desligar) return limpa;
    n += 1;
    return (tipo === "ol" ? `${n}. ` : prefixoFixo[tipo]) + limpa.trimStart();
  });

  // título precisa de linha em branco antes/depois só se tiver texto colado; o leitor já separa por linha
  const novo = novas.join("\n");
  return { inicio: ini, fim, novo, selInicio: ini, selFim: ini + novo.length };
}

/** Envolve (ou desembrulha) a seleção com **negrito**, *itálico* etc. */
export function envolver(v: string, s: number, e: number, marca: string, exemplo: string): Troca {
  const sel = v.slice(s, e);
  const m = marca.length;

  // já envolvido por fora (marcas vizinhas à seleção)?
  const antes = v.slice(s - m, s);
  const depois = v.slice(e, e + m);
  const vizinhoIgual = (pos: number) => v[pos] === marca[0];
  const tocaOutra = marca.length === 1 && (vizinhoIgual(s - m - 1) || vizinhoIgual(e + m)); // "*" dentro de "**"
  if (s >= m && antes === marca && depois === marca && !tocaOutra) {
    return { inicio: s - m, fim: e + m, novo: sel, selInicio: s - m, selFim: s - m + sel.length };
  }
  // seleção já inclui as marcas
  if (sel.length > 2 * m && sel.startsWith(marca) && sel.endsWith(marca) && !(marca.length === 1 && sel.startsWith("**"))) {
    const dentro = sel.slice(m, sel.length - m);
    return { inicio: s, fim: e, novo: dentro, selInicio: s, selFim: s + dentro.length };
  }
  const texto = sel || exemplo;
  const novo = marca + texto + marca;
  return { inicio: s, fim: e, novo, selInicio: s + m, selFim: s + m + texto.length };
}

/** Transforma a seleção em [texto](url) */
export function inserirLink(v: string, s: number, e: number, url: string): Troca {
  const texto = v.slice(s, e) || "texto do link";
  const novo = `[${texto}](${url})`;
  return { inicio: s, fim: e, novo, selInicio: s + 1, selFim: s + 1 + texto.length };
}

/** Linha divisória em parágrafo próprio */
export function inserirDivisor(v: string, s: number, e: number): Troca {
  const antes = s === 0 || v.slice(Math.max(0, s - 2), s) === "\n\n" ? "" : v[s - 1] === "\n" ? "\n" : "\n\n";
  const depoisTxt = v.slice(e, e + 2) === "\n\n" ? "" : v[e] === "\n" ? "\n" : "\n\n";
  const novo = `${antes}---${depoisTxt}`;
  const pos = s + novo.length;
  return { inicio: s, fim: e, novo, selInicio: pos, selFim: pos };
}

/** Remove marcações (títulos, listas, negrito, itálico, links) da seleção ou da linha atual */
export function limparFormato(v: string, s: number, e: number): Troca {
  const { ini, fim } = e > s ? { ini: s, fim: e } : linhasDaSelecao(v, s, e);
  const novo = v
    .slice(ini, fim)
    .split("\n")
    .map((l) => l.replace(RE_MARCADOR, "$1"))
    .join("\n")
    .replace(/\*\*([\s\S]+?)\*\*/g, "$1")
    .replace(/\*([^*\s](?:[^*]*[^*\s])?)\*/g, "$1")
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)\s]+\)/g, "$1");
  return { inicio: ini, fim, novo, selInicio: ini, selFim: ini + novo.length };
}

/**
 * Enter dentro de uma lista: continua com o próximo marcador; em item
 * vazio, encerra a lista. Devolve null se a linha não for de lista.
 */
export function continuarLista(v: string, s: number): Troca | null {
  const ini = v.lastIndexOf("\n", s - 1) + 1;
  const linha = v.slice(ini, s);
  const m = /^(\s*)([-*•+]|\d+[.)])\s+(.*)$/.exec(linha);
  if (!m) return null;
  if (!m[3].trim()) {
    // item vazio: remove o marcador e sai da lista
    return { inicio: ini, fim: s, novo: "", selInicio: ini, selFim: ini };
  }
  const num = /^(\d+)([.)])$/.exec(m[2]);
  const proximo = num ? `${Number(num[1]) + 1}${num[2]}` : m[2];
  const novo = `\n${m[1]}${proximo} `;
  const pos = s + novo.length;
  return { inicio: s, fim: s, novo, selInicio: pos, selFim: pos };
}
