import {
  Baby,
  ClipboardList,
  FileCheck,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartaoEstatistica } from "@/componentes/CartaoEstatistica";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const dadosProgresso = [
  { mes: "Jan", sessoes: 120, avaliacoes: 8 },
  { mes: "Fev", sessoes: 145, avaliacoes: 12 },
  { mes: "Mar", sessoes: 160, avaliacoes: 10 },
  { mes: "Abr", sessoes: 180, avaliacoes: 15 },
  { mes: "Mai", sessoes: 175, avaliacoes: 11 },
  { mes: "Jun", sessoes: 195, avaliacoes: 14 },
];

const dadosDesempenho = [
  { nome: "Independente", valor: 35 },
  { nome: "Ajuda Gestual", valor: 25 },
  { nome: "Ajuda Leve", valor: 20 },
  { nome: "Ajuda Total", valor: 12 },
  { nome: "Linha Base", valor: 8 },
];

const atividadesRecentes = [
  { texto: "Sessão registrada para Lucas M.", hora: "Há 15 min", tipo: "sessao" },
  { texto: "Avaliação concluída - Maria S.", hora: "Há 1h", tipo: "avaliacao" },
  { texto: "Novo programa criado: Comunicação Funcional", hora: "Há 2h", tipo: "programa" },
  { texto: "Relatório mensal gerado - Abril 2026", hora: "Há 3h", tipo: "relatorio" },
  { texto: "Agendamento confirmado - Pedro R.", hora: "Há 4h", tipo: "agenda" },
];

export default function PainelPrincipal() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Painel Principal
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral da clínica — Abril 2026
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CartaoEstatistica
          titulo="Crianças Ativas"
          valor={42}
          icone={Baby}
          descricao="+3 este mês"
          variante="primario"
        />
        <CartaoEstatistica
          titulo="Sessões Hoje"
          valor={18}
          icone={ClipboardList}
          descricao="6 concluídas"
          variante="sucesso"
        />
        <CartaoEstatistica
          titulo="Avaliações Pendentes"
          valor={7}
          icone={FileCheck}
          descricao="3 urgentes"
          variante="aviso"
        />
        <CartaoEstatistica
          titulo="Agendamentos Semana"
          valor={86}
          icone={Calendar}
          descricao="92% confirmados"
          variante="info"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Sessões e Avaliações
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dadosProgresso}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 20% 90%)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(200 10% 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(200 10% 45%)" />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid hsl(200 20% 90%)",
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey="sessoes"
                stroke="hsl(174 60% 40%)"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                name="Sessões"
              />
              <Line
                type="monotone"
                dataKey="avaliacoes"
                stroke="hsl(210 80% 55%)"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                name="Avaliações"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Desempenho por Nível de Ajuda
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={dadosDesempenho} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 20% 90%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(200 10% 45%)" />
              <YAxis
                dataKey="nome"
                type="category"
                width={100}
                tick={{ fontSize: 11 }}
                stroke="hsl(200 10% 45%)"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid hsl(200 20% 90%)",
                  fontSize: 13,
                }}
              />
              <Bar
                dataKey="valor"
                fill="hsl(174 60% 40%)"
                radius={[0, 6, 6, 0]}
                name="Quantidade"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Atividades Recentes
          </h3>
          <div className="space-y-3">
            {atividadesRecentes.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <span className="text-sm text-foreground">{item.texto}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {item.hora}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick access */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Acesso Rápido
          </h3>
          <div className="space-y-2">
            {[
              { icone: Baby, label: "Nova Criança", cor: "text-primary" },
              { icone: ClipboardList, label: "Registrar Sessão", cor: "text-status-success" },
              { icone: FileCheck, label: "Nova Avaliação", cor: "text-status-info" },
              { icone: Calendar, label: "Agendar", cor: "text-status-warning" },
            ].map((atalho, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 transition-colors text-left"
              >
                <atalho.icone className={`h-4 w-4 ${atalho.cor}`} />
                <span className="text-sm font-medium text-foreground">
                  {atalho.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
