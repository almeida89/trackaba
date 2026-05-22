import type { CargoFuncionario } from "@/componentes/funcionarios/tiposFuncionarios";

export type GrupoPermissaoCargo = "terapeuta" | "administracao";

// Mapeamento central para evitar regras repetidas no JSX.
const grupoPorCargo: Record<CargoFuncionario, GrupoPermissaoCargo> = {
  "Analista do Comportamento": "terapeuta",
  "Terapeuta ABA": "terapeuta",
  "Psicólogo(a)": "terapeuta",
  "Fonoaudiologo(a)": "terapeuta",
  "Terapeuta Ocupacional": "terapeuta",
  "Coordernador(a) Clínico(a)": "administracao",
  "Supervisor(a)": "administracao",
  "Recepção": "administracao",
  Administrativo: "administracao",
};

export function grupoPermissaoPorCargo(cargo: CargoFuncionario): GrupoPermissaoCargo {
  return grupoPorCargo[cargo];
}

// Helper didático: encapsula toda a regra de acesso administrativo.
export function hasAdminAccess(cargo: CargoFuncionario): boolean {
  return grupoPermissaoPorCargo(cargo) === "administracao";
}
