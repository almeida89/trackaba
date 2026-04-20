import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Stethoscope,
  Users,
  GraduationCap,
  ClipboardList,
  BookOpen,
  FileCheck,
  BarChart3,
  FileText,
  Paperclip,
  History,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SessoesCrianca } from "@/componentes/sessoes/SessoesCrianca";

const abas = [
  { id: "cadastro", label: "Cadastro", icone: User },
  { id: "medico", label: "Médico", icone: Stethoscope },
  { id: "familiar", label: "Familiar", icone: Users },
  { id: "escola", label: "Escola", icone: GraduationCap },
  { id: "acompanhante", label: "Acomp. Escolar", icone: UserCheck },
  { id: "sessoes", label: "Sessões", icone: ClipboardList },
  { id: "programas", label: "Programas", icone: BookOpen },
  { id: "avaliacoes", label: "Avaliações", icone: FileCheck },
  { id: "graficos", label: "Gráficos", icone: BarChart3 },
  { id: "relatorios", label: "Relatórios", icone: FileText },
  { id: "anexos", label: "Anexos", icone: Paperclip },
  { id: "historico", label: "Histórico", icone: History },
];

const niveisDesempenho = [
  { sigla: "-", nome: "Linha Base", cor: "bg-muted text-muted-foreground" },
  { sigla: "AFT", nome: "Ajuda Física Total", cor: "bg-destructive/15 text-destructive" },
  { sigla: "AFL", nome: "Ajuda Física Leve", cor: "bg-status-warning/15 text-status-warning" },
  { sigla: "AG", nome: "Ajuda Gestual", cor: "bg-status-info/15 text-status-info" },
  { sigla: "IND", nome: "Independente", cor: "bg-status-success/15 text-status-success" },
  { sigla: "+", nome: "Acima do Esperado", cor: "bg-primary/15 text-primary" },
];

function ConteudoCadastro() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-foreground">Dados Pessoais</h3>
        {[
          ["Nome Completo", "Lucas Mendes da Silva"],
          ["Data de Nascimento", "15/03/2021"],
          ["Idade", "5 anos"],
          ["CPF Responsável", "123.456.789-00"],
          ["Endereço", "Rua das Flores, 123 — São Paulo, SP"],
        ].map(([rotulo, valor]) => (
          <div key={rotulo}>
            <p className="text-xs text-muted-foreground">{rotulo}</p>
            <p className="text-sm font-medium text-foreground">{valor}</p>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-foreground">Informações Clínicas</h3>
        {[
          ["Diagnóstico", "TEA Nível 1 (CID F84.0)"],
          ["Data do Diagnóstico", "10/06/2023"],
          ["Médico Responsável", "Dr. Roberto Campos"],
          ["Convênio", "Unimed — Plano Premium"],
          ["Observações", "Hipersensibilidade auditiva. Interesses restritos em dinossauros."],
        ].map(([rotulo, valor]) => (
          <div key={rotulo}>
            <p className="text-xs text-muted-foreground">{rotulo}</p>
            <p className="text-sm font-medium text-foreground">{valor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConteudoProgramas() {
  const programasMock = [
    { nome: "Comunicação Funcional", objetivo: "Solicitar itens usando PECS", progresso: 65, nivel: "AG" },
    { nome: "Habilidades Sociais", objetivo: "Iniciar interação com pares", progresso: 40, nivel: "AFL" },
    { nome: "Autonomia - AVDs", objetivo: "Escovar os dentes de forma independente", progresso: 80, nivel: "IND" },
    { nome: "Regulação Emocional", objetivo: "Identificar emoções básicas em figuras", progresso: 55, nivel: "AG" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-foreground">Programas Ativos</h3>
        <Badge variant="outline" className="text-xs">
          {programasMock.length} programas
        </Badge>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {niveisDesempenho.map((n) => (
          <span
            key={n.sigla}
            className={cn("text-xs px-2 py-1 rounded-md font-medium", n.cor)}
          >
            {n.sigla} — {n.nome}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        {programasMock.map((prog, i) => {
          const nivel = niveisDesempenho.find((n) => n.sigla === prog.nivel);
          return (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{prog.nome}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {prog.objetivo}
                  </p>
                </div>
                {nivel && (
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-md font-semibold shrink-0",
                      nivel.cor
                    )}
                  >
                    {nivel.sigla}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span>{prog.progresso}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${prog.progresso}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function PlaceholderAba({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <p className="text-sm">Seção <strong>{titulo}</strong> em desenvolvimento</p>
    </div>
  );
}

export default function PastaCrianca() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState("cadastro");

  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case "cadastro":
        return <ConteudoCadastro />;
      case "programas":
        return <ConteudoProgramas />;
      case "sessoes":
        return <SessoesCrianca criancaId={id ?? "1"} criancaNome="Lucas Mendes" />;
      default:
        return <PlaceholderAba titulo={abas.find((a) => a.id === abaAtiva)?.label || ""} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navegar("/criancas")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Lucas Mendes
          </h1>
          <p className="text-sm text-muted-foreground">
            5 anos • TEA Nível 1 • Pasta #{id}
          </p>
        </div>
        <Badge className="ml-auto bg-status-success/15 text-status-success border-status-success/30">
          Ativo
        </Badge>
      </div>

      {/* Tabs */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-1 min-w-max pb-px">
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap",
                abaAtiva === aba.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <aba.icone className="h-3.5 w-3.5" />
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in">{renderizarConteudo()}</div>
    </div>
  );
}
