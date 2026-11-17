/**
 * Validações e máscaras usadas nos formulários (padrão brasileiro)
 * ------------------------------------------------------------
 * - validarCPF: algoritmo oficial dos 2 dígitos verificadores
 * - mascaraCPF / mascaraTelefone: formatam enquanto o usuário digita
 * - somenteDigitos / gerarSlug: utilitários
 */

export const somenteDigitos = (v: string | null | undefined) => (v ?? "").replace(/\D/g, "");

/** true se o CPF (com ou sem máscara) for válido. */
export function validarCPF(valor: string): boolean {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; // 111.111.111-11 etc.

  const digito = (base: string, pesoInicial: number) => {
    const soma = base
      .split("")
      .reduce((acc, n, i) => acc + Number(n) * (pesoInicial - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = digito(cpf.slice(0, 9), 10);
  const d2 = digito(cpf.slice(0, 10), 11);
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10]);
}

/** 12345678901 → 123.456.789-01 */
export function mascaraCPF(v: string): string {
  return somenteDigitos(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** 85999998888 → (85) 99999-8888 ; 8533334444 → (85) 3333-4444 */
export function mascaraTelefone(v: string): string {
  const d = somenteDigitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** "José da Silva" → "jose-da-silva" */
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
