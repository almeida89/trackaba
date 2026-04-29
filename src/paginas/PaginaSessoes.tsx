import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Plus, Search, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartaoSessao } from "@/componentes/sessoes/CartaoSessao";
import { DetalhesSessao } from "@/componentes/sessoes/DetalhesSessao";
import { DialogoNovaSessao } from "@/componentes/sessoes/DialogoNovaSessao";
import { Sessao } from "@/componentes/sessoes/tiposSessoes";
import { useSessoesBanco } from "@/hooks/useSessoesBanco";

export default function PaginaSessoes() {
  const { sessoes: sessoesBanco, carregando } = useSessoesBanco();
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [selecionadaId, setSelecionadaId] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [filtroCrianca, setFiltroCrianca] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [dialogoAberto, setDialogoAberto] = useState(false);

  useEffect(() => {
    setSessoes(sessoesBanco);
    if (sessoesBanco.length > 0 && !selecionadaId) {
      setSelecionadaId(sessoesBanco[0].id);
    }
  }, [sessoesBanco, selecionadaId]);

  const criancasDisponiveis = useMemo(() => {
    const map = new Map<string, string>();
    sessoesBanco.forEach((s) => map.set(s.criancaId, s.criancaNome));
    return Array.from(map, ([id, nome]) => ({ id, nome }));
  }, [sessoesBanco]);

  const sessoesFiltradas = useMemo(() => {
    return sessoes
      .filter((s) => filtroCrianca === "todas" || s.criancaId === filtroCrianca)
      .filter((s) => filtroStatus === "todos" || s.status === filtroStatus)
      .filter(
        (s) =>
          !busca.trim() ||
          s.criancaNome.toLowerCase().includes(busca.toLowerCase()) ||
          s.profissionalNome.toLowerCase().includes(busca.toLowerCase())
      )
      .sort((a, b) => (b.data + b.horaInicio).localeCompare(a.data + a.horaInicio));
  }, [sessoes, busca, filtroCrianca, filtroStatus]);

  const selecionada = sessoes.find((s) => s.id === selecionadaId) ?? sessoesFiltradas[0];

  const salvar = (atualizada: Sessao) => {
    setSessoes((prev) => prev.map((s) => (s.id === atualizada.id ? atualizada : s)));
    toast.success("Sessão atualizada");
  };

  const criar = (nova: Sessao) => {
    setSessoes((prev) => [nova, ...prev]);
    setSelecionadaId(nova.id);
    toast.success("Sessão criada");
  };

  const totais = useMemo(
    () => ({
      hoje: sessoes.filter((s) => s.data === new Date().toISOString().split("T")[0]).length,
      andamento: sessoes.filter((s) => s.status === "em_andamento").length,
      concluidas: sessoes.filter((s) => s.status === "concluida").length,
      incidentes: sessoes.filter((s) => s.notaIncidente).length,
    }),
    [sessoes]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Sessões</h1>
          <p className="text-sm text-muted-foreground">
            Registro clínico completo: notas, programas, ABC e reforçadores.
          </p>
        </div>
        <Button onClick={() => setDialogoAberto(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nova sessão
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Hoje</p>
          <p className="text-2xl font-bold text-foreground">{totais.hoje}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Em andamento</p>
          <p className="text-2xl font-bold text-primary">{totais.andamento}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Concluídas</p>
          <p className="text-2xl font-bold text-status-success">{totais.concluidas}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Com incidente</p>
          <p className="text-2xl font-bold text-destructive">{totais.incidentes}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por criança ou profissional..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select value={filtroCrianca} onValueChange={setFiltroCrianca}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas crianças</SelectItem>
                {CRIANCAS_DISPONIVEIS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos status</SelectItem>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="em_andamento">Em andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="falta">Falta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
            {sessoesFiltradas.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma sessão encontrada.</p>
              </Card>
            ) : (
              sessoesFiltradas.map((s) => (
                <CartaoSessao
                  key={s.id}
                  sessao={s}
                  selecionado={s.id === selecionada?.id}
                  aoSelecionar={() => setSelecionadaId(s.id)}
                />
              ))
            )}
          </div>
        </div>

        <div>
          {selecionada ? (
            <DetalhesSessao key={selecionada.id} sessao={selecionada} aoSalvar={salvar} />
          ) : (
            <Card className="p-12 text-center border-dashed">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Selecione uma sessão para ver os detalhes.</p>
            </Card>
          )}
        </div>
      </div>

      <DialogoNovaSessao
        aberto={dialogoAberto}
        aoFechar={() => setDialogoAberto(false)}
        aoCriar={criar}
      />
    </div>
  );
}
