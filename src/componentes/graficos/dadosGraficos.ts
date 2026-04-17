// Dados-semente para o módulo de Gráficos
// Cada criança possui programas individuais com registros de sessão

export type NivelDesempenho = "-" | "AFT" | "AFL" | "AG" | "IND" | "+";

export const NIVEIS_DESEMPENHO: Record<NivelDesempenho, { nome: string; valor: number; cor: string }> = {
  "-": { nome: "Linha Base", valor: 0, cor: "hsl(var(--muted-foreground))" },
  AFT: { nome: "Ajuda Física Total", valor: 1, cor: "hsl(var(--destructive))" },
  AFL: { nome: "Ajuda Física Leve", valor: 2, cor: "hsl(var(--status-warning))" },
  AG: { nome: "Ajuda Gestual", valor: 3, cor: "hsl(var(--status-info))" },
  IND: { nome: "Independente", valor: 4, cor: "hsl(var(--status-success))" },
  "+": { nome: "Acima do Esperado", valor: 5, cor: "hsl(var(--primary))" },
};

export interface RegistroSessao {
  data: string; // ISO
  nivel: NivelDesempenho;
  tentativasCorretas: number;
  tentativasTotais: number;
  observacao?: string;
}

export interface ProgramaCrianca {
  id: string;
  nome: string;
  disciplina: "ABA" | "Fonoaudiologia" | "Terapia Ocupacional" | "Psicologia" | "Psicopedagogia";
  tipo: "Aquisição" | "Manutenção" | "Generalização";
  objetivo: string;
  criadoEm: string;
  registros: RegistroSessao[];
}

export interface CriancaGrafico {
  id: string;
  nome: string;
  iniciais: string;
  idade: number;
  programas: ProgramaCrianca[];
}

// Gera registros simulando progressão clínica realista
function gerarRegistros(diasAtras: number, nivelInicial: number, nivelFinal: number): RegistroSessao[] {
  const niveis: NivelDesempenho[] = ["-", "AFT", "AFL", "AG", "IND", "+"];
  const registros: RegistroSessao[] = [];
  const passos = Math.max(diasAtras, 1);

  for (let i = 0; i < diasAtras; i++) {
    const data = new Date();
    data.setDate(data.getDate() - (diasAtras - i));
    const progresso = i / passos;
    const valorAlvo = nivelInicial + (nivelFinal - nivelInicial) * progresso;
    const ruido = (Math.random() - 0.5) * 0.8;
    const idx = Math.max(0, Math.min(5, Math.round(valorAlvo + ruido)));
    const tentativasTotais = 10;
    const tentativasCorretas = Math.max(0, Math.min(10, Math.round((idx / 5) * 10 + (Math.random() - 0.5) * 2)));

    registros.push({
      data: data.toISOString(),
      nivel: niveis[idx],
      tentativasCorretas,
      tentativasTotais,
    });
  }
  return registros;
}

export const CRIANCAS_GRAFICOS: CriancaGrafico[] = [
  {
    id: "1",
    nome: "Lucas Andrade",
    iniciais: "LA",
    idade: 6,
    programas: [
      {
        id: "p1",
        nome: "Contato Visual",
        disciplina: "ABA",
        tipo: "Aquisição",
        objetivo: "Manter contato visual por 5 segundos quando chamado pelo nome",
        criadoEm: "2024-09-01",
        registros: gerarRegistros(30, 1, 4),
      },
      {
        id: "p2",
        nome: "Imitação Motora Grossa",
        disciplina: "ABA",
        tipo: "Aquisição",
        objetivo: "Imitar 10 movimentos motores grossos sob comando",
        criadoEm: "2024-09-10",
        registros: gerarRegistros(25, 0, 3),
      },
      {
        id: "p3",
        nome: "Nomeação de Objetos",
        disciplina: "Fonoaudiologia",
        tipo: "Aquisição",
        objetivo: "Nomear 20 objetos do cotidiano de forma independente",
        criadoEm: "2024-09-15",
        registros: gerarRegistros(20, 1, 4),
      },
    ],
  },
  {
    id: "2",
    nome: "Sofia Martins",
    iniciais: "SM",
    idade: 5,
    programas: [
      {
        id: "p4",
        nome: "Pedido com PECS",
        disciplina: "Fonoaudiologia",
        tipo: "Aquisição",
        objetivo: "Fazer pedidos usando cartões PECS de forma espontânea",
        criadoEm: "2024-08-20",
        registros: gerarRegistros(40, 0, 4),
      },
      {
        id: "p5",
        nome: "Coordenação Motora Fina",
        disciplina: "Terapia Ocupacional",
        tipo: "Aquisição",
        objetivo: "Realizar atividades de pinça com precisão",
        criadoEm: "2024-09-05",
        registros: gerarRegistros(28, 1, 3),
      },
    ],
  },
  {
    id: "3",
    nome: "Pedro Henrique",
    iniciais: "PH",
    idade: 7,
    programas: [
      {
        id: "p6",
        nome: "Comportamento em Sala",
        disciplina: "Psicologia",
        tipo: "Manutenção",
        objetivo: "Permanecer sentado durante atividades por 15 minutos",
        criadoEm: "2024-07-10",
        registros: gerarRegistros(35, 2, 5),
      },
      {
        id: "p7",
        nome: "Leitura Funcional",
        disciplina: "Psicopedagogia",
        tipo: "Aquisição",
        objetivo: "Reconhecer e ler 30 palavras funcionais",
        criadoEm: "2024-08-01",
        registros: gerarRegistros(32, 1, 4),
      },
    ],
  },
];
