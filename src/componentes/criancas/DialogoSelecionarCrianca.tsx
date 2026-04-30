import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCriancas } from "@/hooks/useCriancas";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Acao = "sessao" | "avaliacao" | "agendamento";

interface Props {
  aberto: boolean;
  acao: Acao;
  aoFechar: () => void;
}

const TITULOS: Record<Acao, { titulo: string; descricao: string; aba: string }> = {
  sessao: {
    titulo: "Registrar nova sessão",
    descricao: "Selecione a criança para abrir o registro de sessão.",
    aba: "sessoes",
  },
  avaliacao: {
    titulo: "Nova avaliação",
    descricao: "Selecione a criança para iniciar a avaliação.",
    aba: "avaliacoes",
  },
  agendamento: {
    titulo: "Novo agendamento",
    descricao: "Selecione a criança para agendar uma sessão.",
    aba: "agenda",
  },
};

export function DialogoSelecionarCrianca({ aberto, acao, aoFechar }: Props) {
  const navegar = useNavigate();
  const [busca, setBusca] = useState("");
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const { criancas, carregando } = useCriancas({ busca, apenasAtivos: true });

  const cfg = TITULOS[acao];

  const lista = useMemo(() => criancas, [criancas]);

  const confirmar = () => {
    if (!selecionada) return;
    navegar(`/criancas/${selecionada}?aba=${cfg.aba}&novo=1`);
    aoFechar();
    setSelecionada(null);
    setBusca("");
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{cfg.titulo}</DialogTitle>
          <DialogDescription>{cfg.descricao}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar criança..."
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            autoFocus
          />
        </div>

        <ScrollArea className="h-64 rounded-md border">
          {carregando ? (
            <div className="p-4 text-sm text-muted-foreground">Carregando...</div>
          ) : lista.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Nenhuma criança encontrada.</div>
          ) : (
            <ul className="divide-y">
              {lista.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelecionada(c.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors flex items-center justify-between",
                      selecionada === c.id && "bg-primary/10 hover:bg-primary/15"
                    )}
                  >
                    <span className="font-medium text-foreground">{c.nome}</span>
                    <span className="text-xs text-muted-foreground">{c.idade} anos</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={!selecionada}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
