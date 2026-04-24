import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Avaliacao, DominioAvaliacao, ProtocoloAvaliacao, StatusAvaliacao } from "./tiposAvaliacoes";
import { dominiosPorProtocolo, protocolosDisponiveis, checklistAnamnese } from "./dadosAvaliacoes";

interface Props {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  avaliacao?: Avaliacao | null;
  onSalvar: (av: Avaliacao) => void;
  criancas: { id: string; nome: string }[];
}

const vazia = (): Partial<Avaliacao> => ({
  protocolo: "VB-MAPP",
  status: "rascunho",
  dataInicio: new Date().toISOString().slice(0, 10),
  responsavel: "",
  cargoResponsavel: "",
  titulo: "",
  resumoClinico: "",
  proximosPassos: "",
  dominios: [],
});

export function DialogoAvaliacao({ aberto, onOpenChange, avaliacao, onSalvar, criancas }: Props) {
  const [form, setForm] = useState<Partial<Avaliacao>>(vazia());
  const [respostasAnamnese, setRespostasAnamnese] = useState<Record<string, string>>({});

  useEffect(() => {
    if (avaliacao) {
      setForm(avaliacao);
    } else {
      setForm(vazia());
    }
    setRespostasAnamnese({});
  }, [avaliacao, aberto]);

  const protocolo = form.protocolo as ProtocoloAvaliacao;

  const aoMudarProtocolo = (p: ProtocoloAvaliacao) => {
    const dominios: DominioAvaliacao[] = dominiosPorProtocolo[p].map((d, i) => ({
      id: `d-${i}`,
      nome: d.nome,
      pontuacao: 0,
      pontuacaoMaxima: d.pontuacaoMaxima,
    }));
    setForm((f) => ({ ...f, protocolo: p, dominios, titulo: f.titulo || `${p} — Nova avaliação` }));
  };

  const atualizarDominio = (id: string, valor: number) => {
    setForm((f) => ({
      ...f,
      dominios: (f.dominios || []).map((d) =>
        d.id === id ? { ...d, pontuacao: Math.max(0, Math.min(valor, d.pontuacaoMaxima)) } : d,
      ),
    }));
  };

  const salvar = () => {
    if (!form.criancaId || !form.responsavel || !form.titulo) {
      toast.error("Preencha criança, responsável e título");
      return;
    }
    const dominios = form.dominios || [];
    const total = dominios.reduce((s, d) => s + d.pontuacao, 0);
    const max = dominios.reduce((s, d) => s + d.pontuacaoMaxima, 0);
    const crianca = criancas.find((c) => c.id === form.criancaId);
    const av: Avaliacao = {
      id: avaliacao?.id || `av-${Date.now()}`,
      criancaId: form.criancaId!,
      criancaNome: crianca?.nome || form.criancaNome || "—",
      protocolo: form.protocolo as ProtocoloAvaliacao,
      titulo: form.titulo!,
      status: form.status as StatusAvaliacao,
      dataInicio: form.dataInicio!,
      dataConclusao: form.status === "concluida" ? new Date().toISOString().slice(0, 10) : form.dataConclusao,
      responsavel: form.responsavel!,
      cargoResponsavel: form.cargoResponsavel || "",
      dominios,
      pontuacaoTotal: total,
      pontuacaoMaxima: max,
      resumoClinico: form.resumoClinico,
      proximosPassos: form.proximosPassos,
      proximaReavaliacao: form.proximaReavaliacao,
    };
    onSalvar(av);
    toast.success(avaliacao ? "Avaliação atualizada" : "Avaliação criada");
    onOpenChange(false);
  };

  const totalAtual = (form.dominios || []).reduce((s, d) => s + d.pontuacao, 0);
  const maxAtual = (form.dominios || []).reduce((s, d) => s + d.pontuacaoMaxima, 0);
  const percentual = maxAtual ? Math.round((totalAtual / maxAtual) * 100) : 0;

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{avaliacao ? "Editar avaliação" : "Nova avaliação"}</DialogTitle>
          <DialogDescription>
            Aplique protocolos clínicos padronizados e registre o desempenho por domínio.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="dominios">Domínios</TabsTrigger>
            <TabsTrigger value="anamnese" disabled={protocolo !== "Anamnese"}>
              Anamnese
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Criança *</Label>
                <Select value={form.criancaId} onValueChange={(v) => setForm((f) => ({ ...f, criancaId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {criancas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Protocolo *</Label>
                <Select value={form.protocolo} onValueChange={(v) => aoMudarProtocolo(v as ProtocoloAvaliacao)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {protocolosDisponiveis.map((p) => (
                      <SelectItem key={p.valor} value={p.valor}>
                        {p.valor} — {p.faixaEtaria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input value={form.titulo || ""} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as StatusAvaliacao }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                    <SelectItem value="revisao">Em revisão</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Data início</Label>
                <Input type="date" value={form.dataInicio || ""} onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Próxima reavaliação</Label>
                <Input type="date" value={form.proximaReavaliacao || ""} onChange={(e) => setForm((f) => ({ ...f, proximaReavaliacao: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Responsável técnico *</Label>
                <Input value={form.responsavel || ""} onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Cargo</Label>
                <Input value={form.cargoResponsavel || ""} onChange={(e) => setForm((f) => ({ ...f, cargoResponsavel: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Resumo clínico</Label>
              <Textarea rows={3} value={form.resumoClinico || ""} onChange={(e) => setForm((f) => ({ ...f, resumoClinico: e.target.value }))} />
            </div>

            <div className="space-y-1.5">
              <Label>Próximos passos</Label>
              <Textarea rows={2} value={form.proximosPassos || ""} onChange={(e) => setForm((f) => ({ ...f, proximosPassos: e.target.value }))} />
            </div>
          </TabsContent>

          <TabsContent value="dominios" className="space-y-4 pt-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Pontuação total</span>
                <span className="font-mono">{totalAtual} / {maxAtual} ({percentual}%)</span>
              </div>
              <Progress value={percentual} />
            </div>
            <div className="space-y-3">
              {(form.dominios || []).map((d) => {
                const pct = d.pontuacaoMaxima ? Math.round((d.pontuacao / d.pontuacaoMaxima) * 100) : 0;
                return (
                  <div key={d.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{d.nome}</Label>
                      <span className="text-xs font-mono text-muted-foreground">{d.pontuacao} / {d.pontuacaoMaxima}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={0}
                        max={d.pontuacaoMaxima}
                        value={d.pontuacao}
                        onChange={(e) => atualizarDominio(d.id, Number(e.target.value))}
                        className="w-24"
                      />
                      <Progress value={pct} className="flex-1" />
                    </div>
                  </div>
                );
              })}
              {(form.dominios || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Selecione um protocolo para carregar os domínios.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="anamnese" className="space-y-3 pt-4">
            {checklistAnamnese.map((item) => (
              <div key={item.id} className="space-y-1.5">
                <Label className="text-xs uppercase text-muted-foreground">{item.categoria}</Label>
                <p className="text-sm font-medium">{item.pergunta}</p>
                <Textarea
                  rows={2}
                  value={respostasAnamnese[item.id] || ""}
                  onChange={(e) => setRespostasAnamnese((r) => ({ ...r, [item.id]: e.target.value }))}
                  placeholder="Resposta do responsável..."
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar}>Salvar avaliação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
