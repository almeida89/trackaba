import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NIVEIS_DESEMPENHO, ProgramaCrianca } from "./dadosGraficos";

interface Props {
  programa: ProgramaCrianca;
}

export function GraficoEvolucao({ programa }: Props) {
  const dados = programa.registros.map((r) => ({
    data: format(parseISO(r.data), "dd/MM", { locale: ptBR }),
    nivel: NIVEIS_DESEMPENHO[r.nivel].valor,
    sigla: r.nivel,
  }));

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
            tickFormatter={(v) => {
              const niveis = ["-", "AFT", "AFL", "AG", "IND", "+"];
              return niveis[v] ?? "";
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
            }}
            formatter={(_value, _name, props) => {
              const sigla = props.payload.sigla as keyof typeof NIVEIS_DESEMPENHO;
              return [NIVEIS_DESEMPENHO[sigla].nome, "Nível"];
            }}
          />
          <ReferenceLine y={4} stroke="hsl(var(--status-success))" strokeDasharray="4 4" label={{ value: "Meta: IND", fill: "hsl(var(--status-success))", fontSize: 10, position: "right" }} />
          <Line
            type="monotone"
            dataKey="nivel"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "hsl(var(--primary))" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
