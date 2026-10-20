/**
 * Regras de senha forte (mesmas do servidor) com indicação ao vivo.
 * Usado no painel (criar admin, Minha conta) e em /redefinir-senha.
 */

const REGRAS = [
  { rotulo: "8 ou mais caracteres", ok: (s: string) => s.length >= 8 },
  { rotulo: "Uma letra maiúscula", ok: (s: string) => /[A-Z]/.test(s) },
  { rotulo: "Uma letra minúscula", ok: (s: string) => /[a-z]/.test(s) },
  { rotulo: "Um número", ok: (s: string) => /\d/.test(s) },
];

export const senhaValida = (s: string) => REGRAS.every((r) => r.ok(s));

export function RegrasSenha({ senha }: { senha: string }) {
  return (
    <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">
      {REGRAS.map((r) => (
        <li key={r.rotulo} className={r.ok(senha) ? "text-emerald-700" : "text-zinc-400"}>
          {r.ok(senha) ? "✓" : "•"} {r.rotulo}
        </li>
      ))}
    </ul>
  );
}
