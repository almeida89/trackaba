import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Baby, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useCriancas } from "@/hooks/useCriancas";

const coresStatus: Record<string, string> = {
  Ativo: "bg-status-success/15 text-status-success border-status-success/30",
  "Em Avaliação": "bg-status-warning/15 text-status-warning border-status-warning/30",
  Novo: "bg-status-info/15 text-status-info border-status-info/30",
};

const statusDisponiveis = ["Ativo", "Em Avaliação", "Novo"];

export default function ListaCriancas() {
  const navegar = useNavigate();
  const { criancas, carregando, criar } = useCriancas();
  const [busca, setBusca] = useState("");
  const [statusSelecionados, setStatusSelecionados] = useState<string[]>([]);
  const [profissionalFiltro, setProfissionalFiltro] = useState<string>("todos");

  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novaCrianca, setNovaCrianca] = useState({
    nome: "",
    data_nascimento: "",
    diagnostico: "",
    responsavel_principal: "",
  });

  const profissionaisDisponiveis = useMemo(() => {
    const set = new Set<string>();
    criancas.forEach((c) => c.profissional && c.profissional !== "—" && set.add(c.profissional));
    return Array.from(set);
  }, [criancas]);

  const criancasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return criancas.filter((c) => {
      const correspondeBusca =
        !termo ||
        c.nome.toLowerCase().includes(termo) ||
        c.diagnostico.toLowerCase().includes(termo) ||
        c.profissional.toLowerCase().includes(termo);
      const correspondeStatus =
        statusSelecionados.length === 0 || statusSelecionados.includes(c.status);
      const correspondeProf =
        profissionalFiltro === "todos" || c.profissional === profissionalFiltro;
      return correspondeBusca && correspondeStatus && correspondeProf;
    });
  }, [criancas, busca, statusSelecionados, profissionalFiltro]);

  const filtrosAtivos =
    statusSelecionados.length + (profissionalFiltro !== "todos" ? 1 : 0);

  const alternarStatus = (status: string) => {
    setStatusSelecionados((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const limparFiltros = () => {
    setStatusSelecionados([]);
    setProfissionalFiltro("todos");
    setBusca("");
  };

  const salvarNovaCrianca = async () => {
    if (!novaCrianca.nome.trim() || !novaCrianca.data_nascimento || !novaCrianca.diagnostico.trim()) {
      toast.error("Preencha nome, data de nascimento e diagnóstico.");
      return;
    }
    setSalvando(true);
    const ok = await criar({
      nome: novaCrianca.nome.trim(),
      data_nascimento: novaCrianca.data_nascimento,
      diagnostico: novaCrianca.diagnostico.trim(),
      responsavel_principal: novaCrianca.responsavel_principal.trim() || undefined,
    });
    setSalvando(false);
    if (ok) {
      setDialogoAberto(false);
      setNovaCrianca({ nome: "", data_nascimento: "", diagnostico: "", responsavel_principal: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Crianças</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {criancasFiltradas.length} de {criancas.length} crianças
          </p>
        </div>
        <Button
          onClick={() => setDialogoAberto(true)}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nova Criança
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, diagnóstico ou profissional..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {filtrosAtivos > 0 && (
                <Badge className="ml-1 h-5 px-1.5 bg-primary text-primary-foreground">
                  {filtrosAtivos}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-4" align="end">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Status</Label>
              <div className="mt-2 space-y-2">
                {statusDisponiveis.map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={statusSelecionados.includes(s)}
                      onCheckedChange={() => alternarStatus(s)}
                    />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            {profissionaisDisponiveis.length > 0 && (
              <div>
                <Label className="text-xs uppercase text-muted-foreground">
                  Profissional
                </Label>
                <Select value={profissionalFiltro} onValueChange={setProfissionalFiltro}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {profissionaisDisponiveis.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(filtrosAtivos > 0 || busca) && (
              <Button variant="ghost" size="sm" onClick={limparFiltros} className="w-full gap-2">
                <X className="h-3.5 w-3.5" /> Limpar filtros
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : criancasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Baby className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">
            {criancas.length === 0
              ? "Nenhuma criança cadastrada ainda."
              : "Nenhuma criança encontrada com esses filtros."}
          </p>
          {criancas.length > 0 && (
            <Button variant="link" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {criancasFiltradas.map((crianca) => (
            <button
              key={crianca.id}
              onClick={() => navegar(`/criancas/${crianca.id}`, { state: { crianca } })}
              className="rounded-xl border border-border bg-card p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Baby className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {crianca.nome}
                    </h3>
                    <Badge variant="outline" className={coresStatus[crianca.status] || ""}>
                      {crianca.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {crianca.idade} anos • {crianca.diagnostico}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{crianca.profissional}</span>
                    <span>Última sessão: {crianca.ultimaSessao}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Criança</DialogTitle>
            <DialogDescription>Cadastre uma nova criança no sistema.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={novaCrianca.nome}
                onChange={(e) => setNovaCrianca({ ...novaCrianca, nome: e.target.value })}
                placeholder="Ex: João da Silva"
              />
            </div>
            <div>
              <Label htmlFor="dn">Data de nascimento</Label>
              <Input
                id="dn"
                type="date"
                value={novaCrianca.data_nascimento}
                onChange={(e) =>
                  setNovaCrianca({ ...novaCrianca, data_nascimento: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="diagnostico">Diagnóstico</Label>
              <Input
                id="diagnostico"
                value={novaCrianca.diagnostico}
                onChange={(e) =>
                  setNovaCrianca({ ...novaCrianca, diagnostico: e.target.value })
                }
                placeholder="Ex: TEA Nível 1"
              />
            </div>
            <div>
              <Label htmlFor="resp">Responsável principal</Label>
              <Input
                id="resp"
                value={novaCrianca.responsavel_principal}
                onChange={(e) =>
                  setNovaCrianca({ ...novaCrianca, responsavel_principal: e.target.value })
                }
                placeholder="Ex: Maria da Silva"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAberto(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={salvarNovaCrianca} disabled={salvando}>
              {salvando && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
