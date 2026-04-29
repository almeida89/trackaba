import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  acaoTexto?: string;
  aoClicar?: () => void;
  className?: string;
}

export function EmptyState({ icone: Icone, titulo, descricao, acaoTexto, aoClicar, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-6 rounded-xl border border-dashed border-border bg-muted/20",
        className,
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Icone className="h-7 w-7" />
      </div>
      <h3 className="font-heading font-semibold text-foreground text-lg mb-1">{titulo}</h3>
      {descricao && <p className="text-sm text-muted-foreground max-w-md">{descricao}</p>}
      {acaoTexto && aoClicar && (
        <Button onClick={aoClicar} className="mt-5">
          {acaoTexto}
        </Button>
      )}
    </div>
  );
}
