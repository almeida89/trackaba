import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, FileCheck2, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TipoAvaliacao = "vbmapp" | "ablls" | "peak" | "denver" | "adir" | "ados" | "outra";
type StatusAvaliacao = "agendada" | "em_andamento" | "concluida" | "cancelada";

interface AvaliacaoBanco {
  id: string;
  data_avaliacao: string;
  tipo: TipoAvaliacao;
  status: StatusAvaliacao;
  avaliador_nome: string;
  observacoes: string | null;
  criado_em: string;
}

const TIPOS: { valor: TipoAvaliacao; rotulo: string }[] = [
  { valor: "vbmapp", rotulo: "VB-MAPP" },
  { valor: "ablls", rotulo: "ABLLS-R" },
  { valor: "peak", rotulo: "PEAK" },
  { valor: "denver", rotulo: "Denver" },
  { valor: "adir", rotulo: "ADI-R" },
  { valor: "ados", rotulo: "ADOS" },
  { valor: "outra", rotulo: "Outra" },
];

const STATUS: { valor: StatusAvaliacao; rotulo: string; cor: string }[] = [
  { valor: "agendada", rotulo: "Agendada", cor: "bg-status-info/15 text-status-info border-status-info/30" },
  { valor: "em_andamento", rotulo: "Em andamento", cor: "bg-status-warning/15 text-status-warning border-status-warning/30" },
  { valor: "concluida", rotulo: "Concluída", cor: "bg-status-success/15 text-status-success border-status-success/30" },
  { valor: "cancelada", rotulo: "Cancelada", cor: "bg-muted text-muted-foreground border-border" },
];

const rotuloTipo = (t: TipoAvaliacao) => TIPOS.find((x) => x.valor === t)?.rotulo ?? t;
const metaStatus = (s: StatusAvaliacao) => STATUS.find((x) => x.valor === s) ?? STATUS[0];

const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

interface Props {
  criancaId: string;
}

export function AvaliacoesCrianca({ criancaId }: Props) {
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({
    data_avaliacao: new Date().toISOString().slice(0, 10),
    tipo: "vbmapp" as TipoAvaliacao,
    avaliador_nome: "",
    status: "agendada" as StatusAvaliacao,
    observacoes: "",
  });

  const queryKey = ["avaliacoes-crianca", criancaId];

  const { data: avaliacoes = [], isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<AvaliacaoBanco[]> => {
      const { data, error } = await supabase
        .from("avaliacoes")
        .select("id,data_avaliacao,tipo,status,avaliador_nome,observacoes,criado_em")
        .eq("crianca_id", criancaId)
        .order("data_avaliacao", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AvaliacaoBanco[];
    },
  });

  const resetar = () =>
    setForm({
      data_avaliacao: new Date().toISOString().slice(0, 10),
      tipo: "vbmapp",
      avaliador_nome: "",
      status: "agendada",
      observacoes: "",
    });

  const mutCriar = useMutation({
    mutationFn: async () => {
      if (!form.avaliador_nome.trim()) throw new Error("Informe o profissional responsável");
      const { error } = await supabase.from("avaliacoes").insert({
        crianca_id: criancaId,
        data_avaliacao: form.data_avaliacao,
        tipo: form.tipo,
        status: form.status,
        avaliador_nome: form.avaliador_nome.trim(),
        observacoes: form.observacoes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Avaliação criada");
      setAberto(false);
      resetar();
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error("Erro ao criar: " + e.message),
  });

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg font-heading">Avaliações</CardTitle>
          <CardDescription>Histórico de avaliações clínicas e instrumentos aplicados.</CardDescription>
        </div>
        <Button size="sm" onClick={() => setAberto(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Nova Avaliação
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : avaliacoes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <FileCheck2 className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Nenhuma avaliação registrada</p>
            <p className="text-xs text-muted-foreground mt-1">
              Clique em "Nova Avaliação" para registrar a primeira.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avaliacoes.map((a) => {
                  const m = metaStatus(a.status);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm">
                        <span className="inline-flex items-center gap-1.5 text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatarData(a.data_avaliacao)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {rotuloTipo(a.tipo)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="inline-flex items-center gap-1.5 text-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {a.avaliador_nome}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border", m.cor)}>
                          {m.rotulo}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog
        open={aberto}
        onOpenChange={(v) => {
          setAberto(v);
          if (!v) resetar();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Avaliação</DialogTitle>
            <DialogDescription>Preencha os dados da avaliação clínica.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={form.data_avaliacao}
                  onChange={(e) => setForm((f) => ({ ...f, data_avaliacao: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo *</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as TipoAvaliacao }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t.valor} value={t.valor}>
                        {t.rotulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prof">Profissional *</Label>
              <Input
                id="prof"
                placeholder="Nome do(a) avaliador(a)"
                value={form.avaliador_nome}
                onChange={(e) => setForm((f) => ({ ...f, avaliador_nome: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as StatusAvaliacao }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS.map((s) => (
                    <SelectItem key={s.valor} value={s.valor}>
                      {s.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                rows={3}
                placeholder="Notas adicionais (opcional)"
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)} disabled={mutCriar.isPending}>
              Cancelar
            </Button>
            <Button onClick={() => mutCriar.mutate()} disabled={mutCriar.isPending}>
              {mutCriar.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
