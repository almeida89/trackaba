import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { NIVEIS_DESEMPENHO, NivelDesempenho, ProgramaCrianca } from "./dadosGraficos";

interface Props {
  programa: ProgramaCrianca;
}

export function GraficoDistribuicao({ programa }: Props) {
  const contagem = programa.registros.reduce<Record<string, number>>((acc, r) => {
    acc[r.nivel] = (acc[r.nivel] || 0) + 1;
    return acc;
  }, {});

  const dados = (Object.keys(NIVEIS_DESEMPENHO) as NivelDesempenho[])
    .filter((n) => contagem[n])
    .map((n) => ({
      nome: NIVEIS_DESEMPENHO[n].nome,
      valor: contagem[n],
      cor: NIVEIS_DESEMPENHO[n].cor,
    }));

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={dados} dataKey="valor" nameKey="nome" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2}>
            {dados.map((d, i) => (
              <Cell key={i} fill={d.cor} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
