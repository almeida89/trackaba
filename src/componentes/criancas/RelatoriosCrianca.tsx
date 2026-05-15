import { useMemo, useState } from "react";
import {
  FileText,
  TrendingUp,
  ClipboardList,
  BookOpen,
  Layers,
  Download,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartaoEstatistica } from "@/componentes/CartaoEstatistica";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  HISTORICO_RELATORIOS,
  RelatorioGerado,
} from "@/componentes/relatorios/dadosRelatorios";
import {
  gerarRelatorioPDF,
  TipoRelatorio,
} from "@/componentes/relatorios/gerarRelatorioPdf";
import { toast } from "sonner";
import { CriancaDetalhe } from "@/hooks/useCrianca";

interface Props {
  crianca: CriancaDetalhe;
}

const tiposRelatorio: {
  id: TipoRelatorio;
  titulo: string;
  descricao: string;
  icone: typeof FileText;
  cor: string;
}[] = [
  {
    id: "evolucao",
    titulo: "Evolução Clínica",
    descricao:
      "Resumo da evolução diária registrada nas sessões do período selecionado.",
    icone: TrendingUp,
    cor: "bg-status-success/10 text-status-success",
  },
  {
    id: "sessoes",
    titulo: "Sessões Realizadas",
    descricao:
      "Listagem detalhada de sessões: data, terapia, profissional e status.",
    icone: ClipboardList,
    cor: "bg-status-info/10 text-status-info",
  },
  {
    id: "programas",
    titulo: "Programas",
    descricao:
      "Programas em acompanhamento, objetivos e status atual de cada um.",
    icone: BookOpen,
    cor: "bg-primary/10 text-primary",
  },
  {
    id: "consolidado",
    titulo: "Consolidado",
    descricao:
      "Relatório completo: sessões, evolução, programas e incidentes.",
    icone: Layers,
    cor: "bg-secondary/15 text-secondary",
  },
];

const rotuloTipo: Record<TipoRelatorio, string> = {
  evolucao: "Evolução",
  sessoes: "Sessões",
  programas: "Programas",
  consolidado: "Consolidado",
};

const corTipo: Record<TipoRelatorio, string> = {
  evolucao: "bg-status-success/15 text-status-success border-status-success/30",
  sessoes: "bg-status-info/15 text-status-info border-status-info/30",
  programas: "bg-primary/10 text-primary border-primary/30",
  consolidado: "bg-secondary/15 text-secondary border-secondary/30",
};

const hojeISO = () => new Date().toISOString().split("T")[0];
const trintaDiasAtras = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
};

export function RelatoriosCrianca({ crianca }: Props) {
  const [tipo, setTipo] = useState<TipoRelatorio>("evolucao");
  const [dataInicio, setDataInicio] = useState(trintaDiasAtras());
  const [dataFim, setDataFim] = useState(hojeISO());
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [historico, setHistorico] = useState<RelatorioGerado[]>(
    HISTORICO_RELATORIOS.filter((r) => r.criancaId === crianca.id)
  );
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const kpis = useMemo(() => {
    const porTipo = (t: TipoRelatorio) =>
      historico.filter((h) => h.tipo === t).length;
    return {
      total: historico.length,
      evolucao: porTipo("evolucao"),
      sessoes: porTipo("sessoes"),
      consolidado: porTipo("consolidado"),
    };
  }, [historico]);

  const historicoFiltrado = useMemo(() => {
    const t = busca.toLowerCase().trim();
    return historico
      .filter((h) => {
        const okBusca =
          !t || h.geradoPor.toLowerCase().includes(t);
        const okTipo = filtroTipo === "todos" || h.tipo === filtroTipo;
        return okBusca && okTipo;
      })
      .sort((a, b) => b.geradoEm.localeCompare(a.geradoEm));
  }, [historico, busca, filtroTipo]);

  const gerar = () => {
    if (dataInicio > dataFim) {
      toast.error("A data de início deve ser anterior à data de fim");
      return;
    }

    gerarRelatorioPDF({
      tipo,
      criancaId: crianca.id,
      criancaNome: crianca.nome,
      dataInicio,
      dataFim,
      responsavelClinica: responsavel,
      observacoes,
    });

    const novo: RelatorioGerado = {
      id: `r${Date.now()}`,
      tipo,
      criancaId: crianca.id,
      criancaNome: crianca.nome,
      periodo: `${new Date(dataInicio + "T00:00:00").toLocaleDateString(
        "pt-BR"
      )} a ${new Date(dataFim + "T00:00:00").toLocaleDateString("pt-BR")}`,
      geradoEm: hojeISO(),
      geradoPor: responsavel || "Equipe TrackABA",
    };
    setHistorico((prev) => [novo, ...prev]);
    toast.success("Relatório gerado e baixado em PDF");
  };

  const baixarNovamente = (r: RelatorioGerado) => {
    const [ini, fim] = r.periodo.split(" a ");
    const toIso = (br: string) => {
      const [d, m, y] = br.split("/");
      return `${y}-${m}-${d}`;
    };
    gerarRelatorioPDF({
      tipo: r.tipo,
      criancaId: r.criancaId,
      criancaNome: r.criancaNome,
      dataInicio: toIso(ini),
      dataFim: toIso(fim),
      responsavelClinica: r.geradoPor,
    });
    toast.success("Relatório baixado novamente");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">
            Relatórios Clínicos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gere relatórios em PDF e consulte o histórico de emissões de {crianca.nome}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            gerarRelatorioPDF({
              tipo: "consolidado",
              criancaId: crianca.id,
              criancaNome: crianca.nome,
              dataInicio: trintaDiasAtras(),
              dataFim: hojeISO(),
              responsavelClinica: responsavel,
            })
          }
          className="gap-2 print:hidden"
        >
          <Download className="h-4 w-4" />
          Baixar PDF consolidado
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CartaoEstatistica
          titulo="Total emitidos"
          valor={kpis.total}
          icone={FileText}
          variante="primario"
        />
        <CartaoEstatistica
          titulo="Evolução"
          valor={kpis.evolucao}
          icone={TrendingUp}
          variante="sucesso"
        />
        <CartaoEstatistica
          titulo="Sessões"
          valor={kpis.sessoes}
          icone={ClipboardList}
          variante="info"
        />
        <CartaoEstatistica
          titulo="Consolidados"
          valor={kpis.consolidado}
          icone={Layers}
          variante="aviso"
        />
      </div>

      <Tabs defaultValue="gerar">
        <TabsList>
          <TabsTrigger value="gerar">Gerar relatório</TabsTrigger>
          <TabsTrigger value="historico">
            Histórico ({historico.length})
          </TabsTrigger>
        </TabsList>

        {/* GERAR */}
        <TabsContent value="gerar" className="space-y-6 mt-4">
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3">
              Tipo de relatório
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {tiposRelatorio.map((t) => {
                const ativo = tipo === t.id;
                const Icone = t.icone;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTipo(t.id)}
                    className={`text-left rounded-xl border p-4 transition-all ${
                      ativo
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className={`p-2 rounded-lg ${t.cor}`}>
                        <Icone className="h-5 w-5" />
                      </div>
                      {ativo && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                    <h4 className="font-heading font-semibold text-foreground">
                      {t.titulo}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {t.descricao}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-heading font-semibold text-foreground">
              Parâmetros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Responsável clínico</Label>
                <Input
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Nome do profissional"
                />
              </div>
              <div className="space-y-2">
                <Label>Início do período</Label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fim do período</Label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Observações clínicas (opcional)</Label>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                  placeholder="Considerações finais, recomendações ou contexto adicional para o relatório."
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={gerar} className="gap-2">
                <Download className="h-4 w-4" />
                Gerar e baixar PDF
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* HISTÓRICO */}
        <TabsContent value="historico" className="space-y-4 mt-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por responsável..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="lg:w-56">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="evolucao">Evolução</SelectItem>
                <SelectItem value="sessoes">Sessões</SelectItem>
                <SelectItem value="programas">Programas</SelectItem>
                <SelectItem value="consolidado">Consolidado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {historicoFiltrado.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">
                Nenhum relatório encontrado
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Gere um novo relatório na aba anterior.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {historicoFiltrado.map((r) => (
                <div
                  key={r.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-heading font-semibold text-foreground">
                        {rotuloTipo[r.tipo]}
                      </h4>
                      <Badge variant="outline" className={corTipo[r.tipo]}>
                        {rotuloTipo[r.tipo]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Período {r.periodo} • Gerado por {r.geradoPor} em{" "}
                      {new Date(r.geradoEm + "T00:00:00").toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => baixarNovamente(r)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Baixar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
