import { z } from "zod";

const regexTelefone = /^[\d\s()+-]{8,20}$/;

export const criancaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(120, "Nome muito longo"),
  data_nascimento: z
    .string()
    .min(1, "Data de nascimento obrigatória")
    .refine((v) => {
      const d = new Date(v);
      if (isNaN(d.getTime())) return false;
      const hoje = new Date();
      return d <= hoje && d.getFullYear() >= 1950;
    }, "Data de nascimento inválida"),
  diagnostico: z
    .string()
    .trim()
    .min(2, "Informe o diagnóstico")
    .max(200, "Diagnóstico muito longo"),
  responsavel_principal: z
    .string()
    .trim()
    .max(120, "Nome muito longo")
    .optional()
    .or(z.literal("")),
  telefone_contato: z
    .string()
    .trim()
    .regex(regexTelefone, "Telefone inválido")
    .optional()
    .or(z.literal("")),
  email_contato: z
    .string()
    .trim()
    .email("Email inválido")
    .max(255)
    .optional()
    .or(z.literal("")),
  observacoes: z
    .string()
    .trim()
    .max(2000, "Observações muito longas")
    .optional()
    .or(z.literal("")),
});

export type CriancaForm = z.infer<typeof criancaSchema>;

export const TAMANHO_PAGINA = 12;
