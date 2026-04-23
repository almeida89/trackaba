import { useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  Plane,
  UserX,
  Plus,
  Search,
  Mail,
  Phone,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CartaoEstatistica } from "@/componentes/CartaoEstatistica";
import { DialogoFuncionario } from "@/componentes/funcionarios/DialogoFuncionario";
import {
  cargosDisponiveis,
  funcionariosMock,
} from "@/componentes/funcionarios/dadosFuncionarios";
import {
  Funcionario,
  StatusFuncionario,
} from "@/componentes/funcionarios/tiposFuncionarios";
import { toast } from "sonner";

const rotuloStatus: Record<StatusFuncionario, string> = {
  ativo: "Ativo",
  ferias: "Em férias",
  afastado: "Afastado",
  inativo: "Inativo",
};

const corStatus: Record<StatusFuncionario, string> = {
  ativo: "bg-status-success/15 text-status-success border-status-success/30",
  ferias: "bg-status-info/15 text-status-info border-status-info/30",
  afastado: "bg-status-warning/15 text-status-warning border-status-warning/30",
  inativo: "bg-muted text-muted-foreground border-border",
};

const corNivel: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/30",
  clinico: "bg-secondary/10 text-secondary border-secondary/30",
  operacional: "bg-muted text-foreground border-border",
  visualizador: "bg-muted/50 text-muted-foreground border-border",
};

export default function PaginaFuncionarios() {
  const [funcionarios, setFuncionarios] =
    useState<Funcionario[]>(funcionariosMock);
  const [busca, setBusca] = useState("");
  const [filtroCargo, setFiltroCargo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [editando, setEditando] = useState<Funcionario | null>(null);

  const lista = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return funcionarios.filter((f) => {
      const correspondeBusca =
        !termo ||
        f.nome.toLowerCase().includes(termo) ||
        f.email.toLowerCase().includes(termo) ||
        f.especialidades.some((e) => e.toLowerCase().includes(termo));
      const correspondeCargo =
        filtroCargo === "todos" || f.cargo === filtroCargo;
      const correspondeStatus =
        filtroStatus === "todos" || f.status === filtroStatus;
      return correspondeBusca && correspondeCargo && correspondeStatus;
    });
  }, [funcionarios, busca, filtroCargo, filtroStatus]);

  const kpis = useMemo(() => {
    const ativos = funcionarios.filter((f) => f.status === "ativo").length;
    const ferias = funcionarios.filter((f) => f.status === "ferias").length;
    const afastados = funcionarios.filter(
      (f) => f.status === "afastado" || f.status === "inativo"
    ).length;
    return { total: funcionarios.length, ativos, ferias, afastados };
  }, [funcionarios]);

  const abrirNovo = () => {
    setEditando(null);
    setDialogoAberto(true);
  };

  const abrirEdicao = (f: Funcionario) => {
    setEditando(f);
    setDialogoAberto(true);
  };

  const salvar = (f: Funcionario) => {
    setFuncionarios((prev) => {
      const existe = prev.some((p) => p.id === f.id);
      return existe ? prev.map((p) => (p.id === f.id ? f : p)) : [f, ...prev];
    });
  };

  const alternarStatus = (f: Funcionario) => {
    const novo: StatusFuncionario = f.status === "ativo" ? "inativo" : "ativo";
    setFuncionarios((prev) =>
      prev.map((p) => (p.id === f.id ? { ...p, status: novo } : p))
    );
    toast.success(
      novo === "ativo" ? "Funcionário reativado" : "Funcionário desativado"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Funcionários
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Equipe clínica e administrativa da clínica
          </p>
        </div>
        <Button onClick={abrirNovo} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo funcionário
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CartaoEstatistica
          titulo="Total"
          valor={kpis.total}
          icone={Users}
          variante="primario"
        />
        <CartaoEstatistica
          titulo="Ativos"
          valor={kpis.ativos}
          icone={UserCheck}
          variante="sucesso"
        />
        <CartaoEstatistica
          titulo="Em férias"
          valor={kpis.ferias}
          icone={Plane}
          variante="info"
        />
        <CartaoEstatistica
          titulo="Afastados / inativos"
          valor={kpis.afastados}
          icone={UserX}
          variante="aviso"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou especialidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filtroCargo} onValueChange={setFiltroCargo}>
          <SelectTrigger className="lg:w-64">
            <SelectValue placeholder="Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os cargos</SelectItem>
            {cargosDisponiveis.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="lg:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="ferias">Em férias</SelectItem>
            <SelectItem value="afastado">Afastados</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Exibindo {lista.length} de {funcionarios.length} funcionários
      </p>

      {/* Cards */}
      {lista.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">
            Nenhum funcionário encontrado
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Ajuste os filtros ou cadastre um novo membro da equipe.
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
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-heading font-semibold text-primary">
                  {f.iniciais}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-semibold text-foreground truncate">
                      {f.nome}
                    </h3>
                    <Badge
                      variant="outline"
                      className={corStatus[f.status]}
                    >
                      {rotuloStatus[f.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {f.cargo}
                  </p>
                  {f.registroProfissional && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {f.registroProfissional}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{f.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{f.telefone || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  <Badge
                    variant="outline"
                    className={`${corNivel[f.nivelAcesso]} text-[11px] py-0 px-1.5`}
                  >
                    {f.nivelAcesso}
                  </Badge>
                </div>
              </div>

              {f.especialidades.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {f.especialidades.slice(0, 4).map((e) => (
                    <Badge
                      key={e}
                      variant="secondary"
                      className="text-[11px] font-normal"
                    >
                      {e}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border text-center">
                <div>
                  <p className="text-base font-heading font-semibold text-foreground">
                    {f.criancasAtendidas}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Crianças</p>
                </div>
                <div>
                  <p className="text-base font-heading font-semibold text-foreground">
                    {f.sessoesNoMes}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Sessões/mês</p>
                </div>
                <div>
                  <p className="text-base font-heading font-semibold text-foreground">
                    {f.cargaHorariaSemanal}h
                  </p>
                  <p className="text-[11px] text-muted-foreground">Semanais</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => abrirEdicao(f)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => alternarStatus(f)}
                >
                  {f.status === "ativo" ? "Desativar" : "Reativar"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DialogoFuncionario
        aberto={dialogoAberto}
        aoFechar={() => setDialogoAberto(false)}
        funcionario={editando}
        aoSalvar={salvar}
      />
    </div>
  );
}
