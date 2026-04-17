import { useState } from "react";
import { Plus, Trash2, Star, Gift, Heart, Apple, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReforcadorUsado } from "./tiposSessoes";

const ICONES = {
  tangivel: Gift,
  social: Heart,
  comestivel: Apple,
  atividade: Gamepad2,
};

const ROTULOS = {
  tangivel: "Tangível",
  social: "Social",
  comestivel: "Comestível",
  atividade: "Atividade",
};

interface Props {
  reforcadores: ReforcadorUsado[];
  aoMudar: (r: ReforcadorUsado[]) => void;
}

export function ListaReforcadores({ reforcadores, aoMudar }: Props) {
  const [novo, setNovo] = useState<ReforcadorUsado>({
    nome: "",
    tipo: "social",
    efetividade: 3,
  });

  const adicionar = () => {
    if (!novo.nome.trim()) return;
    aoMudar([...reforcadores, novo]);
    setNovo({ nome: "", tipo: "social", efetividade: 3 });
  };

  const remover = (i: number) => aoMudar(reforcadores.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {reforcadores.map((r, i) => {
          const Icone = ICONES[r.tipo];
          return (
            <Card key={i} className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/30 flex items-center justify-center shrink-0">
                <Icone className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{r.nome}</p>
                <p className="text-xs text-muted-foreground">{ROTULOS[r.tipo]}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={cn(
                        "h-3 w-3",
                        n <= r.efetividade
                          ? "fill-status-warning text-status-warning"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remover(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-muted/30 border-dashed">
        <h4 className="font-medium text-foreground mb-3">Adicionar reforçador</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="sm:col-span-2">
            <Label className="text-xs">Nome</Label>
            <Input
              placeholder="Ex.: Adesivos, elogio, bolacha..."
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Tipo</Label>
            <Select value={novo.tipo} onValueChange={(v: ReforcadorUsado["tipo"]) => setNovo({ ...novo, tipo: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="tangivel">Tangível</SelectItem>
                <SelectItem value="comestivel">Comestível</SelectItem>
                <SelectItem value="atividade">Atividade</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-3">
          <Label className="text-xs mb-1.5 block">Efetividade</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNovo({ ...novo, efetividade: n as 1 | 2 | 3 | 4 | 5 })}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={cn(
                    "h-5 w-5",
                    n <= novo.efetividade
                      ? "fill-status-warning text-status-warning"
                      : "text-muted-foreground/40"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <Button size="sm" onClick={adicionar} className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </Card>
    </div>
  );
}
