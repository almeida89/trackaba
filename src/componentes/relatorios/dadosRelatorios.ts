export interface RelatorioGerado {
  id: string;
  tipo: "evolucao" | "sessoes" | "programas" | "consolidado";
  criancaId: string;
  criancaNome: string;
  periodo: string;
  geradoEm: string;
  geradoPor: string;
}

export const HISTORICO_RELATORIOS: RelatorioGerado[] = [
  {
    id: "r1",
    tipo: "evolucao",
    criancaId: "1",
    criancaNome: "Lucas Mendes",
    periodo: "01/03/2026 a 31/03/2026",
    geradoEm: "2026-04-02",
    geradoPor: "Dra. Ana Souza",
  },
  {
    id: "r2",
    tipo: "consolidado",
    criancaId: "2",
    criancaNome: "Maria Silva",
    periodo: "01/01/2026 a 31/03/2026",
    geradoEm: "2026-04-05",
    geradoPor: "Dr. Carlos Lima",
  },
  {
    id: "r3",
    tipo: "sessoes",
    criancaId: "3",
    criancaNome: "Pedro Rocha",
    periodo: "01/04/2026 a 15/04/2026",
    geradoEm: "2026-04-16",
    geradoPor: "Dra. Fernanda Costa",
  },
  {
    id: "r4",
    tipo: "programas",
    criancaId: "5",
    criancaNome: "Gabriel Oliveira",
    periodo: "01/03/2026 a 31/03/2026",
    geradoEm: "2026-04-01",
    geradoPor: "Dra. Fernanda Costa",
  },
];

export const CRIANCAS_PARA_RELATORIO = [
  { id: "1", nome: "Lucas Mendes" },
  { id: "2", nome: "Maria Silva" },
  { id: "3", nome: "Pedro Rocha" },
  { id: "4", nome: "Julia Santos" },
  { id: "5", nome: "Gabriel Oliveira" },
  { id: "6", nome: "Sofia Almeida" },
];
