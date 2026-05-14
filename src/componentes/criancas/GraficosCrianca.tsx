import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  criancaNome: string;
}

function gerarDadosEvolucao(dias: number) {
  const dados = [];
  for (let i = dias - 1; i >= 0; i--) {
    const data = subDays(new Date(), i);
    const progresso = (dias - 1 - i) / Math.max(dias - 1, 1);
    const base = 40 + progresso * 45;
    const ruido = (Math.random() - 0.5) * 20;
    const percentual = Math.max(10, Math.min(98, Math.round(base + ruido)));
    dados.push({
      data: format(data, "dd/MM", { locale: ptBR }),
      percentual,
    });
  }
  return dados;
}

const NIVEIS = [
  { nome: "Linha Base", sigla: "-", cor: "hsl(var(--muted-foreground))" },
  { nome: "Ajuda Física Total", sigla: "AFT", cor: "hsl(var(--destructive))" },
  { nome: "Ajuda Física Leve", sigla: "AFL", cor: "hsl(var(--status-warning))" },
  { nome: "Ajuda Gestual", sigla: "AG", cor: "hsl(var(--status-info))" },
  { nome: "Independente", sigla: "IND", cor: "hsl(var(--status-success))" },
  { nome: "Acima do Esperado", sigla: "+", cor: "hsl(var(--primary))" },
];

function gerarDadosNiveis() {
  return NIVEIS.map((n) => ({
    nome: n.sigla,
    valor: Math.floor(Math.random() * 25) + 2,
    cor: n.cor,
  })).filter((n) => n.valor > 0);
}

export function GraficosCrianca({ criancaNome }: Props) {
  const dadosEvolucao = useMemo(() => gerarDadosEvolucao(30), []);
  const dadosNiveis = useMemo(() => gerarDadosNiveis(), []);

  return (
    <div className="space-y-6">
      {/* Evolução das Sessões */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Evolução das Sessões</CardTitle>
          </div>
          <CardDescription>
            Percentual de acertos ao longo do tempo — {criancaNome}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosEvolucao} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="data"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  interval={4}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "0.8rem",
                  }}
                  formatter={(v: number) => [`${v}%`, "Acertos"]}
                />
                <Line
                  type="monotone"
                  dataKey="percentual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Níveis de Desempenho */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Níveis de Desempenho</CardTitle>
          </div>
          <CardDescription>
            Distribuição de registros por nível de desempenho ABA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosNiveis} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="nome" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    fontSize: "0.8rem",
                  }}
                  formatter={(v: number) => [v, "Registros"]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "0.75rem" }}
                  formatter={(value: string) => {
                    const item = NIVEIS.find((n) => n.sigla === value);
                    return item ? item.nome : value;
                  }}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {dadosNiveis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {NIVEIS.map((n) => (
              <div key={n.sigla} className="flex items-center gap-1.5 text-xs">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: n.cor }}
                />
                <span className="text-muted-foreground">
                  {n.sigla} — {n.nome}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
