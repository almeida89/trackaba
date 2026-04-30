export type StatusSessao = "rascunho" | "finalizada" | "assinada" | "cancelada" | "falta";
export type HumorCrianca = "otimo" | "bom" | "neutro" | "irritado" | "ansioso" | "sonolento";
export type NivelDesempenho = "-" | "AFT" | "AFL" | "AG" | "IND" | "+";

export interface RegistroPrograma {
  programaId: string;
  programaNome: string;
  objetivo: string;
  tentativas: number;
  acertos: number;
  nivel: NivelDesempenho;
  observacao?: string;
}

export interface NarrativaABC {
  id: string;
  horario: string;
  antecedente: string;
  comportamento: string;
  consequencia: string;
  intensidade: "leve" | "moderada" | "intensa";
}

export interface ReforcadorUsado {
  nome: string;
  tipo: "tangivel" | "social" | "comestivel" | "atividade";
  efetividade: 1 | 2 | 3 | 4 | 5;
}

export interface Sessao {
  id: string;
  criancaId: string;
  criancaNome: string;
  profissionalId: string;
  profissionalNome: string;
  data: string; // ISO yyyy-mm-dd
  horaInicio: string;
  horaFim: string;
  duracaoMin: number;
  tipo: "ABA" | "Fono" | "TO" | "Psico" | "Psicopedagogia";
  local: "clinica" | "domiciliar" | "escolar" | "online";
  sala?: string;
  status: StatusSessao;
  humor?: HumorCrianca;
  notaGeral?: string;
  notaIncidente?: string;
  evolucaoDiaria?: string;
  registros: RegistroPrograma[];
  narrativaAbc: NarrativaABC[];
  reforcadores: ReforcadorUsado[];
  anexos: { nome: string; tipo: "imagem" | "video" | "audio" }[];
  assinadaEm?: string;
  assinadaPor?: string;
  assinaturaHash?: string;
  finalizadaEm?: string;
}

export const ROTULOS_STATUS_SESSAO: Record<StatusSessao, string> = {
  rascunho: "Rascunho",
  finalizada: "Finalizada",
  assinada: "Assinada",
  cancelada: "Cancelada",
  falta: "Falta",
};
