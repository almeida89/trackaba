export type ParentescoFamiliar =
  | "Mãe"
  | "Pai"
  | "Avó"
  | "Avô"
  | "Tio(a)"
  | "Responsável legal"
  | "Outro";

export type StatusAcessoApp = "ativo" | "convite_enviado" | "sem_acesso" | "bloqueado";

export interface CriancaVinculada {
  criancaId: string;
  nome: string;
  principal: boolean;
}

export interface MembroFamilia {
  id: string;
  nome: string;
  parentesco: ParentescoFamiliar;
  email: string;
  telefone: string;
  cpf?: string;
  profissao?: string;
  observacoes?: string;
  recebeRelatorios: boolean;
  participaOrientacoes: boolean;
  statusAcessoApp: StatusAcessoApp;
  ultimoAcesso?: string;
  criancas: CriancaVinculada[];
  iniciais: string;
}

export interface ComunicacaoFamilia {
  id: string;
  membroId: string;
  data: string;
  tipo: "mensagem" | "ligacao" | "reuniao" | "email";
  assunto: string;
  resumo: string;
  responsavelClinica: string;
}
