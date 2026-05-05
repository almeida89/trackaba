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
  const { papel, perfil } = useUserRole();
  const navigate = useNavigate();

  const [acao, setAcao] = useState<AcaoRapida | null>(null);

  const e = stats.data;
  const primeiroNome = (perfil?.nome_completo ?? "").split(" ")[0];
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {saudacao}{primeiroNome ? `, ${primeiroNome}` : ""} 👋
            </h1>
            {papel && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium px-2 py-0.5 uppercase tracking-wide">
                {rotuloPapel[papel]}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1 capitalize">
            Visão geral da clínica — {MES_ATUAL}
          </p>
        </div>
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-foreground">
                Atividades Recentes
              </h3>
              <p className="text-xs text-muted-foreground">Últimas ações registradas no sistema</p>
            </div>
            <button
              onClick={() => navigate("/logs")}
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Ver tudo <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {atividades.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (atividades.data ?? []).length === 0 ? (
            <div className="py-10 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Sem atividades registradas ainda.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {(atividades.data ?? []).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-2.5 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="text-sm text-foreground truncate">{item.texto}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                    {item.hora}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading font-semibold text-foreground">Acesso Rápido</h3>
          <p className="text-xs text-muted-foreground mb-4">Ações frequentes em um clique</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icone: Baby, label: "Nova Criança", cor: "primary", acao: "crianca" as const },
              { icone: ClipboardList, label: "Sessão", cor: "success", acao: "sessao" as const },
              { icone: FileCheck, label: "Avaliação", cor: "info", acao: "avaliacao" as const },
              { icone: Calendar, label: "Agendar", cor: "warning", acao: "agendamento" as const },
            ].map((atalho) => {
              const corMap: Record<string, string> = {
                primary: "bg-primary/10 text-primary",
                success: "bg-status-success/10 text-status-success",
                info: "bg-status-info/10 text-status-info",
                warning: "bg-status-warning/10 text-status-warning",
              };
              return (
                <button
                  key={atalho.acao}
                  onClick={() => setAcao(atalho.acao)}
                  className="group flex flex-col items-start gap-2 p-3 rounded-lg border border-border bg-background hover:border-primary/40 hover:shadow-sm transition-all text-left"
                >
                  <span className={`p-2 rounded-md ${corMap[atalho.cor]}`}>
                    <atalho.icone className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-medium text-foreground leading-tight">
                    {atalho.label}
                  </span>
                </button>
              );
            })}
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
