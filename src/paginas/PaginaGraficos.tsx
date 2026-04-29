import { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingUp, Target, Activity, Award, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NIVEIS_DESEMPENHO } from "@/componentes/graficos/dadosGraficos";
import { GraficoEvolucao } from "@/componentes/graficos/GraficoEvolucao";
import { GraficoAcertos } from "@/componentes/graficos/GraficoAcertos";
import { GraficoDistribuicao } from "@/componentes/graficos/GraficoDistribuicao";
import { useGraficosBanco } from "@/hooks/useGraficosBanco";

export default function PaginaGraficos() {
  const { criancas: CRIANCAS_GRAFICOS, carregando } = useGraficosBanco();
  const [criancaId, setCriancaId] = useState<string>("");
  const [programaId, setProgramaId] = useState<string>("");

  useEffect(() => {
    if (CRIANCAS_GRAFICOS.length && !criancaId) {
      setCriancaId(CRIANCAS_GRAFICOS[0].id);
      setProgramaId(CRIANCAS_GRAFICOS[0].programas[0]?.id ?? "");
    }
  }, [CRIANCAS_GRAFICOS, criancaId]);

  const crianca = useMemo(
    () => CRIANCAS_GRAFICOS.find((c) => c.id === criancaId),
    [CRIANCAS_GRAFICOS, criancaId],
  );

  const programa = useMemo(
    () => crianca?.programas.find((p) => p.id === programaId) ?? crianca?.programas[0],
    [crianca, programaId],
  );

  const handleCrianca = (id: string) => {
    setCriancaId(id);
    const c = CRIANCAS_GRAFICOS.find((x) => x.id === id);
    if (c?.programas[0]) setProgramaId(c.programas[0].id);
  };

  const metricas = useMemo(() => {
    if (!programa || programa.registros.length === 0) {
      return { total: 0, acertosMedio: 0, evolucao: 0, independencia: 0 };
    }
    const regs = programa.registros;
    const total = regs.length;
    const ultimo = regs[regs.length - 1];
    const primeiro = regs[0];
    const acertosMedio = Math.round(
      (regs.reduce((s, r) => s + r.tentativasCorretas / r.tentativasTotais, 0) / total) * 100,
    );
    const evolucao = NIVEIS_DESEMPENHO[ultimo.nivel].valor - NIVEIS_DESEMPENHO[primeiro.nivel].valor;
    const independencia = Math.round(
      (regs.filter((r) => r.nivel === "IND" || r.nivel === "+").length / total) * 100,
    );
    return { total, acertosMedio, evolucao, independencia };
  }, [programa]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!crianca || !programa) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <BarChart3 className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm">Nenhum programa com registros disponível para análise.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Gráficos & Análises</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe a evolução individual de cada criança em seus programas terapêuticos
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 py-1.5">
          <Activity className="h-3.5 w-3.5 text-primary" />
          Análise por programa individual
        </Badge>
      </div>

      {/* Seletores */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Criança
              </label>
              <Select value={criancaId} onValueChange={handleCrianca}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRIANCAS_GRAFICOS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome} • {c.idade} anos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Programa
              </label>
              <Select value={programaId} onValueChange={setProgramaId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {crianca.programas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} — {p.disciplina}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground">Objetivo do programa</p>
                <p className="text-sm text-foreground mt-0.5">{programa.objetivo}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{programa.disciplina}</Badge>
                <Badge variant="outline">{programa.tipo}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Sessões registradas</p>
                <p className="text-2xl font-heading font-bold text-foreground mt-1">{metricas.total}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Acertos médios</p>
                <p className="text-2xl font-heading font-bold text-foreground mt-1">{metricas.acertosMedio}%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-accent/15">
                <Target className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Evolução</p>
                <p className="text-2xl font-heading font-bold text-status-success mt-1">
                  +{metricas.evolucao} níveis
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-status-success/15">
                <TrendingUp className="h-5 w-5 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Independência</p>
                <p className="text-2xl font-heading font-bold text-foreground mt-1">{metricas.independencia}%</p>
              </div>
              <div className="p-2.5 rounded-lg bg-status-info/15">
                <Award className="h-5 w-5 text-status-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos em abas */}
      <Tabs defaultValue="evolucao" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="evolucao">Curva de Aprendizagem</TabsTrigger>
          <TabsTrigger value="acertos">Taxa de Acertos</TabsTrigger>
          <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="evolucao">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução por nível de desempenho</CardTitle>
              <p className="text-xs text-muted-foreground">
                Linha de tendência baseada na escala ABA: Linha Base → Independente
              </p>
            </CardHeader>
            <CardContent>
              <GraficoEvolucao programa={programa} />
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                {Object.entries(NIVEIS_DESEMPENHO).map(([sigla, info]) => (
                  <div key={sigla} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: info.cor }}
                    />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">{sigla}</strong> {info.nome}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acertos">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Percentual de acertos — últimas 14 sessões</CardTitle>
              <p className="text-xs text-muted-foreground">
                Tentativas corretas em relação ao total de tentativas por sessão
              </p>
            </CardHeader>
            <CardContent>
              <GraficoAcertos programa={programa} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribuicao">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição dos níveis registrados</CardTitle>
              <p className="text-xs text-muted-foreground">
                Frequência de cada nível ao longo de todas as sessões do programa
              </p>
            </CardHeader>
            <CardContent>
              <GraficoDistribuicao programa={programa} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Visão geral de todos os programas da criança */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todos os programas de {crianca.nome}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Visão consolidada — clique em um programa para ver sua análise individual
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {crianca.programas.map((p) => {
              const ult = p.registros[p.registros.length - 1];
              const ativo = p.id === programaId;
              return (
                <button
                  key={p.id}
                  onClick={() => setProgramaId(p.id)}
                  className={`text-left p-4 rounded-lg border transition-all hover:shadow-sm ${
                    ativo ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-foreground">{p.nome}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {ult.nivel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.disciplina}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {p.registros.length} sessões • Atual: <strong className="text-foreground">{NIVEIS_DESEMPENHO[ult.nivel].nome}</strong>
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
