import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface CartaoEstatisticaProps {
  titulo: string;
  valor: string | number;
  icone: LucideIcon;
  descricao?: string;
  variante?: "padrao" | "primario" | "sucesso" | "aviso" | "info";
}

const variantesEstilo = {
  padrao: "bg-card border-border",
  primario: "bg-primary/5 border-primary/20",
  sucesso: "bg-status-success/10 border-status-success/20",
  aviso: "bg-status-warning/10 border-status-warning/20",
  info: "bg-status-info/10 border-status-info/20",
};

const variantesIcone = {
  padrao: "bg-muted text-muted-foreground",
  primario: "bg-primary/10 text-primary",
  sucesso: "bg-status-success/15 text-status-success",
  aviso: "bg-status-warning/15 text-status-warning",
  info: "bg-status-info/15 text-status-info",
};

export function CartaoEstatistica({
  titulo,
  valor,
  icone: Icone,
  descricao,
  variante = "padrao",
}: CartaoEstatisticaProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-shadow hover:shadow-md animate-fade-in",
        variantesEstilo[variante]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{titulo}</p>
          <p className="text-2xl font-bold font-heading text-foreground">{valor}</p>
          {descricao && (
            <p className="text-xs text-muted-foreground">{descricao}</p>
          )}
        </div>
        <div
          className={cn(
            "p-2.5 rounded-lg",
            variantesIcone[variante]
          )}
        >
          <Icone className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
