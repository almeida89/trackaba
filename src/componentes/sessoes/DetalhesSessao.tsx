import { useState } from "react";
import { Mic, Paperclip, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sessao, HumorCrianca, StatusSessao } from "./tiposSessoes";
import { FormularioABC } from "./FormularioABC";
import { ListaReforcadores } from "./ListaReforcadores";
import { RegistrosProgramas } from "./RegistrosProgramas";

const HUMORES: { valor: HumorCrianca; emoji: string; rotulo: string }[] = [
  { valor: "otimo", emoji: "😄", rotulo: "Ótimo" },
  { valor: "bom", emoji: "🙂", rotulo: "Bom" },
  { valor: "neutro", emoji: "😐", rotulo: "Neutro" },
  { valor: "ansioso", emoji: "😟", rotulo: "Ansioso" },
  { valor: "irritado", emoji: "😠", rotulo: "Irritado" },
  { valor: "sonolento", emoji: "😴", rotulo: "Sonolento" },
];

interface Props {
  sessao: Sessao;
  aoSalvar: (s: Sessao) => void;
}

export function DetalhesSessao({ sessao, aoSalvar }: Props) {
  const [editavel, setEditavel] = useState<Sessao>(sessao);

  const salvar = () => aoSalvar(editavel);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">{editavel.criancaNome}</h2>
            <p className="text-sm text-muted-foreground">
              {new Date(editavel.data).toLocaleDateString("pt-BR")} • {editavel.horaInicio} - {editavel.horaFim} • {editavel.profissionalNome}
            </p>
          </div>
          <Button onClick={salvar} className="gap-2">
            <Save className="h-4 w-4" /> Salvar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={editavel.status} onValueChange={(v: StatusSessao) => setEditavel({ ...editavel, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="em_andamento">Em andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="falta">Falta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Humor da criança</Label>
            <div className="flex flex-wrap gap-1.5">
              {HUMORES.map((h) => (
                <button
                  key={h.valor}
                  onClick={() => setEditavel({ ...editavel, humor: h.valor })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm border transition-all flex items-center gap-1.5",
                    editavel.humor === h.valor
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span>{h.emoji}</span>
                  <span className="text-xs">{h.rotulo}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="notas" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="notas">Notas</TabsTrigger>
          <TabsTrigger value="programas">
            Programas
            {editavel.registros.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                {editavel.registros.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="abc">
            ABC
            {editavel.narrativaAbc.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                {editavel.narrativaAbc.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reforcadores">Reforçadores</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
        </TabsList>

        <TabsContent value="notas" className="space-y-4 mt-4">
          <Card className="p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm font-medium">Nota geral da sessão</Label>
                <Button variant="ghost" size="sm" className="gap-1.5 h-7">
                  <Mic className="h-3.5 w-3.5" /> Ditar
                </Button>
              </div>
              <Textarea
                rows={4}
                placeholder="Descreva o desempenho geral, engajamento e contexto da sessão..."
                value={editavel.notaGeral || ""}
                onChange={(e) => setEditavel({ ...editavel, notaGeral: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Evolução diária</Label>
              <Textarea
                rows={3}
                placeholder="Avanços, regressões, padrões observados em relação às sessões anteriores..."
                value={editavel.evolucaoDiaria || ""}
                onChange={(e) => setEditavel({ ...editavel, evolucaoDiaria: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-destructive">Nota de incidente (opcional)</Label>
              <Textarea
                rows={3}
                placeholder="Apenas se houver evento atípico, comportamento de risco ou intercorrência..."
                value={editavel.notaIncidente || ""}
                onChange={(e) => setEditavel({ ...editavel, notaIncidente: e.target.value })}
                className={editavel.notaIncidente ? "border-destructive/40" : ""}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="programas" className="mt-4">
          <RegistrosProgramas
            registros={editavel.registros}
            aoMudar={(r) => setEditavel({ ...editavel, registros: r })}
          />
        </TabsContent>

        <TabsContent value="abc" className="mt-4">
          <FormularioABC
            narrativas={editavel.narrativaAbc}
            aoMudar={(n) => setEditavel({ ...editavel, narrativaAbc: n })}
          />
        </TabsContent>

        <TabsContent value="reforcadores" className="mt-4">
          <ListaReforcadores
            reforcadores={editavel.reforcadores}
            aoMudar={(r) => setEditavel({ ...editavel, reforcadores: r })}
          />
        </TabsContent>

        <TabsContent value="anexos" className="mt-4">
          <Card className="p-8 border-dashed text-center">
            <Paperclip className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              {editavel.anexos.length} anexo(s) nesta sessão
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Imagens, vídeos e áudios poderão ser anexados após ativar Lovable Cloud.
            </p>
            <Button variant="outline" size="sm" disabled>
              <Paperclip className="h-4 w-4 mr-2" /> Adicionar mídia
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
