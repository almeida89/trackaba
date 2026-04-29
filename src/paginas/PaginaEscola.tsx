import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Mail,
  Eye,
  CalendarClock,
  Copy,
  XCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CORES_STATUS_ACESSO,
  ROTULOS_STATUS_ACESSO,
} from "@/componentes/escola/dadosEscola";
import { AcessoEscola, StatusAcessoEscola } from "@/componentes/escola/tiposEscola";
import { DialogoConvidarEscola } from "@/componentes/escola/DialogoConvidarEscola";
import { VisaoEscolar } from "@/componentes/escola/VisaoEscolar";
import { supabase } from "@/integrations/supabase/client";
import { mapearLinhaParaAcesso } from "@/componentes/escola/mapearAcessoEscola";

const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const formatarRelativo = (iso?: string) => {
  if (!iso) return "—";
  const dias = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;
  return formatarData(iso);
};

export default function PaginaEscola() {
  const [acessos, setAcessos] = useState<AcessoEscola[]>(ACESSOS_ESCOLA_INICIAIS);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusAcessoEscola | "todos">("todos");
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [acessoSelecionadoId, setAcessoSelecionadoId] = useState<string | null>(null);

  const acessoSelecionado = useMemo(
    () => acessos.find((a) => a.id === acessoSelecionadoId) ?? null,
    [acessos, acessoSelecionadoId]
  );

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return acessos.filter((a) => {
      const matchBusca =
        !t ||
        a.criancaNome.toLowerCase().includes(t) ||
        a.escolaNome.toLowerCase().includes(t) ||
        a.responsavelNome.toLowerCase().includes(t) ||
        a.email.toLowerCase().includes(t);
      const matchStatus = filtroStatus === "todos" || a.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [acessos, busca, filtroStatus]);

  const contagem = useMemo(
    () => ({
      total: acessos.length,
      ativos: acessos.filter((a) => a.status === "ativo").length,
      pendentes: acessos.filter((a) => a.status === "pendente").length,
      expirados: acessos.filter((a) => a.status === "expirado").length,
    }),
    [acessos]
  );

  const criar = (novo: AcessoEscola) => {
    setAcessos((prev) => [novo, ...prev]);
    toast.success(`Convite enviado para ${novo.escolaNome}`);
  };

  const revogar = (id: string) => {
    setAcessos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "revogado" } : a))
    );
    toast.success("Acesso revogado");
  };

  const renovar = (id: string) => {
    setAcessos((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const novaExpira = new Date();
        novaExpira.setDate(novaExpira.getDate() + 90);
        return { ...a, status: "ativo", expiraEm: novaExpira.toISOString() };
      })
    );
    toast.success("Acesso renovado por mais 90 dias");
  };

  const copiarLink = (acesso: AcessoEscola) => {
    const link = `${window.location.origin}/escola/visao/${acesso.id}`;
    navigator.clipboard.writeText(link).catch(() => {});
    toast.success("Link de acesso copiado");
  };

  if (acessoSelecionado) {
    return (
      <VisaoEscolar
        acesso={acessoSelecionado}
        aoVoltar={() => setAcessoSelecionadoId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Escola</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Conceda à escola acesso restrito às terapias e evoluções de uma criança específica
            </p>
          </div>
        </div>
        <Button onClick={() => setDialogoAberto(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Convidar escola
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="text-2xl font-heading font-bold text-foreground mt-2">
            {contagem.total}
          </p>
          <p className="text-xs text-muted-foreground mt-1">acessos criados</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Ativos</p>
          <p className="text-2xl font-heading font-bold text-status-success mt-2">
            {contagem.ativos}
          </p>
          <p className="text-xs text-muted-foreground mt-1">escolas com acesso vigente</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pendentes</p>
          <p className="text-2xl font-heading font-bold text-status-warning mt-2">
            {contagem.pendentes}
          </p>
          <p className="text-xs text-muted-foreground mt-1">aguardando aceite</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Expirados</p>
          <p className="text-2xl font-heading font-bold text-muted-foreground mt-2">
            {contagem.expirados}
          </p>
          <p className="text-xs text-muted-foreground mt-1">precisam renovação</p>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por criança, escola, responsável ou e-mail..."
            className="pl-10"
          />
        </div>
        <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as any)}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="expirado">Expirados</SelectItem>
            <SelectItem value="revogado">Revogados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-foreground font-medium">Nenhum acesso encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            Convide uma escola para acompanhar a evolução de uma criança específica.
          </p>
          <Button onClick={() => setDialogoAberto(true)} className="gap-2 mt-4">
            <Plus className="h-4 w-4" /> Convidar escola
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtrados.map((a) => {
            const ativo = a.status === "ativo";
            const expirado = a.status === "expirado";
            return (
              <Card
                key={a.id}
                className="p-4 hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-secondary/40 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-semibold text-foreground truncate">
                        {a.escolaNome}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.responsavelNome} • {a.responsavelCargo}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={CORES_STATUS_ACESSO[a.status]}>
                    {ROTULOS_STATUS_ACESSO[a.status]}
                  </Badge>
                </div>

                <div className="rounded-lg bg-primary/5 border border-primary/15 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-primary/80">
                    Criança vinculada
                  </p>
                  <p className="text-sm font-medium text-foreground">{a.criancaNome}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{a.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5" />
                    <span>Expira {formatarData(a.expiraEm)}</span>
                  </div>
                  <div className="col-span-2">
                    Último acesso: {formatarRelativo(a.ultimoAcesso)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {a.permissoes.verSessoes && (
                    <Badge variant="secondary" className="text-[10px]">Sessões</Badge>
                  )}
                  {a.permissoes.verEvolucao && (
                    <Badge variant="secondary" className="text-[10px]">Evolução</Badge>
                  )}
                  {a.permissoes.verProgramas && (
                    <Badge variant="secondary" className="text-[10px]">Programas</Badge>
                  )}
                  {a.permissoes.verRelatorios && (
                    <Badge variant="secondary" className="text-[10px]">Relatórios</Badge>
                  )}
                  {a.permissoes.verIncidentes && (
                    <Badge variant="secondary" className="text-[10px]">Incidentes</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-1.5"
                    onClick={() => setAcessoSelecionadoId(a.id)}
                  >
                    <Eye className="h-3.5 w-3.5" /> Ver visão escolar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => copiarLink(a)}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copiar link
                  </Button>
                  {expirado && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => renovar(a.id)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Renovar
                    </Button>
                  )}
                  {ativo && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => revogar(a.id)}
                    >
                      <XCircle className="h-3.5 w-3.5" /> Revogar
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <DialogoConvidarEscola
        aberto={dialogoAberto}
        aoFechar={() => setDialogoAberto(false)}
        aoCriar={criar}
      />
    </div>
  );
}
