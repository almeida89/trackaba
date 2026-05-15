import { useEffect, useState } from "react";
import { Save, FileText, FileSignature, Lock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Sessao, HumorCrianca } from "./tiposSessoes";
import { FormularioABC } from "./FormularioABC";
import { ListaReforcadores } from "./ListaReforcadores";
import { RegistrosProgramas } from "./RegistrosProgramas";
import { exportarSessaoPdf } from "./exportarSessaoPdf";
import { AnexosCrianca } from "@/componentes/criancas/AnexosCrianca";

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
  aoSalvar: (s: Sessao) => Promise<boolean> | boolean;
  aoFinalizar: (id: string) => Promise<boolean> | boolean;
  aoAssinar: (id: string) => Promise<boolean> | boolean;
}

export function DetalhesSessao({ sessao, aoSalvar, aoFinalizar, aoAssinar }: Props) {
  const [editavel, setEditavel] = useState<Sessao>(sessao);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => setEditavel(sessao), [sessao]);

  const bloqueada = editavel.status === "assinada";

  const salvar = async () => {
    setSalvando(true);
    await aoSalvar(editavel);
    setSalvando(false);
  };

  const finalizar = async () => {
    setSalvando(true);
    // Salva mudanças pendentes antes
    await aoSalvar(editavel);
    await aoFinalizar(editavel.id);
    setSalvando(false);
  };

  const assinar = async () => {
    setSalvando(true);
    await aoSalvar(editavel);
    await aoAssinar(editavel.id);
    setSalvando(false);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-heading font-bold text-foreground">{editavel.criancaNome}</h2>
              <Badge variant="outline" className={cn(
                "text-xs",
                editavel.status === "rascunho" && "bg-status-warning/15 text-status-warning border-status-warning/30",
                editavel.status === "finalizada" && "bg-primary/15 text-primary border-primary/30",
                editavel.status === "assinada" && "bg-status-success/15 text-status-success border-status-success/30",
                editavel.status === "cancelada" && "bg-muted text-muted-foreground",
                editavel.status === "falta" && "bg-destructive/15 text-destructive border-destructive/30",
              )}>
                {bloqueada && <Lock className="h-3 w-3 mr-1" />}
                {editavel.status === "rascunho" && "Rascunho"}
                {editavel.status === "finalizada" && "Finalizada"}
                {editavel.status === "assinada" && "Assinada"}
                {editavel.status === "cancelada" && "Cancelada"}
                {editavel.status === "falta" && "Falta"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(editavel.data).toLocaleDateString("pt-BR")} • {editavel.horaInicio} - {editavel.horaFim} • {editavel.profissionalNome}
            </p>
            {bloqueada && editavel.assinadaEm && (
              <p className="text-xs text-status-success mt-1 flex items-center gap-1">
                <FileSignature className="h-3 w-3" />
                Assinada em {new Date(editavel.assinadaEm).toLocaleString("pt-BR")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={() => exportarSessaoPdf(editavel)} className="gap-2">
              <Download className="h-4 w-4" /> Exportar PDF
            </Button>
            {!bloqueada && (
              <>
                <Button variant="outline" onClick={salvar} disabled={salvando} className="gap-2">
                  <Save className="h-4 w-4" /> Salvar
                </Button>
                {editavel.status === "rascunho" && (
                  <Button onClick={finalizar} disabled={salvando} className="gap-2">
                    <FileText className="h-4 w-4" /> Finalizar
                  </Button>
                )}
                {editavel.status === "finalizada" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={salvando} className="gap-2">
                        <FileSignature className="h-4 w-4" /> Assinar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Assinar sessão digitalmente?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Após assinada, a sessão não poderá mais ser editada nem excluída.
                          Será gerado um hash SHA-256 imutável e registrado no log de auditoria.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={assinar}>Confirmar assinatura</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block">Humor da criança</Label>
            <div className="flex flex-wrap gap-1.5">
              {HUMORES.map((h) => (
                <button
                  key={h.valor}
                  disabled={bloqueada}
                  onClick={() => setEditavel({ ...editavel, humor: h.valor })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm border transition-all flex items-center gap-1.5 disabled:opacity-60",
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

      <fieldset disabled={bloqueada} className="contents">
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
              <Label className="text-sm font-medium mb-1.5 block">Nota geral da sessão</Label>
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
          <AnexosCrianca
            criancaId={editavel.criancaId}
            pasta={`sessoes/${editavel.id}`}
            titulo="Anexos da sessão"
            descricao="Documentos, fotos ou registros pertinentes a esta sessão. Máx. 20MB por arquivo."
            bloqueado={bloqueada}
          />
        </TabsContent>
      </Tabs>
      </fieldset>
    </div>
  );
}
