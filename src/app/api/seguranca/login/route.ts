/**
 * API — Proteção de login, cadastro e recuperação de senha
 * (POST /api/seguranca/login)
 * ------------------------------------------------------------
 * O navegador chama esta rota em duas etapas:
 *   { acao: "verificar", tipo, email }  → ANTES de tentar entrar.
 *        Responde { permitido, segundos?, mensagem? }. Bloqueia por um
 *        tempo depois de várias senhas erradas e limita cadastros e
 *        pedidos de nova senha por rede.
 *   { acao: "resultado", tipo, email, sucesso, motivo? } → DEPOIS.
 *        Grava no log (login_tentativas). Um "sucesso" só vale se o
 *        token enviado for mesmo do e-mail informado.
 * Sem IP cru: só hash. E-mail guardado como hash + versão mascarada.
 * Sem a chave do servidor ou sem a migration, libera tudo (o login
 * continua funcionando; só não há bloqueio nem log).
 * Honestidade: o bloqueio vale para o formulário do site. Quem falar
 * direto com a API do Supabase só é contido pelos limites do próprio
 * Supabase Auth (veja docs/seguranca.md).
 */

import { NextResponse } from "next/server";
import { clienteServidor } from "@/lib/supabaseServidor";
import { analisarUA } from "@/lib/userAgent";
import { geoDaRequisicao, hashar, hashDoIp, limitar, mascararEmail } from "@/lib/segurancaServidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS = ["login", "cadastro", "recuperar"] as const;
type Tipo = (typeof TIPOS)[number];
const EMAIL = /^[^\s@]{1,100}@[^\s@]{1,100}\.[^\s@]{1,20}$/;

const liberado = () => NextResponse.json({ permitido: true });
const texto = (min: number) => `Muitas tentativas. Tente novamente em ${Math.max(1, Math.ceil(min / 60))} min.`;

export async function POST(req: Request) {
  const admin = clienteServidor();
  if (!admin) return liberado();

  const c = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!c) return NextResponse.json({ permitido: true });
  const tipo = TIPOS.find((t) => t === c.tipo) as Tipo | undefined;
  const email = String(c.email ?? "").trim().toLowerCase();
  if (!tipo || !EMAIL.test(email)) return liberado();

  const hEmail = hashar(`email:${email}`);
  const hIp = hashDoIp(req);

  try {
    // ---------- Antes de tentar ----------
    if (c.acao === "verificar") {
      // Limite geral de consultas desta rede
      if (hIp) {
        const geral = await limitar(admin, `verificar:${hIp}`, 120, 600);
        if (!geral.permitido) return NextResponse.json({ permitido: false, segundos: geral.restanteSeg, mensagem: texto(geral.restanteSeg) }, { status: 429 });
      }
      if (tipo === "cadastro" && hIp) {
        const r = await limitar(admin, `cadastro:${hIp}`, 8, 3600);
        if (!r.permitido) return NextResponse.json({ permitido: false, segundos: r.restanteSeg, mensagem: "Muitos cadastros desta rede. " + texto(r.restanteSeg) }, { status: 429 });
      }
      if (tipo === "recuperar") {
        const porRede = hIp ? await limitar(admin, `recuperar:${hIp}`, 6, 3600) : { permitido: true, restanteSeg: 0 };
        const porEmail = await limitar(admin, `recuperar-email:${hEmail}`, 3, 3600);
        const bloq = !porRede.permitido ? porRede : !porEmail.permitido ? porEmail : null;
        if (bloq) return NextResponse.json({ permitido: false, segundos: bloq.restanteSeg, mensagem: "Muitos pedidos de nova senha. " + texto(bloq.restanteSeg) }, { status: 429 });
      }
      if (tipo === "login") {
        const { data } = await admin.rpc("login_bloqueio", { p_email_hash: hEmail, p_ip_hash: hIp });
        const seg = Number(data ?? 0);
        if (seg > 0) {
          return NextResponse.json(
            { permitido: false, segundos: seg, mensagem: `Acesso bloqueado por segurança após várias tentativas. Tente novamente em ${Math.max(1, Math.ceil(seg / 60))} min ou use "Esqueci minha senha".` },
            { status: 429 },
          );
        }
      }
      return liberado();
    }

    // ---------- Depois da tentativa ----------
    if (c.acao === "resultado") {
      if (hIp) {
        const lim = await limitar(admin, `resultado:${hIp}`, 60, 600);
        if (!lim.permitido) return new NextResponse(null, { status: 429 });
      }
      let sucesso = c.sucesso === true;
      let authId: string | null = null;
      if (sucesso) {
        const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        const { data } = token ? await admin.auth.getUser(token) : { data: { user: null } };
        if (data.user?.email?.toLowerCase() === email) authId = data.user.id;
        else sucesso = false; // ninguém pode "declarar" um acerto sem token válido
      }
      const ua = analisarUA(req.headers.get("user-agent"));
      const geo = geoDaRequisicao(req);
      await admin.from("login_tentativas").insert({
        tipo,
        sucesso,
        motivo: typeof c.motivo === "string" ? c.motivo.slice(0, 80) : null,
        email_hash: hEmail,
        email_mascarado: mascararEmail(email),
        ip_hash: hIp,
        auth_user_id: authId,
        dispositivo: ua.dispositivo,
        navegador: ua.navegador,
        ...geo,
      });
      return new NextResponse(null, { status: 204 });
    }
  } catch {
    /* proteção nunca derruba o login */
  }
  return liberado();
}
