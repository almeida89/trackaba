import { useMemo, useState } from "react";
import {
  Users,
  Heart,
  Smartphone,
  MessageSquare,
  Plus,
  Search,
  Mail,
  Phone,
  Pencil,
  Send,
  Calendar,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartaoEstatistica } from "@/componentes/CartaoEstatistica";
import { DialogoMembroFamilia } from "@/componentes/familia/DialogoMembroFamilia";
import {
  comunicacoesMock,
  familiasMock,
  parentescosDisponiveis,
} from "@/componentes/familia/dadosFamilia";
import {
  ComunicacaoFamilia,
  MembroFamilia,
  StatusAcessoApp,
} from "@/componentes/familia/tiposFamilia";
import { toast } from "sonner";

const rotuloAcesso: Record<StatusAcessoApp, string> = {
  ativo: "App ativo",
  convite_enviado: "Convite enviado",
  sem_acesso: "Sem acesso",
  bloqueado: "Bloqueado",
};

const corAcesso: Record<StatusAcessoApp, string> = {
  ativo: "bg-status-success/15 text-status-success border-status-success/30",
  convite_enviado:
    "bg-status-warning/15 text-status-warning border-status-warning/30",
  sem_acesso: "bg-muted text-muted-foreground border-border",
  bloqueado:
    "bg-status-danger/15 text-status-danger border-status-danger/30",
};

const iconeComunicacao = {
  mensagem: MessageSquare,
  ligacao: PhoneCall,
  reuniao: Calendar,
  email: Mail,
} as const;

const rotuloComunicacao = {
  mensagem: "Mensagem",
  ligacao: "Ligação",
  reuniao: "Reunião",
  email: "E-mail",
} as const;

const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR");

export default function PaginaFamilia() {
  const [familiares, setFamiliares] = useState<MembroFamilia[]>(familiasMock);
  const [comunicacoes] = useState<ComunicacaoFamilia[]>(comunicacoesMock);
  const [busca, setBusca] = useState("");
  const [filtroParentesco, setFiltroParentesco] = useState("todos");
  const [filtroAcesso, setFiltroAcesso] = useState("todos");
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [editando, setEditando] = useState<MembroFamilia | null>(null);

  const lista = useMemo(() => {
    const t = busca.toLowerCase().trim();
    return familiares.filter((f) => {
      const correspondeBusca =
        !t ||
        f.nome.toLowerCase().includes(t) ||
        f.email.toLowerCase().includes(t) ||
        f.criancas.some((c) => c.nome.toLowerCase().includes(t));
      const correspondeParentesco =
        filtroParentesco === "todos" || f.parentesco === filtroParentesco;
      const correspondeAcesso =
        filtroAcesso === "todos" || f.statusAcessoApp === filtroAcesso;
      return correspondeBusca && correspondeParentesco && correspondeAcesso;
    });
  }, [familiares, busca, filtroParentesco, filtroAcesso]);

  const kpis = useMemo(() => {
    const acessos = familiares.filter(
      (f) => f.statusAcessoApp === "ativo"
    ).length;
    const convites = familiares.filter(
      (f) => f.statusAcessoApp === "convite_enviado"
    ).length;
    const orientacoes = familiares.filter((f) => f.participaOrientacoes).length;
    return {
      total: familiares.length,
      acessos,
      convites,
      orientacoes,
    };
  }, [familiares]);

  const abrirNovo = () => {
    setEditando(null);
    setDialogoAberto(true);
  };
  const abrirEdicao = (m: MembroFamilia) => {
    setEditando(m);
    setDialogoAberto(true);
  };
  const salvar = (m: MembroFamilia) => {
    setFamiliares((prev) => {
      const existe = prev.some((p) => p.id === m.id);
      return existe ? prev.map((p) => (p.id === m.id ? m : p)) : [m, ...prev];
    });
  };

  const enviarConvite = (m: MembroFamilia) => {
    setFamiliares((prev) =>
      prev.map((p) =>
        p.id === m.id ? { ...p, statusAcessoApp: "convite_enviado" } : p
      )
    );
    toast.success(`Convite enviado para ${m.nome}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Família
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Responsáveis, vínculos com crianças e comunicação
          </p>
        </div>
        <Button onClick={abrirNovo} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo familiar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CartaoEstatistica
          titulo="Familiares"
          valor={kpis.total}
          icone={Users}
          variante="primario"
        />
        <CartaoEstatistica
          titulo="App ativo"
          valor={kpis.acessos}
          icone={Smartphone}
          variante="sucesso"
        />
        <CartaoEstatistica
          titulo="Convites pendentes"
          valor={kpis.convites}
          icone={Send}
          variante="aviso"
        />
        <CartaoEstatistica
          titulo="Em orientação parental"
          valor={kpis.orientacoes}
          icone={Heart}
          variante="info"
        />
      </div>

      <Tabs defaultValue="familiares">
        <TabsList>
          <TabsTrigger value="familiares">Familiares</TabsTrigger>
          <TabsTrigger value="comunicacoes">
            Comunicações ({comunicacoes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="familiares" className="space-y-4 mt-4">
          {/* Filtros */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou criança..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filtroParentesco}
              onValueChange={setFiltroParentesco}
            >
              <SelectTrigger className="lg:w-56">
                <SelectValue placeholder="Parentesco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os parentescos</SelectItem>
                {parentescosDisponiveis.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroAcesso} onValueChange={setFiltroAcesso}>
              <SelectTrigger className="lg:w-56">
                <SelectValue placeholder="Acesso ao app" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os acessos</SelectItem>
                <SelectItem value="ativo">App ativo</SelectItem>
                <SelectItem value="convite_enviado">
                  Convite enviado
                </SelectItem>
                <SelectItem value="sem_acesso">Sem acesso</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-muted-foreground">
            Exibindo {lista.length} de {familiares.length} familiares
          </p>

          {lista.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">
                Nenhum familiar encontrado
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajuste os filtros ou cadastre um novo responsável.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {lista.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all flex flex-col gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-secondary/15 flex items-center justify-center shrink-0 font-heading font-semibold text-secondary">
                      {f.iniciais}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-semibold text-foreground truncate">
                          {f.nome}
                        </h3>
                        <Badge
                          variant="outline"
                          className={corAcesso[f.statusAcessoApp]}
                        >
                          {rotuloAcesso[f.statusAcessoApp]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {f.parentesco}
                        {f.profissao ? ` • ${f.profissao}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{f.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{f.telefone}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5">
                      Crianças vinculadas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {f.criancas.map((c) => (
                        <Badge
                          key={c.criancaId}
                          variant="outline"
                          className={
                            c.principal
                              ? "border-primary/40 text-primary bg-primary/5"
                              : ""
                          }
                        >
                          {c.nome}
                          {c.principal ? " ★" : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {f.recebeRelatorios && (
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-normal"
                      >
                        Recebe relatórios
                      </Badge>
                    )}
                    {f.participaOrientacoes && (
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-normal"
                      >
                        Orientação parental
                      </Badge>
                    )}
                  </div>

                  {f.observacoes && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                      {f.observacoes}
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5"
                      onClick={() => abrirEdicao(f)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    {f.statusAcessoApp !== "ativo" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => enviarConvite(f)}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Convidar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comunicacoes" className="space-y-3 mt-4">
          {comunicacoes
            .slice()
            .sort((a, b) => b.data.localeCompare(a.data))
            .map((c) => {
              const membro = familiares.find((f) => f.id === c.membroId);
              const Icone = iconeComunicacao[c.tipo];
              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-border bg-card p-4 flex gap-4 hover:shadow-sm transition-shadow"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icone className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h4 className="font-heading font-semibold text-foreground">
                          {c.assunto}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {membro?.nome || "—"} • {c.responsavelClinica}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[11px]">
                          {rotuloComunicacao[c.tipo]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatarData(c.data)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {c.resumo}
                    </p>
                  </div>
                </div>
              );
            })}
        </TabsContent>
      </Tabs>

      <DialogoMembroFamilia
        aberto={dialogoAberto}
        aoFechar={() => setDialogoAberto(false)}
        membro={editando}
        aoSalvar={salvar}
      />
    </div>
  );
}
