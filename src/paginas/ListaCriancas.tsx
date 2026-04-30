import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Baby, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useCriancas } from "@/hooks/useCriancas";
import { criancaSchema, type CriancaForm } from "@/schemas/crianca";

const coresStatus: Record<string, string> = {
  Ativo: "bg-status-success/15 text-status-success border-status-success/30",
  Inativo: "bg-muted text-muted-foreground border-border",
};

const formInicial: CriancaForm = {
  nome: "",
  data_nascimento: "",
  diagnostico: "",
  responsavel_principal: "",
  telefone_contato: "",
  email_contato: "",
  observacoes: "",
};

export default function ListaCriancas() {
  const navegar = useNavigate();
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [apenasAtivos, setApenasAtivos] = useState(true);
  const [pagina, setPagina] = useState(1);

  // Debounce de busca
  useEffect(() => {
    const t = setTimeout(() => {
      setBuscaDebounced(busca.trim());
      setPagina(1);
    }, 300);
    return () => clearTimeout(t);
  }, [busca]);

  const {
    criancas,
    total,
    totalPaginas,
    carregando,
    atualizando,
    criar,
    salvando,
  } = useCriancas({ busca: buscaDebounced, apenasAtivos, pagina });

  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [form, setForm] = useState<CriancaForm>(formInicial);
  const [erros, setErros] = useState<Partial<Record<keyof CriancaForm, string>>>({});

  const filtrosAtivos = useMemo(
    () => (apenasAtivos ? 0 : 1),
    [apenasAtivos],
  );

  const limparFiltros = () => {
    setApenasAtivos(true);
    setBusca("");
    setPagina(1);
  };

  const atualizarCampo = <K extends keyof CriancaForm>(campo: K, valor: CriancaForm[K]) => {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }));
  };

  const salvarNovaCrianca = async () => {
    const result = criancaSchema.safeParse(form);
    if (!result.success) {
      const novosErros: Partial<Record<keyof CriancaForm, string>> = {};
      for (const issue of result.error.issues) {
        const campo = issue.path[0] as keyof CriancaForm;
        if (!novosErros[campo]) novosErros[campo] = issue.message;
      }
      setErros(novosErros);
      toast.error("Verifique os campos do formulário");
      return;
    }
    try {
      await criar(result.data);
      setDialogoAberto(false);
      setForm(formInicial);
      setErros({});
    } catch {
      // toast já tratado no hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Crianças</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? "criança cadastrada" : "crianças cadastradas"}
            {atualizando && " • atualizando…"}
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
            placeholder="Buscar por nome ou diagnóstico..."
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
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <Checkbox
                  checked={apenasAtivos}
                  onCheckedChange={(v) => {
                    setApenasAtivos(!!v);
                    setPagina(1);
                  }}
                />
                <span className="text-sm">Apenas ativos</span>
              </label>
            </div>
            {(filtrosAtivos > 0 || busca) && (
              <Button variant="ghost" size="sm" onClick={limparFiltros} className="w-full gap-2">
                <X className="h-3.5 w-3.5" /> Limpar filtros
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {carregando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : criancas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Baby className="h-10 w-10 mb-3 opacity-40" />
          <p className="text-sm">
            {buscaDebounced
              ? "Nenhuma criança encontrada para essa busca."
              : "Nenhuma criança cadastrada ainda."}
          </p>
          {(buscaDebounced || filtrosAtivos > 0) && (
            <Button variant="link" onClick={limparFiltros}>
              Limpar filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {criancas.map((crianca) => (
              <button
                key={crianca.id}
                onClick={() => navegar(`/criancas/${crianca.id}`)}
                className="rounded-xl border border-border bg-card p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {crianca.foto_url ? (
                      <img
                        src={crianca.foto_url}
                        alt={crianca.nome}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Baby className="h-5 w-5 text-primary" />
                    )}
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
                      <span className="truncate">{crianca.profissional}</span>
                      <span className="shrink-0 ml-2">
                        Última: {crianca.ultimaSessao}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Página {pagina} de {totalPaginas}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1 || atualizando}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina >= totalPaginas || atualizando}
                  className="gap-1"
                >
                  Próxima <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Criança</DialogTitle>
            <DialogDescription>Cadastre uma nova criança no sistema.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => atualizarCampo("nome", e.target.value)}
                placeholder="Ex: João da Silva"
                aria-invalid={!!erros.nome}
              />
              {erros.nome && <p className="text-xs text-destructive mt-1">{erros.nome}</p>}
            </div>
            <div>
              <Label htmlFor="dn">Data de nascimento *</Label>
              <Input
                id="dn"
                type="date"
                value={form.data_nascimento}
                onChange={(e) => atualizarCampo("data_nascimento", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                aria-invalid={!!erros.data_nascimento}
              />
              {erros.data_nascimento && (
                <p className="text-xs text-destructive mt-1">{erros.data_nascimento}</p>
              )}
            </div>
            <div>
              <Label htmlFor="diagnostico">Diagnóstico *</Label>
              <Input
                id="diagnostico"
                value={form.diagnostico}
                onChange={(e) => atualizarCampo("diagnostico", e.target.value)}
                placeholder="Ex: TEA Nível 1"
                aria-invalid={!!erros.diagnostico}
              />
              {erros.diagnostico && (
                <p className="text-xs text-destructive mt-1">{erros.diagnostico}</p>
              )}
            </div>
            <div>
              <Label htmlFor="resp">Responsável principal</Label>
              <Input
                id="resp"
                value={form.responsavel_principal ?? ""}
                onChange={(e) => atualizarCampo("responsavel_principal", e.target.value)}
                placeholder="Ex: Maria da Silva"
              />
              {erros.responsavel_principal && (
                <p className="text-xs text-destructive mt-1">{erros.responsavel_principal}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tel">Telefone</Label>
                <Input
                  id="tel"
                  value={form.telefone_contato ?? ""}
                  onChange={(e) => atualizarCampo("telefone_contato", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
                {erros.telefone_contato && (
                  <p className="text-xs text-destructive mt-1">{erros.telefone_contato}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email_contato ?? ""}
                  onChange={(e) => atualizarCampo("email_contato", e.target.value)}
                  placeholder="contato@exemplo.com"
                />
                {erros.email_contato && (
                  <p className="text-xs text-destructive mt-1">{erros.email_contato}</p>
                )}
              </div>
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
