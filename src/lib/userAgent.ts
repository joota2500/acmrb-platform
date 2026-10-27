/**
 * Lê o User-Agent e devolve aparelho, navegador e sistema (sem biblioteca).
 * É uma classificação aproximada, suficiente para estatística.
 * Usado SOMENTE no servidor (rota /api/acessos e logs de login).
 */

export interface InfoAparelho {
  dispositivo: "celular" | "tablet" | "computador" | "desconhecido";
  navegador: string;
  sistema: string;
  robo: boolean;
}

const ROBOS = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|lighthouse|headless|curl|wget|python-requests|axios|monitor|uptime|vercel-screenshot/i;

export function analisarUA(ua: string | null | undefined): InfoAparelho {
  const t = (ua ?? "").slice(0, 400);
  if (!t) return { dispositivo: "desconhecido", navegador: "Desconhecido", sistema: "Desconhecido", robo: false };

  const robo = ROBOS.test(t);
  const tablet = /iPad|Tablet|PlayBook|Silk/i.test(t) || (/Android/i.test(t) && !/Mobile/i.test(t));
  const celular = !tablet && /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(t);

  const navegador = /Edg(e|A|iOS)?\//.test(t) ? "Edge"
    : /OPR\/|Opera/.test(t) ? "Opera"
    : /SamsungBrowser/.test(t) ? "Samsung Internet"
    : /Firefox\/|FxiOS/.test(t) ? "Firefox"
    : /Chrome\/|CriOS/.test(t) ? "Chrome"
    : /Safari\//.test(t) ? "Safari"
    : "Outro";

  const sistema = /Android/.test(t) ? "Android"
    : /iPhone|iPad|iPod/.test(t) ? "iOS"
    : /Windows/.test(t) ? "Windows"
    : /Mac OS X|Macintosh/.test(t) ? "macOS"
    : /CrOS/.test(t) ? "ChromeOS"
    : /Linux/.test(t) ? "Linux"
    : "Outro";

  return { dispositivo: tablet ? "tablet" : celular ? "celular" : "computador", navegador, sistema, robo };
}
