/**
 * Regras do login de VISITANTES (página /login)
 * ------------------------------------------------------------
 * - Esquemas zod de entrar, cadastro e recuperação de senha.
 * - MSG_CONTA_INVALIDA: mensagem genérica usada tanto para conta
 *   inexistente quanto para administradores (o /login nunca revela
 *   que existe conta de admin; eles entram pelo acesso restrito).
 */

import { z } from "zod";
import { somenteDigitos } from "@/lib/validacao";

export const MSG_CONTA_INVALIDA = "E-mail ou senha incorretos.";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Informe seu e-mail.")
  .email("E-mail inválido.");

export const esquemaEntrar = z.object({
  email,
  senha: z.string().min(1, "Informe sua senha."),
});

export const esquemaRecuperar = z.object({ email });

/** Idade em anos completos a partir de "AAAA-MM-DD" */
export function calcularIdade(data: string): number {
  const n = new Date(`${data}T00:00:00`);
  if (Number.isNaN(n.getTime())) return -1;
  const h = new Date();
  let idade = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) idade--;
  return idade;
}

export const esquemaCadastro = z
  .object({
    nome: z
      .string()
      .trim()
      .min(5, "Informe seu nome completo.")
      .max(100, "Nome muito longo.")
      .refine((v) => v.split(/\s+/).length >= 2, "Informe nome e sobrenome."),
    telefone: z
      .string()
      .refine((v) => [10, 11].includes(somenteDigitos(v).length), "Telefone com DDD, ex.: (85) 98888-7777."),
    cidade: z.string().trim().min(2, "Informe sua cidade.").max(80, "Cidade muito longa."),
    nascimento: z
      .string()
      .min(1, "Informe sua data de nascimento.")
      .refine((v) => {
        const i = calcularIdade(v);
        return i >= 0 && i <= 120;
      }, "Data de nascimento inválida.")
      .refine((v) => calcularIdade(v) >= 13, "É preciso ter pelo menos 13 anos."),
    email,
    senha: z
      .string()
      .min(8, "A senha precisa de 8 ou mais caracteres.")
      .regex(/[A-Z]/, "A senha precisa de uma letra maiúscula.")
      .regex(/[a-z]/, "A senha precisa de uma letra minúscula.")
      .regex(/\d/, "A senha precisa de um número."),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, { path: ["confirmar"], message: "As senhas não conferem." });

export type ErrosCampos = Partial<Record<string, string>>;

/** Converte o erro do zod em { campo: primeira mensagem } */
export function errosDoZod(e: z.ZodError): ErrosCampos {
  const saida: ErrosCampos = {};
  for (const i of e.issues) {
    const k = String(i.path[0] ?? "geral");
    if (!saida[k]) saida[k] = i.message;
  }
  return saida;
}
