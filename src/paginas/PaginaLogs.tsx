import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CartaoEstatistica } from "@/componentes/CartaoEstatistica";
import { Activity, AlertTriangle, ShieldAlert, Search, Download, Eye, Filter } from "lucide-react";
import { logsIniciais, rotuloAcao, rotuloCategoria, corSeveridade } from "@/componentes/logs/dadosLogs";
import { RegistroLog } from "@/componentes/logs/tiposLogs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function PaginaLogs() {
  const [logs] = useState<RegistroLog[]>(logsIniciais);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroAcao, setFiltroAcao] = useState("todas");
  const [filtroSeveridade, setFiltroSeveridade] = useState("todas");
  const [filtroUsuario, setFiltroUsuario] = useState("todos");
  const [periodo, setPeriodo] = useState("24h");
  const [detalhe, setDetalhe] = useState<RegistroLog | null>(null);

  const usuariosUnicos = useMemo(() => Array.from(new Set(logs.map((l) => l.usuario))), [logs]);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    const limite = periodo === "todos" ? 0 : Number(periodo.replace("h", "")) * 3600 * 1000;
    const corte = limite ? Date.now() - limite : 0;
    return logs.filter((l) => {
      const dt = new Date(l.dataHora).getTime();
      const okPeriodo = !corte || dt >= corte;
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
  }, [logs, busca, filtroCategoria, filtroAcao, filtroSeveridade, filtroUsuario, periodo]);

  const stats = useMemo(() => ({
    total: logs.length,
    avisos: logs.filter((l) => l.severidade === "aviso").length,
    erros: logs.filter((l) => l.severidade === "erro" || l.severidade === "critico").length,
    usuariosAtivos: usuariosUnicos.filter((u) => u !== "sistema").length,
  }), [logs, usuariosUnicos]);

  const exportarCsv = () => {
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
    a.download = `logs-auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtrados.length} registros exportados`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Logs / Auditoria</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Histórico completo das ações realizadas no sistema, com filtros e exportação para conformidade.
          </p>
        </div>
        <Button onClick={exportarCsv} variant="outline">
          <Download className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CartaoEstatistica titulo="Eventos registrados" valor={stats.total} icone={Activity} />
        <CartaoEstatistica titulo="Avisos" valor={stats.avisos} icone={AlertTriangle} variante="aviso" />
        <CartaoEstatistica titulo="Erros / Críticos" valor={stats.erros} icone={ShieldAlert} variante="sucesso" />
        <CartaoEstatistica titulo="Usuários ativos" valor={stats.usuariosAtivos} icone={Eye} variante="info" />
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" /> Filtros
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário, recurso, IP..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
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
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="168h">Últimos 7 dias</SelectItem>
              <SelectItem value="720h">Últimos 30 dias</SelectItem>
              <SelectItem value="todos">Todo o histórico</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>Mostrando <strong>{filtrados.length}</strong> de <strong>{logs.length}</strong> registros</span>
          <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
            <SelectTrigger className="w-56 h-8 text-xs"><SelectValue placeholder="Usuário" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os usuários</SelectItem>
              {usuariosUnicos.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
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
                <TableCell className="font-mono text-xs text-muted-foreground">
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
                  Nenhum registro encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
