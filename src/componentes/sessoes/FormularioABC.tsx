import { useState } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NarrativaABC } from "./tiposSessoes";

const CORES_INTENSIDADE = {
  leve: "bg-status-warning/15 text-status-warning border-status-warning/30",
  moderada: "bg-status-info/15 text-status-info border-status-info/30",
  intensa: "bg-destructive/15 text-destructive border-destructive/30",
};

interface Props {
  narrativas: NarrativaABC[];
  aoMudar: (narrativas: NarrativaABC[]) => void;
}

export function FormularioABC({ narrativas, aoMudar }: Props) {
  const [novo, setNovo] = useState<Omit<NarrativaABC, "id">>({
    horario: "",
    antecedente: "",
    comportamento: "",
    consequencia: "",
    intensidade: "leve",
  });

  const adicionar = () => {
    if (!novo.antecedente || !novo.comportamento || !novo.consequencia) return;
    aoMudar([...narrativas, { ...novo, id: crypto.randomUUID() }]);
    setNovo({ horario: "", antecedente: "", comportamento: "", consequencia: "", intensidade: "leve" });
  };

  const remover = (id: string) => aoMudar(narrativas.filter((n) => n.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <AlertTriangle className="h-4 w-4 text-status-warning" />
        Registre comportamentos-alvo usando o modelo Antecedente → Comportamento → Consequência.
      </div>

      {narrativas.map((n) => (
        <Card key={n.id} className="p-4 border-l-4 border-l-status-warning">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {n.horario && <Badge variant="outline">{n.horario}</Badge>}
              <Badge variant="outline" className={cn("text-xs", CORES_INTENSIDADE[n.intensidade])}>
                {n.intensidade}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={() => remover(n.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">A — Antecedente</p>
              <p className="text-foreground">{n.antecedente}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">B — Comportamento</p>
              <p className="text-foreground">{n.comportamento}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">C — Consequência</p>
              <p className="text-foreground">{n.consequencia}</p>
            </div>
          </div>
        </Card>
      ))}

      <Card className="p-4 bg-muted/30 border-dashed">
        <h4 className="font-medium text-foreground mb-3">Novo registro ABC</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <Label className="text-xs">Horário</Label>
            <Input
              type="time"
              value={novo.horario}
              onChange={(e) => setNovo({ ...novo, horario: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Intensidade</Label>
            <Select
              value={novo.intensidade}
              onValueChange={(v: "leve" | "moderada" | "intensa") => setNovo({ ...novo, intensidade: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="leve">Leve</SelectItem>
                <SelectItem value="moderada">Moderada</SelectItem>
                <SelectItem value="intensa">Intensa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2 mb-3">
          <div>
            <Label className="text-xs">Antecedente</Label>
            <Textarea
              rows={2}
              placeholder="O que aconteceu antes do comportamento?"
              value={novo.antecedente}
              onChange={(e) => setNovo({ ...novo, antecedente: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Comportamento</Label>
            <Textarea
              rows={2}
              placeholder="Descreva o comportamento observado"
              value={novo.comportamento}
              onChange={(e) => setNovo({ ...novo, comportamento: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Consequência</Label>
            <Textarea
              rows={2}
              placeholder="Qual foi a resposta/intervenção?"
              value={novo.consequencia}
              onChange={(e) => setNovo({ ...novo, consequencia: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={adicionar} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar narrativa ABC
        </Button>
      </Card>
    </div>
  );
}
