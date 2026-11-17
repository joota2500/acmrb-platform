/**
 * markdownNoticia — interpretador do texto das notícias (sem HTML cru)
 * ------------------------------------------------------------
 * Converte o texto escrito no painel em uma lista de "blocos" e
 * "trechos" que o React desenha (ver ConteudoNoticia). Nada é injetado
 * como HTML, então não há risco de script.
 *
 * Aceita (linha a linha, não precisa de linha em branco entre eles):
 *   # Título 1   ## Título 2   ### Título 3   #### Título 4
 *   - item  /  * item  /  • item          → lista com marcadores
 *   1. item  /  1) item                   → lista numerada
 *   > citação                             → citação
 *   ---                                   → linha divisória
 *   **negrito**  *itálico*  [texto](https://link)  e links soltos
 * Também limpa casos que apareciam com "#" na tela: título dentro de
 * negrito (**## Título**), título colado no parágrafo seguinte e
 * HTML antigo (<p>, <br>).
 */

export type Trecho =
  | { t: "texto"; v: string }
  | { t: "negrito"; v: Trecho[] }
  | { t: "italico"; v: Trecho[] }
  | { t: "link"; href: string; v: Trecho[] }
  | { t: "br" };

export type Bloco =
  | { t: "titulo"; nivel: 1 | 2 | 3 | 4; v: Trecho[] }
  | { t: "paragrafo"; v: Trecho[] }
  | { t: "lista"; ordenada: boolean; itens: Trecho[][] }
  | { t: "citacao"; v: Trecho[] }
  | { t: "divisor" };

/** Converte HTML antigo em quebras de linha simples */
function limparHtml(texto: string): string {
  return texto
    .replace(/\r\n?/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

const RE_LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/;
const RE_NEGRITO = /\*\*([\s\S]+?)\*\*/;
const RE_ITALICO = /\*([^*\s](?:[^*]*[^*\s])?)\*/;
const RE_URL = /https?:\/\/[^\s<>()]+/;

/** Trechos inline: negrito, itálico, links e quebras de linha */
export function trechos(texto: string): Trecho[] {
  const saida: Trecho[] = [];
  let resto = texto;

  const empurrarTexto = (s: string) => {
    if (!s) return;
    s.split("\n").forEach((linha, i) => {
      if (i > 0) saida.push({ t: "br" });
      if (linha) saida.push({ t: "texto", v: linha });
    });
  };

  while (resto) {
    const candidatos = [
      { tipo: "link", m: RE_LINK.exec(resto) },
      { tipo: "negrito", m: RE_NEGRITO.exec(resto) },
      { tipo: "italico", m: RE_ITALICO.exec(resto) },
      { tipo: "url", m: RE_URL.exec(resto) },
    ].filter((c): c is { tipo: string; m: RegExpExecArray } => !!c.m);

    if (!candidatos.length) {
      empurrarTexto(resto);
      break;
    }
    // o que aparece primeiro; em empate, a ordem acima (link > negrito > itálico > url)
    const c = candidatos.reduce((a, b) => (b.m.index < a.m.index ? b : a));
    const { m } = c;
    empurrarTexto(resto.slice(0, m.index));

    if (c.tipo === "link") saida.push({ t: "link", href: m[2], v: trechos(m[1]) });
    else if (c.tipo === "negrito") {
      const dentro = m[1].trim();
      if (dentro) saida.push({ t: "negrito", v: trechos(dentro) });
    } else if (c.tipo === "italico") saida.push({ t: "italico", v: trechos(m[1]) });
    else {
      // link solto: tira a pontuação final do endereço
      const url = m[0].replace(/[.,;:!?]+$/, "");
      saida.push({ t: "link", href: url, v: [{ t: "texto", v: url }] });
      resto = resto.slice(m.index + url.length);
      continue;
    }
    resto = resto.slice(m.index + m[0].length);
  }
  return saida;
}

const RE_TITULO = /^\s{0,3}(#{1,4})\s+(.+?)\s*#*\s*$/;
const RE_DIVISOR = /^\s*([-*_])(\s*\1){2,}\s*$/;
const RE_CITACAO = /^\s*>\s?(.*)$/;
const RE_LISTA = /^(\s*)[-*•+]\s+(.+)$/;
const RE_NUMERADA = /^(\s*)\d+[.)]\s+(.+)$/;

/** Divide o texto em blocos (títulos, parágrafos, listas, citações) */
export function blocos(texto: string): Bloco[] {
  // título dentro de negrito ("**## Título**") vira só o título
  const linhas = limparHtml(texto)
    .split("\n")
    .map((l) => l.replace(/^\s*\*\*\s*(#{1,4}\s+.+?)\s*\*\*\s*$/, "$1"));

  const saida: Bloco[] = [];
  let par: string[] = [];
  let citacao: string[] = [];
  let ultimaLista: Extract<Bloco, { t: "lista" }> | null = null;
  let vazioDesdeLista = false;

  const fecharParagrafo = () => {
    const v = par.join("\n").trim();
    if (v) saida.push({ t: "paragrafo", v: trechos(v) });
    par = [];
  };
  const fecharCitacao = () => {
    const v = citacao.join("\n").trim();
    if (v) saida.push({ t: "citacao", v: trechos(v) });
    citacao = [];
  };
  const fecharTudo = () => {
    fecharParagrafo();
    fecharCitacao();
  };

  for (const linha of linhas) {
    // linha em branco encerra parágrafo/citação; a lista pode continuar depois dela
    if (!linha.trim()) {
      fecharTudo();
      if (ultimaLista) vazioDesdeLista = true;
      continue;
    }

    const titulo = RE_TITULO.exec(linha);
    if (titulo) {
      fecharTudo();
      ultimaLista = null;
      saida.push({ t: "titulo", nivel: titulo[1].length as 1 | 2 | 3 | 4, v: trechos(titulo[2].replace(/\*\*/g, "")) });
      continue;
    }
    if (RE_DIVISOR.test(linha)) {
      fecharTudo();
      ultimaLista = null;
      saida.push({ t: "divisor" });
      continue;
    }
    const cit = RE_CITACAO.exec(linha);
    if (cit) {
      fecharParagrafo();
      ultimaLista = null;
      citacao.push(cit[1]);
      continue;
    }
    const ul = RE_LISTA.exec(linha);
    const ol = RE_NUMERADA.exec(linha);
    if (ul || ol) {
      fecharTudo();
      const ordenada = !!ol;
      const item = trechos((ul ?? ol)![2].trim());
      // junta com a lista anterior do mesmo tipo (mesmo com linhas em branco no meio)
      if (ultimaLista && ultimaLista.ordenada === ordenada) {
        ultimaLista.itens.push(item);
      } else {
        ultimaLista = { t: "lista", ordenada, itens: [item] };
        saida.push(ultimaLista);
      }
      vazioDesdeLista = false;
      continue;
    }
    // linha recuada logo após um item: continua o mesmo item
    if (ultimaLista && !vazioDesdeLista && /^\s+\S/.test(linha)) {
      const itens = ultimaLista.itens;
      itens[itens.length - 1] = [...itens[itens.length - 1], { t: "br" }, ...trechos(linha.trim())];
      continue;
    }

    fecharCitacao();
    ultimaLista = null;
    par.push(linha);
  }
  fecharTudo();
  return saida;
}
