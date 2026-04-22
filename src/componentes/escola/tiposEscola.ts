export type StatusAcessoEscola = "ativo" | "pendente" | "expirado" | "revogado";

export interface AcessoEscola {
  id: string;
  criancaId: string;
  criancaNome: string;
  escolaNome: string;
  responsavelNome: string;
  responsavelCargo: string;
  email: string;
  telefone?: string;
  status: StatusAcessoEscola;
  criadoEm: string; // ISO
  expiraEm: string; // ISO
  ultimoAcesso?: string; // ISO
  permissoes: {
    verSessoes: boolean;
    verEvolucao: boolean;
    verProgramas: boolean;
    verRelatorios: boolean;
    verIncidentes: boolean;
  };
  observacao?: string;
}
