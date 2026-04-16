import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock,
  MapPin,
  User,
  Baby,
  Repeat,
  FileText,
  Pencil,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Agendamento, coresStatusAgendamento } from "./tiposAgenda";

interface DetalhesAgendamentoProps {
  aberto: boolean;
  aoFechar: () => void;
  agendamento: Agendamento | null;
  aoEditar: () => void;
  aoCancelar: (id: string) => void;
}

export function DetalhesAgendamento({
  aberto,
  aoFechar,
  agendamento,
  aoEditar,
  aoCancelar,
}: DetalhesAgendamentoProps) {
  if (!agendamento) return null;

  const statusLabels: Record<string, string> = {
    confirmado: "Confirmado",
    pendente: "Pendente",
    cancelado: "Cancelado",
    concluido: "Concluído",
    ausente: "Ausente",
  };

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && aoFechar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: agendamento.cor }}
            />
            {agendamento.tipo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Badge
            variant="outline"
            className={coresStatusAgendamento[agendamento.status]}
          >
            {statusLabels[agendamento.status]}
          </Badge>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Baby className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-foreground font-medium">
                {agendamento.criancaNome}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-foreground">
                {agendamento.profissionalNome}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-foreground">
                {format(agendamento.dataInicio, "EEEE, dd/MM/yyyy", {
                  locale: ptBR,
                })}{" "}
                • {format(agendamento.dataInicio, "HH:mm")} —{" "}
                {format(agendamento.dataFim, "HH:mm")}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-foreground">{agendamento.sala}</span>
            </div>

            {agendamento.recorrencia && (
              <div className="flex items-center gap-3 text-sm">
                <Repeat className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground capitalize">
                  Recorrência {agendamento.recorrencia.tipo}
                </span>
              </div>
            )}

            {agendamento.observacoes && (
              <div className="flex items-start gap-3 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-foreground">{agendamento.observacoes}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {agendamento.status !== "cancelado" && (
            <Button
              variant="outline"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => aoCancelar(agendamento.id)}
            >
              <XCircle className="h-4 w-4" />
              Cancelar
            </Button>
          )}
          <Button
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={aoEditar}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
