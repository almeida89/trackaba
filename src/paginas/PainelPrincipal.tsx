import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Baby,
  ClipboardList,
  FileCheck,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { CartaoEstatistica } from "@/componentes/CartaoEstatistica";
import { useUserRole, rotuloPapel } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  useAtividadesRecentes,
  useDistribuicaoNiveis,
  useEstatisticasPainel,
  useSerieMensalPainel,
} from "@/hooks/usePainelDados";
import { DialogoNovaCrianca } from "@/componentes/criancas/DialogoNovaCrianca";
import { DialogoSelecionarCrianca } from "@/componentes/criancas/DialogoSelecionarCrianca";

type AcaoRapida = "crianca" | "sessao" | "avaliacao" | "agendamento";

const MES_ATUAL = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
}).format(new Date());

export default function PainelPrincipal() {
  const stats = useEstatisticasPainel();
  const serie = useSerieMensalPainel();
  const distribuicao = useDistribuicaoNiveis();
  const atividades = useAtividadesRecentes(8);

  const [acao, setAcao] = useState<AcaoRapida | null>(null);

  const e = stats.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Painel Principal</h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">
          Visão geral da clínica — {MES_ATUAL}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.isLoading || !e ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-xl" />
          ))
        ) : (
          <>
            <CartaoEstatistica
              titulo="Crianças Ativas"
              valor={e.criancas_ativas}
              icone={Baby}
              descricao={
                e.criancas_novas_mes > 0
                  ? `+${e.criancas_novas_mes} este mês`
                  : "Sem novas este mês"
              }
              variante="primario"
            />
            <CartaoEstatistica
              titulo="Sessões Hoje"
              valor={e.sessoes_hoje}
              icone={ClipboardList}
              descricao={`${e.sessoes_concluidas_hoje} concluídas`}
              variante="sucesso"
            />
            <CartaoEstatistica
              titulo="Avaliações Pendentes"
              valor={e.avaliacoes_pendentes}
              icone={FileCheck}
              descricao={
                e.avaliacoes_urgentes > 0
                  ? `${e.avaliacoes_urgentes} urgente${e.avaliacoes_urgentes > 1 ? "s" : ""}`
                  : "Nenhuma urgente"
              }
              variante="aviso"
            />
            <CartaoEstatistica
              titulo="Agendamentos Semana"
              valor={e.agendamentos_semana}
              icone={Calendar}
              descricao={
                e.agendamentos_semana > 0
                  ? `${Math.round(
                      (e.agendamentos_confirmados / e.agendamentos_semana) * 100
                    )}% confirmados`
                  : "Sem agendamentos"
              }
              variante="info"
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Sessões e Avaliações
          </h3>
          {serie.isLoading ? (
            <Skeleton className="h-[240px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={serie.data ?? []}>
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
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Programas por Nível de Desempenho
          </h3>
          {distribuicao.isLoading ? (
            <Skeleton className="h-[240px] w-full" />
          ) : (distribuicao.data ?? []).length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
              Nenhum programa ativo cadastrado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={distribuicao.data ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(200 20% 90%)" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(200 10% 45%)" allowDecimals={false} />
                <YAxis
                  dataKey="nome"
                  type="category"
                  width={110}
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
                  name="Programas"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Atividades Recentes
          </h3>
          {atividades.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (atividades.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Sem atividades registradas ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {(atividades.data ?? []).map((item) => (
                <div
                  key={item.id}
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
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Acesso Rápido</h3>
          <div className="space-y-2">
            {[
              { icone: Baby, label: "Nova Criança", cor: "text-primary", acao: "crianca" as const },
              { icone: ClipboardList, label: "Registrar Sessão", cor: "text-status-success", acao: "sessao" as const },
              { icone: FileCheck, label: "Nova Avaliação", cor: "text-status-info", acao: "avaliacao" as const },
              { icone: Calendar, label: "Agendar", cor: "text-status-warning", acao: "agendamento" as const },
            ].map((atalho) => (
              <button
                key={atalho.acao}
                onClick={() => setAcao(atalho.acao)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/60 transition-colors text-left"
              >
                <atalho.icone className={`h-4 w-4 ${atalho.cor}`} />
                <span className="text-sm font-medium text-foreground">{atalho.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <DialogoNovaCrianca aberto={acao === "crianca"} aoFechar={() => setAcao(null)} />
      {acao && acao !== "crianca" && (
        <DialogoSelecionarCrianca
          aberto
          acao={acao}
          aoFechar={() => setAcao(null)}
        />
      )}
    </div>
  );
}
