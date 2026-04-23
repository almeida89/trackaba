export type CargoFuncionario =
  | "Analista de Comportamento"
  | "Terapeuta ABA"
  | "Psicólogo(a)"
  | "Fonoaudiólogo(a)"
  | "Terapeuta Ocupacional"
  | "Coordenador(a) Clínico(a)"
  | "Supervisor(a)"
  | "Recepção"
  | "Administrativo";

export type StatusFuncionario = "ativo" | "ferias" | "afastado" | "inativo";

export type NivelAcesso = "admin" | "clinico" | "operacional" | "visualizador";

export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: CargoFuncionario;
  registroProfissional?: string;
  especialidades: string[];
  status: StatusFuncionario;
  nivelAcesso: NivelAcesso;
  dataAdmissao: string;
  cargaHorariaSemanal: number;
  criancasAtendidas: number;
  sessoesNoMes: number;
  iniciais: string;
}
