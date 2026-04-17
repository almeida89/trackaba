import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProgramaCrianca } from "./dadosGraficos";

interface Props {
  programa: ProgramaCrianca;
}

export function GraficoAcertos({ programa }: Props) {
  const dados = programa.registros.slice(-14).map((r) => ({
    data: format(parseISO(r.data), "dd/MM", { locale: ptBR }),
    percentual: Math.round((r.tentativasCorretas / r.tentativasTotais) * 100),
  }));

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="data" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
            }}
            formatter={(v: number) => [`${v}%`, "Acertos"]}
          />
          <Bar dataKey="percentual" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
