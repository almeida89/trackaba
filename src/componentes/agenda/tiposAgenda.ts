export interface Agendamento {
  id: string;
  criancaId: string;
  criancaNome: string;
  profissionalId: string;
  profissionalNome: string;
  tipo: TipoSessao;
  sala: string;
  dataInicio: Date;
  dataFim: Date;
  recorrencia?: Recorrencia;
  status: StatusAgendamento;
  observacoes?: string;
  cor: string;
}

export type TipoSessao =
  | "ABA Individual"
  | "ABA Grupo"
  | "Fonoaudiologia"
  | "Terapia Ocupacional"
  | "Psicologia"
  | "Supervisão"
  | "Avaliação";

export type StatusAgendamento =
  | "confirmado"
  | "pendente"
  | "cancelado"
  | "concluido"
  | "ausente";

export interface Recorrencia {
  tipo: "diaria" | "semanal" | "quinzenal" | "mensal";
  diasSemana?: number[]; // 0=dom, 1=seg...
  dataFimRecorrencia?: Date;
}

export type VistaAgenda = "semana" | "dia" | "mes";

export const coresTipoSessao: Record<TipoSessao, string> = {
  "ABA Individual": "hsl(174 60% 40%)",
  "ABA Grupo": "hsl(174 60% 55%)",
  Fonoaudiologia: "hsl(210 80% 55%)",
  "Terapia Ocupacional": "hsl(38 92% 50%)",
  Psicologia: "hsl(280 60% 55%)",
  Supervisão: "hsl(152 55% 48%)",
  Avaliação: "hsl(340 65% 55%)",
};

export const coresStatusAgendamento: Record<StatusAgendamento, string> = {
  confirmado: "bg-status-success/15 text-status-success border-status-success/30",
  pendente: "bg-status-warning/15 text-status-warning border-status-warning/30",
  cancelado: "bg-destructive/15 text-destructive border-destructive/30",
  concluido: "bg-primary/15 text-primary border-primary/30",
  ausente: "bg-muted text-muted-foreground border-border",
};

export const salasDisponiveis = [
  "Sala 1 — ABA",
  "Sala 2 — ABA",
  "Sala 3 — Fono",
  "Sala 4 — TO",
  "Sala 5 — Psicologia",
  "Sala Grupo",
];

export const profissionaisMock = [
  { id: "p1", nome: "Dra. Ana Souza", especialidade: "ABA" },
  { id: "p2", nome: "Dr. Carlos Lima", especialidade: "Fonoaudiologia" },
  { id: "p3", nome: "Dra. Fernanda Costa", especialidade: "Terapia Ocupacional" },
  { id: "p4", nome: "Dr. Paulo Dias", especialidade: "Psicologia" },
  { id: "p5", nome: "Dra. Mariana Alves", especialidade: "ABA" },
];

export const criancasMock = [
  { id: "1", nome: "Lucas Mendes" },
  { id: "2", nome: "Maria Silva" },
  { id: "3", nome: "Pedro Rocha" },
  { id: "4", nome: "Julia Santos" },
  { id: "5", nome: "Gabriel Oliveira" },
  { id: "6", nome: "Sofia Almeida" },
];

export function gerarHorarios(inicio: number = 7, fim: number = 20): string[] {
  const horarios: string[] = [];
  for (let h = inicio; h <= fim; h++) {
    horarios.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return horarios;
}

export function detectarConflitos(
  novoAgendamento: { profissionalId: string; sala: string; dataInicio: Date; dataFim: Date; id?: string },
  agendamentos: Agendamento[]
): { tipo: "profissional" | "sala" | "crianca"; mensagem: string }[] {
  const conflitos: { tipo: "profissional" | "sala" | "crianca"; mensagem: string }[] = [];

  for (const ag of agendamentos) {
    if (ag.id === novoAgendamento.id) continue;
    if (ag.status === "cancelado") continue;

    const sobrepoe =
      novoAgendamento.dataInicio < ag.dataFim && novoAgendamento.dataFim > ag.dataInicio;

    if (!sobrepoe) continue;

    if (ag.profissionalId === novoAgendamento.profissionalId) {
      conflitos.push({
        tipo: "profissional",
        mensagem: `${ag.profissionalNome} já tem sessão com ${ag.criancaNome} neste horário`,
      });
    }

    if (ag.sala === novoAgendamento.sala) {
      conflitos.push({
        tipo: "sala",
        mensagem: `${ag.sala} já está reservada para ${ag.criancaNome}`,
      });
    }
  }

  return conflitos;
}
