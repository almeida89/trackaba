import { Clock, MapPin, User, FileText, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sessao, StatusSessao } from "./tiposSessoes";

const CORES_STATUS: Record<StatusSessao, string> = {
  agendada: "bg-status-info/15 text-status-info border-status-info/30",
  em_andamento: "bg-primary/15 text-primary border-primary/30",
  concluida: "bg-status-success/15 text-status-success border-status-success/30",
  cancelada: "bg-muted text-muted-foreground border-border",
  falta: "bg-destructive/15 text-destructive border-destructive/30",
};

const ROTULOS_STATUS: Record<StatusSessao, string> = {
  agendada: "Agendada",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
  falta: "Falta",
};

const CORES_TIPO: Record<string, string> = {
  ABA: "bg-primary/10 text-primary",
  Fono: "bg-secondary/15 text-secondary",
  TO: "bg-accent/20 text-accent-foreground",
  Psico: "bg-status-info/10 text-status-info",
  Psicopedagogia: "bg-status-warning/15 text-status-warning",
};

interface Props {
  sessao: Sessao;
  selecionado: boolean;
  aoSelecionar: () => void;
}

export function CartaoSessao({ sessao, selecionado, aoSelecionar }: Props) {
  return (
    <Card
      onClick={aoSelecionar}
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md border-l-4",
        selecionado
          ? "border-l-primary ring-1 ring-primary/30 bg-primary/5"
          : "border-l-transparent hover:border-l-primary/40"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-foreground truncate">{sessao.criancaNome}</h4>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <User className="h-3 w-3" />
            <span className="truncate">{sessao.profissionalNome}</span>
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] shrink-0", CORES_STATUS[sessao.status])}>
          {ROTULOS_STATUS[sessao.status]}
        </Badge>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium", CORES_TIPO[sessao.tipo])}>
          {sessao.tipo}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {sessao.horaInicio} - {sessao.horaFim}
        </span>
        {sessao.sala && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {sessao.sala}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {sessao.registros.length} registros
        </span>
        {sessao.narrativaAbc.length > 0 && (
          <span className="flex items-center gap-1 text-status-warning">
            <AlertTriangle className="h-3 w-3" />
            {sessao.narrativaAbc.length} ABC
          </span>
        )}
      </div>
    </Card>
  );
}
