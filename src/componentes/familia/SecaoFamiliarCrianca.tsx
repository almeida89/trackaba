import { useMemo, useState } from "react";
import {
  Users,
  Mail,
  Phone,
  Pencil,
  Send,
  Plus,
  MessageSquare,
  PhoneCall,
  Calendar,
  Heart,
  Smartphone,
  Star,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DialogoMembroFamilia } from "./DialogoMembroFamilia";
import { comunicacoesMock, familiasMock } from "./dadosFamilia";
import {
  ComunicacaoFamilia,
  MembroFamilia,
  StatusAcessoApp,
} from "./tiposFamilia";
import { toast } from "sonner";
import { EmptyState } from "@/componentes/EmptyState";

interface Props {
  criancaId: string;
  criancaNome: string;
}

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

const formatarDataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export function SecaoFamiliarCrianca({ criancaId, criancaNome }: Props) {
  const [familiares, setFamiliares] = useState<MembroFamilia[]>(
    familiasMock.filter((f) =>
      f.criancas.some((c) => c.criancaId === criancaId)
    )
  );
  const [comunicacoes] = useState<ComunicacaoFamilia[]>(
    comunicacoesMock.filter((c) =>
      familiasMock
        .filter((f) => f.criancas.some((cc) => cc.criancaId === criancaId))
        .some((f) => f.id === c.membroId)
    )
  );
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [editando, setEditando] = useState<MembroFamilia | null>(null);

  const responsavelPrincipal = useMemo(
    () =>
      familiares.find((f) =>
        f.criancas.find((c) => c.criancaId === criancaId)?.principal
      ),
    [familiares, criancaId]
  );

  const kpis = useMemo(() => {
    const ativos = familiares.filter(
      (f) => f.statusAcessoApp === "ativo"
    ).length;
    const orientacoes = familiares.filter((f) => f.participaOrientacoes).length;
    const relatorios = familiares.filter((f) => f.recebeRelatorios).length;
    return {
      total: familiares.length,
      ativos,
      orientacoes,
      relatorios,
    };
  }, [familiares]);

  const abrirNovo = () => {
    setEditando({
      id: `fa${Date.now()}`,
      nome: "",
      parentesco: "Mãe",
      email: "",
      telefone: "",
      recebeRelatorios: true,
      participaOrientacoes: true,
      statusAcessoApp: "sem_acesso",
      criancas: [{ criancaId, nome: criancaNome, principal: false }],
      iniciais: "",
    });
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
      {/* Cabeçalho com ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-heading font-semibold text-foreground text-lg">
            Núcleo familiar
          </h3>
          <p className="text-sm text-muted-foreground">
            Responsáveis vinculados a {criancaNome}, comunicação e acesso ao
            portal da família.
          </p>
        </div>
        <Button onClick={abrirNovo} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo familiar
        </Button>
      </div>

      {/* KPIs compactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Familiares</p>
            <p className="text-xl font-heading font-bold text-foreground">
              {kpis.total}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-status-success/15 text-status-success flex items-center justify-center">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">App ativo</p>
            <p className="text-xl font-heading font-bold text-foreground">
              {kpis.ativos}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-status-info/15 text-status-info flex items-center justify-center">
            <Heart className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Em orientação</p>
            <p className="text-xl font-heading font-bold text-foreground">
              {kpis.orientacoes}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Recebem relatórios</p>
            <p className="text-xl font-heading font-bold text-foreground">
              {kpis.relatorios}
            </p>
          </div>
        </div>
      </div>

      {/* Responsável principal em destaque */}
      {responsavelPrincipal && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center shrink-0 font-heading font-semibold text-primary text-lg">
              {responsavelPrincipal.iniciais}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-heading font-semibold text-foreground text-base">
                  {responsavelPrincipal.nome}
                </h4>
                <Badge className="bg-primary/15 text-primary border-primary/30 gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Responsável principal
                </Badge>
                <Badge
                  variant="outline"
                  className={corAcesso[responsavelPrincipal.statusAcessoApp]}
                >
                  {rotuloAcesso[responsavelPrincipal.statusAcessoApp]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {responsavelPrincipal.parentesco}
                {responsavelPrincipal.profissao
                  ? ` • ${responsavelPrincipal.profissao}`
                  : ""}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {responsavelPrincipal.email || "—"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {responsavelPrincipal.telefone}
                </span>
                {responsavelPrincipal.ultimoAcesso && (
                  <span className="text-xs">
                    Último acesso:{" "}
                    {formatarDataHora(responsavelPrincipal.ultimoAcesso)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="familiares">
        <TabsList>
          <TabsTrigger value="familiares">
            Familiares ({familiares.length})
          </TabsTrigger>
          <TabsTrigger value="comunicacoes">
            Comunicações ({comunicacoes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="familiares" className="mt-4">
          {familiares.length === 0 ? (
            <EmptyState
              icone={Users}
              titulo="Nenhum familiar cadastrado"
              descricao="Adicione o responsável principal e demais familiares vinculados a esta criança."
              acao={
                <Button onClick={abrirNovo} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Cadastrar familiar
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {familiares.map((f) => {
                const vinculo = f.criancas.find(
                  (c) => c.criancaId === criancaId
                );
                return (
                  <div
                    key={f.id}
                    className="rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/30 transition-all flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-full bg-secondary/15 flex items-center justify-center shrink-0 font-heading font-semibold text-secondary">
                        {f.iniciais}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-heading font-semibold text-foreground truncate">
                              {f.nome}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {f.parentesco}
                              {vinculo?.principal ? " • Principal" : ""}
                              {f.profissao ? ` • ${f.profissao}` : ""}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${corAcesso[f.statusAcessoApp]} text-[11px] shrink-0`}
                          >
                            {rotuloAcesso[f.statusAcessoApp]}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{f.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span>{f.telefone}</span>
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
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comunicacoes" className="mt-4 space-y-3">
          {comunicacoes.length === 0 ? (
            <EmptyState
              icone={MessageSquare}
              titulo="Sem comunicações registradas"
              descricao="As trocas com a família (mensagens, ligações, reuniões e e-mails) aparecerão aqui."
            />
          ) : (
            comunicacoes
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
              })
          )}
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
