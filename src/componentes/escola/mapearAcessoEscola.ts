import { AcessoEscola, StatusAcessoEscola } from "./tiposEscola";
import type { Tables } from "@/integrations/supabase/types";

type LinhaAcesso = Tables<"acessos_escola">;

export const mapearLinhaParaAcesso = (linha: LinhaAcesso): AcessoEscola => ({
  id: linha.id,
  criancaId: linha.crianca_id,
  criancaNome: linha.crianca_nome,
  escolaNome: linha.escola_nome,
  responsavelNome: linha.responsavel_nome,
  responsavelCargo: linha.responsavel_cargo,
  email: linha.email,
  telefone: linha.telefone ?? undefined,
  status: linha.status as StatusAcessoEscola,
  criadoEm: linha.criado_em,
  expiraEm: linha.expira_em,
  ultimoAcesso: linha.ultimo_acesso ?? undefined,
  permissoes: {
    verSessoes: linha.ver_sessoes,
    verEvolucao: linha.ver_evolucao,
    verProgramas: linha.ver_programas,
    verRelatorios: linha.ver_relatorios,
    verIncidentes: linha.ver_incidentes,
  },
  observacao: linha.observacao ?? undefined,
});
