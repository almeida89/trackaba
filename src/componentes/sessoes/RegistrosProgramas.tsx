import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NivelDesempenho, RegistroPrograma } from "./tiposSessoes";

const NIVEIS: { sigla: NivelDesempenho; nome: string; cor: string }[] = [
  { sigla: "-", nome: "Linha Base", cor: "bg-muted text-muted-foreground" },
  { sigla: "AFT", nome: "Aj. Física Total", cor: "bg-destructive/15 text-destructive" },
  { sigla: "AFL", nome: "Aj. Física Leve", cor: "bg-status-warning/15 text-status-warning" },
  { sigla: "AG", nome: "Aj. Gestual", cor: "bg-status-info/15 text-status-info" },
  { sigla: "IND", nome: "Independente", cor: "bg-status-success/15 text-status-success" },
  { sigla: "+", nome: "Acima do Esperado", cor: "bg-primary/15 text-primary" },
];

interface Props {
  registros: RegistroPrograma[];
  aoMudar: (r: RegistroPrograma[]) => void;
}

export function RegistrosProgramas({ registros, aoMudar }: Props) {
  const [novo, setNovo] = useState<RegistroPrograma>({
    programaId: crypto.randomUUID(),
    programaNome: "",
    objetivo: "",
    tentativas: 10,
    acertos: 0,
    nivel: "-",
  });

  const adicionar = () => {
    if (!novo.programaNome.trim() || !novo.objetivo.trim()) return;
    aoMudar([...registros, { ...novo, programaId: crypto.randomUUID() }]);
    setNovo({ programaId: "", programaNome: "", objetivo: "", tentativas: 10, acertos: 0, nivel: "-" });
  };

  const remover = (id: string) => aoMudar(registros.filter((r) => r.programaId !== id));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {NIVEIS.map((n) => (
          <span key={n.sigla} className={cn("text-[10px] px-2 py-0.5 rounded font-medium", n.cor)}>
            {n.sigla} — {n.nome}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {registros.map((r) => {
          const nivel = NIVEIS.find((n) => n.sigla === r.nivel)!;
          const pct = r.tentativas > 0 ? Math.round((r.acertos / r.tentativas) * 100) : 0;
          return (
            <Card key={r.programaId} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground">{r.programaNome}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.objetivo}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-xs px-2 py-1 rounded-md font-semibold", nivel.cor)}>
                    {r.nivel}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => remover(r.programaId)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline">{r.acertos}/{r.tentativas} tentativas</Badge>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30">
                  {pct}% acerto
                </Badge>
              </div>
              {r.observacao && (
                <p className="text-xs text-muted-foreground mt-2 italic">"{r.observacao}"</p>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-muted/30 border-dashed">
        <h4 className="font-medium text-foreground mb-3">Novo registro de programa</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="md:col-span-2">
            <Label className="text-xs">Nome do programa</Label>
            <Input
              placeholder="Ex.: Comunicação Funcional - PECS"
              value={novo.programaNome}
              onChange={(e) => setNovo({ ...novo, programaNome: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Objetivo trabalhado</Label>
            <Input
              placeholder="Ex.: Solicitar item preferido com 3 figuras"
              value={novo.objetivo}
              onChange={(e) => setNovo({ ...novo, objetivo: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Tentativas</Label>
            <Input
              type="number"
              min={0}
              value={novo.tentativas}
              onChange={(e) => setNovo({ ...novo, tentativas: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label className="text-xs">Acertos</Label>
            <Input
              type="number"
              min={0}
              max={novo.tentativas}
              value={novo.acertos}
              onChange={(e) => setNovo({ ...novo, acertos: Number(e.target.value) })}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Nível de desempenho</Label>
            <Select value={novo.nivel} onValueChange={(v: NivelDesempenho) => setNovo({ ...novo, nivel: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {NIVEIS.map((n) => (
                  <SelectItem key={n.sigla} value={n.sigla}>
                    {n.sigla} — {n.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs">Observação</Label>
            <Textarea
              rows={2}
              placeholder="Notas opcionais sobre a execução"
              value={novo.observacao || ""}
              onChange={(e) => setNovo({ ...novo, observacao: e.target.value })}
            />
          </div>
        </div>
        <Button size="sm" onClick={adicionar} className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar registro
        </Button>
      </Card>
    </div>
  );
}
