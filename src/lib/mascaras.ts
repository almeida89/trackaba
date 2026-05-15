/**
 * Utilitário local de máscaras (sem dependências externas).
 * Cada função aceita string crua e devolve string formatada,
 * preservando dígitos parciais durante a digitação.
 */

export function apenasDigitos(valor: string): string {
  return (valor ?? "").replace(/\D+/g, "");
}

/**
 * Telefone BR: aceita fixo (10) ou celular (11).
 *  - 10 dígitos → (11) 1234-5678
 *  - 11 dígitos → (11) 91234-5678
 */
export function mascararTelefone(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** CPF: 000.000.000-00 */
export function mascararCpf(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** CEP: 00000-000 */
export function mascararCep(valor: string): string {
  const d = apenasDigitos(valor).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function telefoneValido(valor: string): boolean {
  const d = apenasDigitos(valor);
  return d.length === 10 || d.length === 11;
}

export function cpfValido(valor: string): boolean {
  const d = apenasDigitos(valor);
  if (d.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(d)) return false;
  const calc = (base: string, peso: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += parseInt(base[i], 10) * (peso - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const dv1 = calc(d.slice(0, 9), 10);
  const dv2 = calc(d.slice(0, 10), 11);
  return dv1 === parseInt(d[9], 10) && dv2 === parseInt(d[10], 10);
}
