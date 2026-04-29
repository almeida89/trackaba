import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CartaoEstatistica } from "@/componentes/CartaoEstatistica";
import { Activity, AlertTriangle, ShieldAlert, Search, Eye, Filter, FileText, FileSpreadsheet, ScrollText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/componentes/EmptyState";

interface RegistroLog {
  id: string;
  criado_em: string;
  user_id: string | null;
  user_email: string | null;
  acao: string;
  entidade: string;
  entidade_id: string | null;
  descricao: string;
  ip: string | null;
  user_agent: string | null;
}

const rotuloAcao: Record<string, string> = {
  login: "Login",
  logout: "Logout",
  criar: "Criar",
  editar: "Editar",
  excluir: "Excluir",
  exportar: "Exportar",
  visualizar: "Visualizar",
  falha_login: "Falha de login",
  alterar_papel: "Alterar papel",
  convidar_escola: "Convidar escola",
};

const acoesCriticas = new Set(["excluir", "alterar_papel", "falha_login"]);

export default function PaginaLogs() {
  const [logs, setLogs] = useState<RegistroLog[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroAcao, setFiltroAcao] = useState("todas");
  const [filtroUsuario, setFiltroUsuario] = useState("todos");
  const hoje = new Date().toISOString().slice(0, 10);
  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const [dataInicio, setDataInicio] = useState(trintaDiasAtras);
  const [dataFim, setDataFim] = useState(hoje);
  const [detalhe, setDetalhe] = useState<RegistroLog | null>(null);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from("logs_auditoria" as any) as any)
        .select("*")
        .order("criado_em", { ascending: false })
        .limit(500);
      if (!error && data) setLogs(data as RegistroLog[]);
      setCarregando(false);
    };
    carregar();
  }, []);

  const usuariosUnicos = useMemo(
    () => Array.from(new Set(logs.map((l) => l.user_email).filter(Boolean) as string[])),
    [logs],
  );

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    const inicio = dataInicio ? new Date(dataInicio + "T00:00:00").getTime() : 0;
    const fim = dataFim ? new Date(dataFim + "T23:59:59").getTime() : Number.MAX_SAFE_INTEGER;
    return logs.filter((l) => {
      const dt = new Date(l.criado_em).getTime();
      const okPeriodo = dt >= inicio && dt <= fim;
      const okBusca = !termo
        || l.descricao.toLowerCase().includes(termo)
        || l.entidade.toLowerCase().includes(termo)
        || (l.user_email?.toLowerCase().includes(termo) ?? false);
      const okAcao = filtroAcao === "todas" || l.acao === filtroAcao;
      const okUsr = filtroUsuario === "todos" || l.user_email === filtroUsuario;
      return okPeriodo && okBusca && okAcao && okUsr;
    });
  }, [logs, busca, filtroAcao, filtroUsuario, dataInicio, dataFim]);

  const stats = useMemo(() => ({
    total: filtrados.length,
    avisos: filtrados.filter((l) => acoesCriticas.has(l.acao)).length,
    logins: filtrados.filter((l) => l.acao === "login").length,
    usuariosAtivos: Array.from(new Set(filtrados.map((l) => l.user_email).filter(Boolean))).length,
  }), [filtrados]);

  const exportarCsv = () => {
    if (filtrados.length === 0) {
      toast.error("Nenhum registro no intervalo selecionado");
      return;
    }
    const headers = ["Data/hora", "Usuário", "Ação", "Entidade", "Descrição", "IP"];
    const linhas = filtrados.map((l) => [
      new Date(l.criado_em).toLocaleString("pt-BR"),
      l.user_email ?? "—",
      rotuloAcao[l.acao] ?? l.acao,
      l.entidade,
      l.descricao,
      l.ip ?? "—",
    ]);
    const csv = [headers, ...linhas]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-auditoria-${dataInicio}_a_${dataFim}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtrados.length} registros exportados em CSV`);
  };

  const exportarPdf = () => {
    if (filtrados.length === 0) {
      toast.error("Nenhum registro no intervalo selecionado");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Logs / Auditoria — TrackABA", 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Período: ${dataInicio} até ${dataFim}`, 40, 60);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 40, 75);
    autoTable(doc, {
      startY: 100,
      head: [["Data/hora", "Usuário", "Ação", "Entidade", "Descrição", "IP"]],
      body: filtrados.map((l) => [
        new Date(l.criado_em).toLocaleString("pt-BR"),
        l.user_email ?? "—",
        rotuloAcao[l.acao] ?? l.acao,
        l.entidade,
        l.descricao,
        l.ip ?? "—",
      ]),
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [13, 148, 136], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 40, right: 40 },
    });
    doc.save(`logs-auditoria-${dataInicio}_a_${dataFim}.pdf`);
    toast.success(`${filtrados.length} registros exportados em PDF`);
  };

  const aplicarPreset = (dias: number) => {
    setDataFim(hoje);
    setDataInicio(new Date(Date.now() - dias * 24 * 3600 * 1000).toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Logs / Auditoria</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trilha real de eventos do sistema. Cada login, criação, edição e exportação fica registrado aqui.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button onClick={exportarCsv} variant="outline" className="flex-1 sm:flex-none">
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Exportar CSV
          </Button>
          <Button onClick={exportarPdf} className="flex-1 sm:flex-none">
            <FileText className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CartaoEstatistica titulo="Eventos no período" valor={stats.total} icone={Activity} />
        <CartaoEstatistica titulo="Eventos críticos" valor={stats.avisos} icone={AlertTriangle} variante="aviso" />
        <CartaoEstatistica titulo="Logins" valor={stats.logins} icone={ShieldAlert} variante="info" />
        <CartaoEstatistica titulo="Usuários ativos" valor={stats.usuariosAtivos} icone={Eye} variante="sucesso" />
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" /> Intervalo e filtros
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => aplicarPreset(1)}>Hoje</Button>
            <Button size="sm" variant="ghost" onClick={() => aplicarPreset(7)}>7 dias</Button>
            <Button size="sm" variant="ghost" onClick={() => aplicarPreset(30)}>30 dias</Button>
            <Button size="sm" variant="ghost" onClick={() => aplicarPreset(90)}>90 dias</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Data inicial</Label>
            <Input type="date" value={dataInicio} max={dataFim} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Data final</Label>
            <Input type="date" value={dataFim} min={dataInicio} max={hoje} onChange={(e) => setDataFim(e.target.value)} />
          </div>
          <div className="space-y-1 lg:col-span-2">
            <Label className="text-xs">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Usuário, entidade, descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select value={filtroAcao} onValueChange={setFiltroAcao}>
            <SelectTrigger><SelectValue placeholder="Ação" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as ações</SelectItem>
              {Object.entries(rotuloAcao).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
            <SelectTrigger><SelectValue placeholder="Usuário" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os usuários</SelectItem>
              {usuariosUnicos.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        {carregando ? (
          <div className="p-12 text-center text-muted-foreground">Carregando registros...</div>
        ) : filtrados.length === 0 ? (
          <EmptyState
            icone={ScrollText}
            titulo="Nenhum registro no período"
            descricao="A trilha de auditoria começa a popular conforme você e sua equipe usam o sistema. Tente ampliar o intervalo de datas."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((l) => (
                <TableRow key={l.id} className={acoesCriticas.has(l.acao) ? "bg-destructive/5" : ""}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(l.criado_em).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm">{l.user_email ?? <span className="text-muted-foreground">sistema</span>}</TableCell>
                  <TableCell>
                    <Badge variant={acoesCriticas.has(l.acao) ? "destructive" : "secondary"}>
                      {rotuloAcao[l.acao] ?? l.acao}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono text-xs">{l.entidade}</TableCell>
                  <TableCell className="text-sm">{l.descricao}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => setDetalhe(l)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={!!detalhe} onOpenChange={(v) => !v && setDetalhe(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do evento</DialogTitle>
            <DialogDescription>Registro completo do log de auditoria</DialogDescription>
          </DialogHeader>
          {detalhe && (
            <div className="space-y-3 text-sm">
              <div><strong>Data:</strong> {new Date(detalhe.criado_em).toLocaleString("pt-BR")}</div>
              <div><strong>Usuário:</strong> {detalhe.user_email ?? "sistema"}</div>
              <div><strong>Ação:</strong> {rotuloAcao[detalhe.acao] ?? detalhe.acao}</div>
              <div><strong>Entidade:</strong> {detalhe.entidade}</div>
              <div><strong>Descrição:</strong> {detalhe.descricao}</div>
              <div><strong>IP:</strong> {detalhe.ip ?? "—"}</div>
              <div><strong>User-Agent:</strong> <span className="text-xs break-all">{detalhe.user_agent ?? "—"}</span></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
