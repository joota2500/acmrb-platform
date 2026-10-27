/**
 * Middleware (roda no "edge", antes de cada página/rota)
 * ------------------------------------------------------------
 * 1) Dá a cada navegador um id de aparelho no cookie "acmrb_did".
 * 2) Barra aparelhos BLOQUEADOS ou SUSPENSOS pelo ADM DEUS:
 *      - páginas → mostram /acesso-bloqueado (status 403, noindex);
 *      - rotas /api → respondem 403.
 *
 * Como fica rápido: a lista de bloqueios ativos (pequena) é buscada no
 * Supabase com a chave do servidor e guardada em memória por 5 s em cada
 * instância. A checagem de cada visita é só uma consulta em memória (e, se
 * houver bloqueio por rede, um hash). Se o banco não responder, o site
 * continua abrindo (nunca derruba o site por falha de checagem). Por isso
 * um bloqueio novo vale na próxima navegação (até ~5 s). Quem está com a
 * página aberta é avisado pela rota /api/dispositivo/estado (~10 s).
 *
 * Nunca bloqueados: o painel (/admin e /api/admin), as rotas de limpeza
 * (/api/cron), aparelhos de administradores (tabela dispositivos_admin) e
 * robôs de busca/prévia de links (Google, Bing, WhatsApp...).
 * A chave SUPABASE_SERVICE_ROLE_KEY só é lida aqui no servidor.
 */

import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_DISPOSITIVO, COOKIE_VALIDADE_SEG, ROBOS_LIBERADOS, UUID_RE, dispositivoDoCookie } from "@/lib/dispositivo";
import { hashDoIpEdge } from "@/lib/hashEdge";

interface Bloqueio {
  dispositivo_id: string | null;
  ip_hash: string | null;
  tipo: "bloqueio" | "suspensao";
  motivo: string;
  ate: string | null;
}
interface Foto {
  em: number;
  bloqueios: Bloqueio[];
  protegidos: Set<string>;
}

const VALIDADE_MS = 5_000;
const ESPERA_MAX_MS = 1_500;
/** Caminhos que nunca são barrados (a página de aviso precisa abrir para quem está bloqueado) */
const LIVRES = /^\/(acesso-bloqueado|admin|api\/admin|api\/cron|api\/dispositivo\/estado)(\/|$)/;

let foto: Foto | null = null;
let buscando: Promise<Foto | null> | null = null;

async function lerTabela<T>(url: string, chave: string, tabela: string, consulta: string): Promise<T[] | null> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ESPERA_MAX_MS);
  try {
    const r = await fetch(`${url}/rest/v1/${tabela}?${consulta}`, {
      headers: { apikey: chave, Authorization: `Bearer ${chave}` },
      cache: "no-store",
      signal: ctl.signal,
    });
    return r.ok ? ((await r.json()) as T[]) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** Foto atual dos bloqueios (cache de 5 s; em falha, usa a anterior ou nenhuma) */
async function lerFoto(): Promise<Foto | null> {
  const agora = Date.now();
  if (foto && agora - foto.em < VALIDADE_MS) return foto;
  if (buscando) return buscando.then((f) => f ?? foto);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) return null;

  buscando = (async () => {
    const [b, p] = await Promise.all([
      lerTabela<Bloqueio>(url, chave, "dispositivos_bloqueios", "select=dispositivo_id,ip_hash,tipo,motivo,ate&ativo=eq.true&limit=2000"),
      lerTabela<{ dispositivo_id: string }>(url, chave, "dispositivos_admin", "select=dispositivo_id&limit=2000"),
    ]);
    if (!b) {
      // Falhou (ou a migration ainda não foi rodada): mantém a foto anterior e tenta de novo em 5 s
      if (foto) foto = { ...foto, em: Date.now() };
      else foto = { em: Date.now(), bloqueios: [], protegidos: new Set() };
      return foto;
    }
    foto = { em: Date.now(), bloqueios: b, protegidos: new Set((p ?? []).map((x) => x.dispositivo_id)) };
    return foto;
  })().finally(() => {
    buscando = null;
  });
  return buscando;
}

const ipDe = (req: NextRequest) =>
  (req.headers.get("x-real-ip") ?? req.headers.get("x-vercel-forwarded-for") ?? req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim().slice(0, 64) || null;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") ?? "";
  const robo = ROBOS_LIBERADOS.test(ua);
  const ehApi = pathname.startsWith("/api/");

  // Id do aparelho: cookie existente ou novo (não se cria para robôs nem para rotas /api)
  let did = dispositivoDoCookie(req.headers.get("cookie"));
  const criar = !did && !robo && !ehApi;
  if (criar) did = crypto.randomUUID();

  let bloqueio: Bloqueio | null = null;
  if (!robo && !LIVRES.test(pathname)) {
    const f = await lerFoto();
    if (f && f.bloqueios.length && !(did && f.protegidos.has(did))) {
      const agora = Date.now();
      // Vale enquanto não tiver prazo (indeterminado) ou o prazo ainda não chegou
      const efetivos = f.bloqueios.filter((b) => !b.ate || Date.parse(b.ate) > agora);
      if (efetivos.length) {
        const rede = efetivos.some((b) => b.ip_hash) ? ipDe(req) : null;
        const hashRede = rede ? await hashDoIpEdge(rede) : null;
        bloqueio = efetivos.find((b) => (did && b.dispositivo_id === did) || (hashRede && b.ip_hash === hashRede)) ?? null;
      }
    }
  }

  if (bloqueio) {
    if (ehApi) {
      return NextResponse.json(
        { erro: "Acesso bloqueado.", bloqueio: { tipo: bloqueio.tipo, motivo: bloqueio.motivo, ate: bloqueio.ate } },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }
    const cabecalhos = new Headers(req.headers);
    cabecalhos.set("x-acmrb-bloqueio-tipo", bloqueio.tipo);
    cabecalhos.set("x-acmrb-bloqueio-ate", bloqueio.ate ?? "");
    cabecalhos.set("x-acmrb-bloqueio-motivo", encodeURIComponent(bloqueio.motivo ?? "").slice(0, 1200));
    const resp = NextResponse.rewrite(new URL("/acesso-bloqueado", req.url), { status: 403, request: { headers: cabecalhos } });
    resp.headers.set("Cache-Control", "no-store");
    resp.headers.set("X-Robots-Tag", "noindex");
    return resp;
  }

  const resp = NextResponse.next();
  if (criar && did && UUID_RE.test(did)) {
    // Legível pelo navegador (httpOnly desligado) para o id das estatísticas ser o mesmo
    resp.cookies.set(COOKIE_DISPOSITIVO, did, {
      path: "/",
      maxAge: COOKIE_VALIDADE_SEG,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });
  }
  return resp;
}

export const config = {
  // Ignora arquivos estáticos e imagens (nunca precisam de checagem)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|icon.svg|apple-icon.png|icons/|images/|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|txt|woff2?)$).*)",
  ],
};
