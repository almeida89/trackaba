import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CartaoEstatistica } from "@/componentes/CartaoEstatistica";
import { Activity, AlertTriangle, ShieldAlert, Search, Eye, Filter, FileText, FileSpreadsheet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type AcaoLog =
  | "login"
  | "logout"
  | "criar"
  | "editar"
  | "excluir"
  | "exportar"
  | "visualizar"
  | "falha_login"
  | "alterar_papel"
  | "configurar";

type CategoriaLog =
  | "autenticacao"
  | "criancas"
  | "sessoes"
  | "avaliacoes"
  | "programas"
  | "agenda"
  | "usuarios"
  | "relatorios"
  | "configuracoes"
  | "sistema";

type SeveridadeLog = "info" | "aviso" | "erro" | "critico";

interface RegistroLog {
  id: string;
  dataHora: string;
  usuario: string;
  cargoUsuario: string;
  acao: AcaoLog;
  categoria: CategoriaLog;
  recurso: string;
  descricao: string;
  ip: string;
  dispositivo: string;
  severidade: SeveridadeLog;
}

const rotuloAcao: Record<AcaoLog, string> = {
  login: "Login",
  logout: "Logout",
  criar: "Criar",
  editar: "Editar",
  excluir: "Excluir",
  exportar: "Exportar",
  visualizar: "Visualizar",
  falha_login: "Falha de login",
  alterar_papel: "Alterar papel",
  configurar: "Configurar",
};

const rotuloCategoria: Record<CategoriaLog, string> = {
  autenticacao: "Autenticação",
  criancas: "Crianças",
  sessoes: "Sessões",
  avaliacoes: "Avaliações",
  programas: "Programas",
  agenda: "Agenda",
  usuarios: "Usuários",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
  sistema: "Sistema",
};

const corSeveridade: Record<SeveridadeLog, string> = {
  info: "bg-status-info/15 text-status-info border-status-info/30",
  aviso: "bg-status-warning/15 text-status-warning border-status-warning/30",
  erro: "bg-destructive/15 text-destructive border-destructive/30",
  critico: "bg-destructive/25 text-destructive border-destructive/50 font-semibold",
};

const dataIso = (diasAtras: number, hora = "10:30") => {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return `${d.toISOString().slice(0, 10)}T${hora}:00`;
};

const logsIniciais: RegistroLog[] = [
  { id: "log-001", dataHora: dataIso(0, "09:12"), usuario: "ana.carolina@trackaba.com.br", cargoUsuario: "Administrador", acao: "login", categoria: "autenticacao", recurso: "/auth", descricao: "Login bem-sucedido", ip: "189.45.12.88", dispositivo: "Chrome / macOS", severidade: "info" },
  { id: "log-002", dataHora: dataIso(0, "09:18"), usuario: "ana.carolina@trackaba.com.br", cargoUsuario: "Administrador", acao: "criar", categoria: "criancas", recurso: "criancas/novo", descricao: "Nova criança cadastrada: Sofia Almeida", ip: "189.45.12.88", dispositivo: "Chrome / macOS", severidade: "info" },
  { id: "log-003", dataHora: dataIso(0, "10:02"), usuario: "carlos.lima@trackaba.com.br", cargoUsuario: "Psicólogo", acao: "criar", categoria: "sessoes", recurso: "sessoes/s-441", descricao: "Sessão registrada para Lucas Mendes", ip: "201.18.44.10", dispositivo: "Safari / iPad", severidade: "info" },
  { id: "log-004", dataHora: dataIso(1, "14:55"), usuario: "recepcao@trackaba.com.br", cargoUsuario: "Recepcionista", acao: "editar", categoria: "agenda", recurso: "agenda/ag-220", descricao: "Agendamento remarcado: Pedro Rocha", ip: "189.45.12.88", dispositivo: "Edge / Windows", severidade: "info" },
  { id: "log-005", dataHora: dataIso(1, "16:30"), usuario: "desconhecido", cargoUsuario: "—", acao: "falha_login", categoria: "autenticacao", recurso: "/auth", descricao: "Falha de login: credenciais inválidas (3ª tentativa)", ip: "45.230.91.7", dispositivo: "Firefox / Linux", severidade: "aviso" },
  { id: "log-006", dataHora: dataIso(2, "08:45"), usuario: "ana.carolina@trackaba.com.br", cargoUsuario: "Administrador", acao: "alterar_papel", categoria: "usuarios", recurso: "user_roles/u-12", descricao: "Papel alterado de 'familia' para 'psicologo'", ip: "189.45.12.88", dispositivo: "Chrome / macOS", severidade: "aviso" },
  { id: "log-007", dataHora: dataIso(2, "11:20"), usuario: "fernanda.costa@trackaba.com.br", cargoUsuario: "Coordenador", acao: "exportar", categoria: "relatorios", recurso: "relatorios/consolidado", descricao: "Relatório consolidado exportado em PDF", ip: "187.66.10.5", dispositivo: "Chrome / Windows", severidade: "info" },
  { id: "log-008", dataHora: dataIso(3, "13:15"), usuario: "carlos.lima@trackaba.com.br", cargoUsuario: "Psicólogo", acao: "criar", categoria: "avaliacoes", recurso: "avaliacoes/av-77", descricao: "Avaliação VB-MAPP iniciada", ip: "201.18.44.10", dispositivo: "Safari / iPad", severidade: "info" },
  { id: "log-009", dataHora: dataIso(3, "17:50"), usuario: "sistema", cargoUsuario: "Sistema", acao: "configurar", categoria: "sistema", recurso: "backup/diario", descricao: "Backup diário concluído com sucesso", ip: "127.0.0.1", dispositivo: "Servidor", severidade: "info" },
  { id: "log-010", dataHora: dataIso(4, "09:00"), usuario: "ana.carolina@trackaba.com.br", cargoUsuario: "Administrador", acao: "configurar", categoria: "configuracoes", recurso: "seguranca/2fa", descricao: "Autenticação de dois fatores ativada", ip: "189.45.12.88", dispositivo: "Chrome / macOS", severidade: "info" },
  { id: "log-011", dataHora: dataIso(5, "22:14"), usuario: "desconhecido", cargoUsuario: "—", acao: "falha_login", categoria: "autenticacao", recurso: "/auth", descricao: "Tentativa suspeita de acesso (IP estrangeiro)", ip: "103.45.221.9", dispositivo: "Bot / desconhecido", severidade: "critico" },
  { id: "log-012", dataHora: dataIso(6, "10:40"), usuario: "fernanda.costa@trackaba.com.br", cargoUsuario: "Coordenador", acao: "editar", categoria: "programas", recurso: "programas/p-19", descricao: "Programa 'Comunicação Funcional' atualizado", ip: "187.66.10.5", dispositivo: "Chrome / Windows", severidade: "info" },
  { id: "log-013", dataHora: dataIso(7, "15:25"), usuario: "ana.carolina@trackaba.com.br", cargoUsuario: "Administrador", acao: "excluir", categoria: "criancas", recurso: "criancas/c-08", descricao: "Pasta arquivada: paciente inativo há 12 meses", ip: "189.45.12.88", dispositivo: "Chrome / macOS", severidade: "aviso" },
  { id: "log-014", dataHora: dataIso(8, "11:00"), usuario: "carlos.lima@trackaba.com.br", cargoUsuario: "Psicólogo", acao: "visualizar", categoria: "criancas", recurso: "criancas/c-01", descricao: "Pasta clínica acessada: Lucas Mendes", ip: "201.18.44.10", dispositivo: "Safari / iPad", severidade: "info" },
  { id: "log-015", dataHora: dataIso(10, "08:30"), usuario: "sistema", cargoUsuario: "Sistema", acao: "configurar", categoria: "sistema", recurso: "manutencao/db", descricao: "Manutenção preventiva no banco de dados", ip: "127.0.0.1", dispositivo: "Servidor", severidade: "info" },
];

export default function PaginaLogs() {
  const [logs] = useState<RegistroLog[]>(logsIniciais);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroAcao, setFiltroAcao] = useState("todas");
  const [filtroSeveridade, setFiltroSeveridade] = useState("todas");
  const [filtroUsuario, setFiltroUsuario] = useState("todos");
  const hoje = new Date().toISOString().slice(0, 10);
  const seteDiasAtras = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const [dataInicio, setDataInicio] = useState(seteDiasAtras);
  const [dataFim, setDataFim] = useState(hoje);
  const [detalhe, setDetalhe] = useState<RegistroLog | null>(null);

  const usuariosUnicos = useMemo(() => Array.from(new Set(logs.map((l) => l.usuario))), [logs]);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    const inicio = dataInicio ? new Date(dataInicio + "T00:00:00").getTime() : 0;
    const fim = dataFim ? new Date(dataFim + "T23:59:59").getTime() : Number.MAX_SAFE_INTEGER;
    return logs.filter((l) => {
      const dt = new Date(l.dataHora).getTime();
      const okPeriodo = dt >= inicio && dt <= fim;
      const okBusca = !termo
        || l.descricao.toLowerCase().includes(termo)
        || l.recurso.toLowerCase().includes(termo)
        || l.usuario.toLowerCase().includes(termo)
        || l.ip.includes(termo);
      const okCat = filtroCategoria === "todas" || l.categoria === filtroCategoria;
      const okAcao = filtroAcao === "todas" || l.acao === filtroAcao;
      const okSev = filtroSeveridade === "todas" || l.severidade === filtroSeveridade;
      const okUsr = filtroUsuario === "todos" || l.usuario === filtroUsuario;
      return okPeriodo && okBusca && okCat && okAcao && okSev && okUsr;
    });
  }, [logs, busca, filtroCategoria, filtroAcao, filtroSeveridade, filtroUsuario, dataInicio, dataFim]);

  const stats = useMemo(() => ({
    total: filtrados.length,
    avisos: filtrados.filter((l) => l.severidade === "aviso").length,
    erros: filtrados.filter((l) => l.severidade === "erro" || l.severidade === "critico").length,
    usuariosAtivos: Array.from(new Set(filtrados.map((l) => l.usuario))).filter((u) => u !== "sistema").length,
  }), [filtrados]);

  const formatarBR = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");

  const exportarCsv = () => {
    if (filtrados.length === 0) {
      toast.error("Nenhum registro no intervalo selecionado");
      return;
    }
    const headers = ["Data/hora", "Usuário", "Cargo", "Ação", "Categoria", "Recurso", "Descrição", "IP", "Dispositivo", "Severidade"];
    const linhas = filtrados.map((l) => [
      new Date(l.dataHora).toLocaleString("pt-BR"),
      l.usuario,
      l.cargoUsuario,
      rotuloAcao[l.acao],
      rotuloCategoria[l.categoria],
      l.recurso,
      l.descricao,
      l.ip,
      l.dispositivo,
      l.severidade,
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
    const larguraPagina = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Relatório de Logs / Auditoria", 40, 40);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(
      `Período: ${formatarBR(dataInicio)} até ${formatarBR(dataFim)}`,
      40,
      60
    );
    doc.text(
      `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      40,
      75
    );

    doc.setTextColor(0);
    doc.setFontSize(10);
    const resumo = `Total: ${stats.total}  •  Avisos: ${stats.avisos}  •  Erros/Críticos: ${stats.erros}  •  Usuários ativos: ${stats.usuariosAtivos}`;
    doc.text(resumo, 40, 95);

    autoTable(doc, {
      startY: 110,
      head: [["Data/hora", "Usuário", "Cargo", "Ação", "Categoria", "Descrição", "IP", "Severidade"]],
      body: filtrados.map((l) => [
        new Date(l.dataHora).toLocaleString("pt-BR"),
        l.usuario,
        l.cargoUsuario,
        rotuloAcao[l.acao],
        rotuloCategoria[l.categoria],
        l.descricao,
        l.ip,
        l.severidade.toUpperCase(),
      ]),
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 130 },
        2: { cellWidth: 70 },
        3: { cellWidth: 60 },
        4: { cellWidth: 70 },
        5: { cellWidth: 220 },
        6: { cellWidth: 75 },
        7: { cellWidth: 60 },
      },
      didDrawPage: (data) => {
        const pagina = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(
          `Página ${data.pageNumber} de ${pagina}  •  Documento confidencial — uso interno`,
          40,
          doc.internal.pageSize.getHeight() - 20
        );
      },
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
            Histórico completo das ações no sistema. Selecione o intervalo de datas e exporte em CSV ou PDF.
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
        <CartaoEstatistica titulo="Avisos" valor={stats.avisos} icone={AlertTriangle} variante="aviso" />
        <CartaoEstatistica titulo="Erros / Críticos" valor={stats.erros} icone={ShieldAlert} variante="sucesso" />
        <CartaoEstatistica titulo="Usuários ativos" valor={stats.usuariosAtivos} icone={Eye} variante="info" />
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" /> Intervalo de datas e filtros
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
                placeholder="Usuário, recurso, descrição, IP..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {Object.entries(rotuloCategoria).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroAcao} onValueChange={setFiltroAcao}>
            <SelectTrigger><SelectValue placeholder="Ação" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as ações</SelectItem>
              {Object.entries(rotuloAcao).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroSeveridade} onValueChange={setFiltroSeveridade}>
            <SelectTrigger><SelectValue placeholder="Severidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas severidades</SelectItem>
              <SelectItem value="info">Informativo</SelectItem>
              <SelectItem value="aviso">Aviso</SelectItem>
              <SelectItem value="erro">Erro</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
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

        <div className="text-xs text-muted-foreground pt-1">
          Mostrando <strong>{filtrados.length}</strong> de <strong>{logs.length}</strong> registros — período{" "}
          <strong>{formatarBR(dataInicio)}</strong> até <strong>{formatarBR(dataFim)}</strong>.
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Data/hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-32">Severidade</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((l) => (
              <TableRow key={l.id} className="cursor-pointer" onClick={() => setDetalhe(l)}>
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(l.dataHora).toLocaleString("pt-BR")}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-foreground">{l.usuario}</div>
                  <div className="text-xs text-muted-foreground">{l.cargoUsuario}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{rotuloAcao[l.acao]}</Badge>
                </TableCell>
                <TableCell className="text-sm">{rotuloCategoria[l.categoria]}</TableCell>
                <TableCell className="text-sm max-w-md truncate">{l.descricao}</TableCell>
                <TableCell>
                  <Badge className={corSeveridade[l.severidade]} variant="outline">
                    {l.severidade}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-12">
                  Nenhum registro encontrado no intervalo selecionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </Card>

      <Dialog open={!!detalhe} onOpenChange={(o) => !o && setDetalhe(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do evento</DialogTitle>
            <DialogDescription>Informações completas do registro de auditoria.</DialogDescription>
          </DialogHeader>
          {detalhe && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Data/hora</Label><p className="font-mono">{new Date(detalhe.dataHora).toLocaleString("pt-BR")}</p></div>
                <div><Label className="text-xs text-muted-foreground">ID do evento</Label><p className="font-mono">{detalhe.id}</p></div>
                <div><Label className="text-xs text-muted-foreground">Usuário</Label><p>{detalhe.usuario}</p></div>
                <div><Label className="text-xs text-muted-foreground">Cargo</Label><p>{detalhe.cargoUsuario}</p></div>
                <div><Label className="text-xs text-muted-foreground">Ação</Label><p>{rotuloAcao[detalhe.acao]}</p></div>
                <div><Label className="text-xs text-muted-foreground">Categoria</Label><p>{rotuloCategoria[detalhe.categoria]}</p></div>
                <div><Label className="text-xs text-muted-foreground">IP</Label><p className="font-mono">{detalhe.ip}</p></div>
                <div><Label className="text-xs text-muted-foreground">Dispositivo</Label><p>{detalhe.dispositivo}</p></div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Recurso</Label>
                <p className="font-medium">{detalhe.recurso}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <p className="text-muted-foreground">{detalhe.descricao}</p>
              </div>
              <Badge className={corSeveridade[detalhe.severidade]} variant="outline">
                Severidade: {detalhe.severidade}
              </Badge>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
