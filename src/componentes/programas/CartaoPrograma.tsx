import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CORES_DISCIPLINA } from "./dadosProgramas";
import { Programa } from "./tiposProgramas";

interface PropriedadesCartaoPrograma {
  programa: Programa;
  arrastavel?: boolean;
  aoClicar?: (programa: Programa) => void;
  aoClonar?: (programa: Programa) => void;
  aoEditar?: (programa: Programa) => void;
  aoRemover?: (programa: Programa) => void;
}

export function CartaoPrograma({
  programa,
  arrastavel = false,
  aoClicar,
  aoClonar,
  aoEditar,
  aoRemover,
}: PropriedadesCartaoPrograma) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: programa.id,
    disabled: !arrastavel,
  });

  const estilo = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const corStatus =
    programa.status === "ativo"
      ? "bg-status-success/10 text-status-success"
      : programa.status === "pausado"
        ? "bg-status-warning/10 text-status-warning"
        : "bg-muted text-muted-foreground";

  return (
    <Card
      ref={setNodeRef}
      style={estilo}
      className="group p-4 hover:shadow-md transition-shadow cursor-pointer border-border"
      onClick={() => aoClicar?.(programa)}
    >
      <div className="flex items-start gap-3">
        {arrastavel && (
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
            aria-label="Arrastar para reordenar"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground leading-tight">{programa.nome}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {aoClonar && (
                  <DropdownMenuItem onClick={() => aoClonar(programa)}>
                    <Copy className="h-4 w-4 mr-2" /> Clonar
                  </DropdownMenuItem>
                )}
                {aoEditar && (
                  <DropdownMenuItem onClick={() => aoEditar(programa)}>
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </DropdownMenuItem>
                )}
                {aoRemover && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => aoRemover(programa)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Remover
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{programa.objetivoGeral}</p>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className={CORES_DISCIPLINA[programa.disciplina]}>
              {programa.disciplina}
            </Badge>
            <Badge variant="outline" className="bg-muted/50">
              {programa.tipo}
            </Badge>
            <Badge variant="outline" className={corStatus}>
              {programa.status}
            </Badge>
            <Badge variant="outline" className="bg-muted/50">
              {programa.objetivos.length} objetivos
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
