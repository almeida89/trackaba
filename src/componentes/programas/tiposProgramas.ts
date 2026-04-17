// Tipos do módulo de Programas
export type DisciplinaPrograma =
  | "ABA"
  | "Fonoaudiologia"
  | "Terapia Ocupacional"
  | "Psicologia"
  | "Psicopedagogia";

export type TipoPrograma = "Aquisição" | "Manutenção" | "Generalização";

export type StatusPrograma = "ativo" | "pausado" | "concluido";

export interface Objetivo {
  id: string;
  descricao: string;
  criterio: string;
  concluido: boolean;
}

export interface Programa {
  id: string;
  nome: string;
  disciplina: DisciplinaPrograma;
  tipo: TipoPrograma;
  status: StatusPrograma;
  objetivoGeral: string;
  descricao: string;
  objetivos: Objetivo[];
  tentativasPorSessao: number;
  criterioMaestria: string;
  criadoEm: string;
  criadoPor: string;
  criancaId?: string; // se vazio, é da biblioteca
  baseadoEm?: string; // id do programa original (clonagem)
  ordem: number;
}
