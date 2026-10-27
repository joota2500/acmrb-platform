/** @type {import('next').NextConfig} */

// ---------------------------------------------------------------
// Cabeçalhos de segurança (valem para todas as páginas)
// ---------------------------------------------------------------
// CSP "básica" pensada para NÃO quebrar o que o site usa hoje:
//  - Supabase (API, Storage e tempo real)      → connect-src / img-src
//  - Mapa Leaflet (tiles OpenStreetMap e Esri) → img-src https:
//  - Busca de endereço (Nominatim, Photon, ArcGIS, BrasilAPI) → connect-src
//  - Vídeo do YouTube e posts do Instagram     → frame-src
//  - Estilos e scripts embutidos do Next.js    → 'unsafe-inline'
//    (um nonce por requisição é o próximo passo, mas exige tornar todas
//    as páginas dinâmicas; por isso fica como melhoria futura)
// Se algum serviço novo for usado (outro mapa, outro vídeo...), inclua o
// endereço dele na lista certa abaixo.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseHttp = "https://*.supabase.co";
let supabaseWs = "wss://*.supabase.co";
try {
  const u = new URL(supabaseUrl);
  supabaseHttp = `${u.protocol}//${u.host}`;
  supabaseWs = `${u.protocol === "https:" ? "wss" : "ws"}://${u.host}`;
} catch {
  /* sem variável: usa o curinga do Supabase */
}

const emDesenvolvimento = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  // 'unsafe-eval' só no modo de desenvolvimento (o Next precisa para o recarregamento rápido)
  `script-src 'self' 'unsafe-inline'${emDesenvolvimento ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    supabaseHttp,
    supabaseWs,
    "https://nominatim.openstreetmap.org",
    "https://photon.komoot.io",
    "https://geocode.arcgis.com",
    "https://brasilapi.com.br",
    "https://publica.cnpj.ws",
    emDesenvolvimento ? "ws://localhost:* http://localhost:*" : "",
  ].filter(Boolean).join(" "),
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.instagram.com",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  emDesenvolvimento ? "" : "upgrade-insecure-requests",
].filter(Boolean).join("; ");

const cabecalhosSeguranca = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  reactStrictMode: true,
  // Não anuncia "X-Powered-By: Next.js"
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: cabecalhosSeguranca }];
  },
};

module.exports = nextConfig;
