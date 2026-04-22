import { AcessoEscola } from "./tiposEscola";

const hoje = new Date();
const isoOffset = (dias: number) => {
  const d = new Date(hoje);
  d.setDate(d.getDate() + dias);
  return d.toISOString();
};

export const ACESSOS_ESCOLA_INICIAIS: AcessoEscola[] = [
  {
    id: "ae-1",
    criancaId: "1",
    criancaNome: "Lucas Mendes",
    escolaNome: "Colégio Sementinha",
    responsavelNome: "Profa. Beatriz Lopes",
    responsavelCargo: "Professora Regente - 1º Ano",
    email: "beatriz.lopes@sementinha.edu.br",
    telefone: "(11) 98765-1122",
    status: "ativo",
    criadoEm: isoOffset(-30),
    expiraEm: isoOffset(60),
    ultimoAcesso: isoOffset(-1),
    permissoes: {
      verSessoes: true,
      verEvolucao: true,
      verProgramas: true,
      verRelatorios: true,
      verIncidentes: false,
    },
    observacao: "Acompanhamento semanal alinhado com a coordenação pedagógica.",
  },
  {
    id: "ae-2",
    criancaId: "3",
    criancaNome: "Pedro Rocha",
    escolaNome: "Escola Bem-Me-Quer",
    responsavelNome: "Coord. Renata Vieira",
    responsavelCargo: "Coordenadora de Inclusão",
    email: "renata@bemmequer.com.br",
    status: "ativo",
    criadoEm: isoOffset(-12),
    expiraEm: isoOffset(78),
    ultimoAcesso: isoOffset(-3),
    permissoes: {
      verSessoes: true,
      verEvolucao: true,
      verProgramas: true,
      verRelatorios: false,
      verIncidentes: true,
    },
  },
  {
    id: "ae-3",
    criancaId: "2",
    criancaNome: "Maria Silva",
    escolaNome: "Instituto Aprender +",
    responsavelNome: "AT Joana Martins",
    responsavelCargo: "Auxiliar Terapêutica",
    email: "joana.at@aprendermais.org",
    status: "pendente",
    criadoEm: isoOffset(-2),
    expiraEm: isoOffset(88),
    permissoes: {
      verSessoes: true,
      verEvolucao: true,
      verProgramas: false,
      verRelatorios: false,
      verIncidentes: false,
    },
    observacao: "Aguardando aceite do convite enviado por e-mail.",
  },
  {
    id: "ae-4",
    criancaId: "5",
    criancaNome: "Gabriel Oliveira",
    escolaNome: "Colégio Novo Horizonte",
    responsavelNome: "Profa. Tatiane Reis",
    responsavelCargo: "Professora de Apoio",
    email: "tatiane.reis@novohorizonte.edu",
    status: "expirado",
    criadoEm: isoOffset(-120),
    expiraEm: isoOffset(-5),
    ultimoAcesso: isoOffset(-15),
    permissoes: {
      verSessoes: true,
      verEvolucao: true,
      verProgramas: true,
      verRelatorios: true,
      verIncidentes: true,
    },
  },
];

export const CORES_STATUS_ACESSO: Record<string, string> = {
  ativo: "bg-status-success/15 text-status-success border-status-success/30",
  pendente: "bg-status-warning/15 text-status-warning border-status-warning/30",
  expirado: "bg-muted text-muted-foreground border-border",
  revogado: "bg-destructive/15 text-destructive border-destructive/30",
};

export const ROTULOS_STATUS_ACESSO: Record<string, string> = {
  ativo: "Ativo",
  pendente: "Pendente",
  expirado: "Expirado",
  revogado: "Revogado",
};
