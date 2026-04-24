export type ProtocoloAvaliacao = "VB-MAPP" | "AFLS" | "ABLLS-R" | "Vineland-3" | "PEP-3" | "Anamnese" | "Checklist";

export type StatusAvaliacao = "rascunho" | "em_andamento" | "concluida" | "revisao";

export interface DominioAvaliacao {
  id: string;
  nome: string;
  pontuacao: number;
  pontuacaoMaxima: number;
  observacoes?: string;
}

export interface Avaliacao {
  id: string;
  criancaId: string;
  criancaNome: string;
  protocolo: ProtocoloAvaliacao;
  titulo: string;
  status: StatusAvaliacao;
  dataInicio: string;
  dataConclusao?: string;
  responsavel: string;
  cargoResponsavel: string;
  dominios: DominioAvaliacao[];
  pontuacaoTotal: number;
  pontuacaoMaxima: number;
  resumoClinico?: string;
  proximosPassos?: string;
  proximaReavaliacao?: string;
}

export interface ItemChecklistAnamnese {
  id: string;
  pergunta: string;
  resposta?: string;
  categoria: string;
}
