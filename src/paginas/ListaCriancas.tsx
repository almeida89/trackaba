import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Baby, X } from "lucide-react";
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

type Crianca = {
  id: string;
  nome: string;
  idade: number;
  diagnostico: string;
  status: string;
  profissional: string;
  ultimaSessao: string;
};

const criancasIniciais: Crianca[] = [
  { id: "1", nome: "Lucas Mendes", idade: 5, diagnostico: "TEA Nível 1", status: "Ativo", profissional: "Dra. Ana Souza", ultimaSessao: "15/04/2026" },
  { id: "2", nome: "Maria Silva", idade: 7, diagnostico: "TEA Nível 2", status: "Ativo", profissional: "Dr. Carlos Lima", ultimaSessao: "14/04/2026" },
  { id: "3", nome: "Pedro Rocha", idade: 4, diagnostico: "TEA Nível 1", status: "Ativo", profissional: "Dra. Ana Souza", ultimaSessao: "15/04/2026" },
  { id: "4", nome: "Julia Santos", idade: 6, diagnostico: "TDAH", status: "Em Avaliação", profissional: "Dr. Paulo Dias", ultimaSessao: "12/04/2026" },
  { id: "5", nome: "Gabriel Oliveira", idade: 8, diagnostico: "TEA Nível 2", status: "Ativo", profissional: "Dra. Fernanda Costa", ultimaSessao: "15/04/2026" },
  { id: "6", nome: "Sofia Almeida", idade: 3, diagnostico: "Atraso no Desenvolvimento", status: "Novo", profissional: "Dra. Ana Souza", ultimaSessao: "—" },
];

const coresStatus: Record<string, string> = {
  Ativo: "bg-status-success/15 text-status-success border-status-success/30",
  "Em Avaliação": "bg-status-warning/15 text-status-warning border-status-warning/30",
  Novo: "bg-status-info/15 text-status-info border-status-info/30",
};

const statusDisponiveis = ["Ativo", "Em Avaliação", "Novo"];
const profissionaisDisponiveis = [
  "Dra. Ana Souza",
  "Dr. Carlos Lima",
  "Dr. Paulo Dias",
  "Dra. Fernanda Costa",
];

export default function ListaCriancas() {
  const navegar = useNavigate();
  const [criancas, setCriancas] = useState<Crianca[]>(criancasIniciais);
  const [busca, setBusca] = useState("");
  const [statusSelecionados, setStatusSelecionados] = useState<string[]>([]);
  const [profissionalFiltro, setProfissionalFiltro] = useState<string>("todos");

  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [novaCrianca, setNovaCrianca] = useState({
    nome: "",
    idade: "",
    diagnostico: "",
    status: "Novo",
    profissional: profissionaisDisponiveis[0],
  });

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

  const salvarNovaCrianca = () => {
    if (!novaCrianca.nome.trim() || !novaCrianca.idade || !novaCrianca.diagnostico.trim()) {
      toast.error("Preencha nome, idade e diagnóstico.");
      return;
    }
    const idade = Number(novaCrianca.idade);
    if (!Number.isFinite(idade) || idade <= 0 || idade > 25) {
      toast.error("Idade inválida.");
      return;
    }
    const nova: Crianca = {
      id: String(Date.now()),
      nome: novaCrianca.nome.trim(),
      idade,
      diagnostico: novaCrianca.diagnostico.trim(),
      status: novaCrianca.status,
      profissional: novaCrianca.profissional,
      ultimaSessao: "—",
    };
    setCriancas((prev) => [nova, ...prev]);
    toast.success(`${nova.nome} cadastrada com sucesso.`);
    setDialogoAberto(false);
    setNovaCrianca({
      nome: "",
      idade: "",
      diagnostico: "",
      status: "Novo",
      profissional: profissionaisDisponiveis[0],
    });
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

      {/* Search & filter */}
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
            <div>
              <Label className="text-xs uppercase text-muted-foreground">
                Profissional
              </Label>
              <Select
                value={profissionalFiltro}
                onValueChange={setProfissionalFiltro}
              >
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
            {(filtrosAtivos > 0 || busca) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={limparFiltros}
                className="w-full gap-2"
              >
                <X className="h-3.5 w-3.5" /> Limpar filtros
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Grid */}
      {criancasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Baby className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">Nenhuma criança encontrada com esses filtros.</p>
          <Button variant="link" onClick={limparFiltros}>
            Limpar filtros
          </Button>
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
                    <Badge
                      variant="outline"
                      className={coresStatus[crianca.status] || ""}
                    >
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

      {/* Dialog Nova Criança */}
      <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Criança</DialogTitle>
            <DialogDescription>
              Cadastre uma nova criança no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={novaCrianca.nome}
                onChange={(e) =>
                  setNovaCrianca({ ...novaCrianca, nome: e.target.value })
                }
                placeholder="Ex: João da Silva"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="idade">Idade</Label>
                <Input
                  id="idade"
                  type="number"
                  min={1}
                  max={25}
                  value={novaCrianca.idade}
                  onChange={(e) =>
                    setNovaCrianca({ ...novaCrianca, idade: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={novaCrianca.status}
                  onValueChange={(v) =>
                    setNovaCrianca({ ...novaCrianca, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusDisponiveis.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
              <Label>Profissional responsável</Label>
              <Select
                value={novaCrianca.profissional}
                onValueChange={(v) =>
                  setNovaCrianca({ ...novaCrianca, profissional: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profissionaisDisponiveis.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarNovaCrianca}>Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
