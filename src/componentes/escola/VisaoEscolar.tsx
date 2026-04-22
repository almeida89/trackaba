import { useMemo } from "react";
import {
  ArrowLeft,
  Baby,
  CalendarCheck2,
  ClipboardList,
  FileBarChart,
  GraduationCap,
  Lock,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SESSOES_INICIAIS } from "@/componentes/sessoes/dadosSessoes";
import {
  BIBLIOTECA_PROGRAMAS,
  PROGRAMAS_CRIANCA_INICIAIS,
  CORES_DISCIPLINA,
} from "@/componentes/programas/dadosProgramas";
import { AcessoEscola } from "./tiposEscola";
import { CORES_STATUS_ACESSO, ROTULOS_STATUS_ACESSO } from "./dadosEscola";

interface Props {
  acesso: AcessoEscola;
  aoVoltar: () => void;
}

const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const tiposLabel: Record<string, string> = {
  ABA: "ABA",
  Fono: "Fonoaudiologia",
  TO: "Terapia Ocupacional",
  Psico: "Psicologia",
  Psicopedagogia: "Psicopedagogia",
};

export function VisaoEscolar({ acesso, aoVoltar }: Props) {
  const sessoesCrianca = useMemo(
    () =>
      SESSOES_INICIAIS.filter((s) => s.criancaId === acesso.criancaId).sort((a, b) =>
        (b.data + b.horaInicio).localeCompare(a.data + a.horaInicio)
      ),
    [acesso.criancaId]
  );

  const programasCrianca = useMemo(() => {
    const dela = PROGRAMAS_CRIANCA_INICIAIS.filter((p) => p.criancaId === acesso.criancaId);
    if (dela.length > 0) return dela;
    // fallback: mostrar 2 modelos comuns para crianças sem programas atribuídos
    return BIBLIOTECA_PROGRAMAS.slice(0, 2);
  }, [acesso.criancaId]);

  const concluidas = sessoesCrianca.filter((s) => s.status === "concluida");
  const evolucoes = concluidas.filter((s) => s.evolucaoDiaria);
  const incidentes = concluidas.filter((s) => s.notaIncidente);

  const tiposUsados = Array.from(new Set(sessoesCrianca.map((s) => s.tipo)));

  const podeVerSessoes = acesso.permissoes.verSessoes;
  const podeVerEvolucao = acesso.permissoes.verEvolucao;
  const podeVerProgramas = acesso.permissoes.verProgramas;
  const podeVerRelatorios = acesso.permissoes.verRelatorios;
  const podeVerIncidentes = acesso.permissoes.verIncidentes;

  return (
    <div className="space-y-5">
      {/* Cabeçalho do acesso */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={aoVoltar} className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Visão escolar — {acesso.criancaNome}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {acesso.escolaNome} • {acesso.responsavelNome} ({acesso.responsavelCargo})
            </p>
          </div>
        </div>
        <Badge variant="outline" className={CORES_STATUS_ACESSO[acesso.status]}>
          Acesso {ROTULOS_STATUS_ACESSO[acesso.status]}
        </Badge>
      </div>

      {/* Banner de escopo */}
      <Card className="p-4 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">
              Esta visão é restrita à criança {acesso.criancaNome}
            </p>
            <p className="text-muted-foreground mt-0.5">
              Validade até {formatarData(acesso.expiraEm)} • Permissões definidas pela clínica.
            </p>
          </div>
        </div>
      </Card>

      {/* Resumo rápido */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Sessões</p>
            <CalendarCheck2 className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground mt-2">
            {sessoesCrianca.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{concluidas.length} concluídas</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Terapias</p>
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground mt-2">
            {tiposUsados.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {tiposUsados.map((t) => tiposLabel[t] || t).join(", ") || "—"}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Programas</p>
            <ClipboardList className="h-4 w-4 text-status-info" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground mt-2">
            {programasCrianca.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">em acompanhamento</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Evoluções</p>
            <TrendingUp className="h-4 w-4 text-status-success" />
          </div>
          <p className="text-2xl font-heading font-bold text-foreground mt-2">
            {evolucoes.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">registros diários</p>
        </Card>
      </div>

      {/* Conteúdo */}
      <Tabs defaultValue="sessoes" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="sessoes" disabled={!podeVerSessoes}>
            Sessões & Terapias
          </TabsTrigger>
          <TabsTrigger value="evolucao" disabled={!podeVerEvolucao}>
            Evolução diária
          </TabsTrigger>
          <TabsTrigger value="programas" disabled={!podeVerProgramas}>
            Programas
          </TabsTrigger>
          <TabsTrigger value="relatorios" disabled={!podeVerRelatorios}>
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessoes" className="mt-4 space-y-3">
          {!podeVerSessoes ? (
            <BloqueioPermissao texto="Visualização de sessões não autorizada para este acesso." />
          ) : sessoesCrianca.length === 0 ? (
            <VazioCard icone={CalendarCheck2} titulo="Sem sessões registradas" />
          ) : (
            sessoesCrianca.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CalendarCheck2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {tiposLabel[s.tipo] || s.tipo} • {formatarData(s.data)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.horaInicio} - {s.horaFim} • {s.profissionalNome}
                        {s.sala ? ` • ${s.sala}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {s.status.replace("_", " ")}
                  </Badge>
                </div>
                {s.notaGeral && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {s.notaGeral}
                  </p>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="evolucao" className="mt-4 space-y-3">
          {!podeVerEvolucao ? (
            <BloqueioPermissao texto="Visualização de evolução não autorizada." />
          ) : (
            <>
              {evolucoes.length === 0 ? (
                <VazioCard icone={TrendingUp} titulo="Nenhuma evolução registrada ainda" />
              ) : (
                evolucoes.map((s) => (
                  <Card key={s.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {formatarData(s.data)} • {tiposLabel[s.tipo] || s.tipo}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {s.profissionalNome}
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <p className="text-sm text-foreground leading-relaxed">{s.evolucaoDiaria}</p>
                  </Card>
                ))
              )}

              {podeVerIncidentes && incidentes.length > 0 && (
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-status-warning" />
                    <h4 className="font-heading font-semibold text-sm text-foreground">
                      Incidentes registrados
                    </h4>
                  </div>
                  {incidentes.map((s) => (
                    <Card
                      key={`inc-${s.id}`}
                      className="p-4 border-status-warning/30 bg-status-warning/5"
                    >
                      <p className="text-xs text-muted-foreground">
                        {formatarData(s.data)} • {s.profissionalNome}
                      </p>
                      <p className="text-sm text-foreground mt-1">{s.notaIncidente}</p>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="programas" className="mt-4 space-y-3">
          {!podeVerProgramas ? (
            <BloqueioPermissao texto="Visualização de programas não autorizada." />
          ) : programasCrianca.length === 0 ? (
            <VazioCard icone={ClipboardList} titulo="Nenhum programa atribuído" />
          ) : (
            programasCrianca.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="font-heading font-semibold text-foreground">{p.nome}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{p.objetivoGeral}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={CORES_DISCIPLINA[p.disciplina] || ""}
                  >
                    {p.disciplina}
                  </Badge>
                </div>
                {p.objetivos.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      Objetivos atuais
                    </p>
                    <ul className="space-y-1.5">
                      {p.objetivos.map((o) => (
                        <li
                          key={o.id}
                          className="text-sm text-foreground flex items-start gap-2"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>
                            {o.descricao}
                            <span className="text-muted-foreground"> — {o.criterio}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="relatorios" className="mt-4">
          {!podeVerRelatorios ? (
            <BloqueioPermissao texto="Acesso a relatórios consolidados não autorizado." />
          ) : (
            <Card className="p-8 text-center">
              <FileBarChart className="h-10 w-10 mx-auto text-primary mb-3" />
              <h4 className="font-heading font-semibold text-foreground">
                Relatório mensal disponível
              </h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                A clínica disponibilizará o relatório consolidado de {acesso.criancaNome} no
                início de cada mês. Em breve aqui você poderá baixar o PDF.
              </p>
              <Button className="mt-4 gap-2" disabled>
                <FileBarChart className="h-4 w-4" /> Aguardando publicação
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BloqueioPermissao({ texto }: { texto: string }) {
  return (
    <Card className="p-8 text-center border-dashed">
      <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">{texto}</p>
    </Card>
  );
}

function VazioCard({
  icone: Icone,
  titulo,
}: {
  icone: typeof Baby | typeof GraduationCap | any;
  titulo: string;
}) {
  return (
    <Card className="p-8 text-center border-dashed">
      <Icone className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">{titulo}</p>
    </Card>
  );
}
