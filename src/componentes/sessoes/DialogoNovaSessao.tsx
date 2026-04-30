import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sessao } from "./tiposSessoes";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: (entrada: {
    criancaId: string;
    criancaNome: string;
    terapeutaId?: string | null;
    terapeutaNome: string;
    data: string;
    horaInicio: string;
    horaFim: string;
    tipo: Sessao["tipo"];
    local: Sessao["local"];
    sala?: string;
  }) => Promise<void> | void;
  criancaPreSelecionadaId?: string;
  criancaPreSelecionadaNome?: string;
}

export function DialogoNovaSessao({
  aberto,
  aoFechar,
  aoCriar,
  criancaPreSelecionadaId,
  criancaPreSelecionadaNome,
}: Props) {
  const [criancas, setCriancas] = useState<{ id: string; nome: string }[]>([]);
  const [funcionarios, setFuncionarios] = useState<{ id: string; nome: string }[]>([]);
  const [criancaId, setCriancaId] = useState(criancaPreSelecionadaId ?? "");
  const [funcionarioId, setFuncionarioId] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("09:50");
  const [tipo, setTipo] = useState<Sessao["tipo"]>("ABA");
  const [local, setLocal] = useState<Sessao["local"]>("clinica");
  const [sala, setSala] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    (async () => {
      const [{ data: cs }, { data: fs }] = await Promise.all([
        supabase.from("criancas").select("id, nome").eq("ativo", true).order("nome"),
        supabase.from("funcionarios").select("id, nome_completo").eq("ativo", true).order("nome_completo"),
      ]);
      setCriancas((cs ?? []).map((c: any) => ({ id: c.id, nome: c.nome })));
      setFuncionarios((fs ?? []).map((f: any) => ({ id: f.id, nome: f.nome_completo })));
      if (criancaPreSelecionadaId) setCriancaId(criancaPreSelecionadaId);
      else if (cs && cs[0]) setCriancaId((cs[0] as any).id);
      if (fs && fs[0]) setFuncionarioId((fs[0] as any).id);
    })();
  }, [aberto, criancaPreSelecionadaId]);

  const criar = async () => {
    if (!criancaId) return toast.error("Selecione uma criança");
    if (!funcionarioId) return toast.error("Selecione um profissional");
    const crianca = criancas.find((c) => c.id === criancaId);
    const prof = funcionarios.find((f) => f.id === funcionarioId);
    if (!crianca || !prof) return;
    setSalvando(true);
    await aoCriar({
      criancaId,
      criancaNome: criancaPreSelecionadaNome ?? crianca.nome,
      terapeutaId: null,
      terapeutaNome: prof.nome,
      data,
      horaInicio,
      horaFim,
      tipo,
      local,
      sala: sala || undefined,
    });
    setSalvando(false);
    aoFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && aoFechar()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova sessão</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {!criancaPreSelecionadaId && (
            <div className="md:col-span-2">
              <Label>Criança</Label>
              <Select value={criancaId} onValueChange={setCriancaId}>
                <SelectTrigger><SelectValue placeholder="Selecionar criança" /></SelectTrigger>
                <SelectContent>
                  {criancas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="md:col-span-2">
            <Label>Profissional</Label>
            <Select value={funcionarioId} onValueChange={setFuncionarioId}>
              <SelectTrigger><SelectValue placeholder="Selecionar profissional" /></SelectTrigger>
              <SelectContent>
                {funcionarios.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v: Sessao["tipo"]) => setTipo(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ABA">ABA</SelectItem>
                <SelectItem value="Fono">Fonoaudiologia</SelectItem>
                <SelectItem value="TO">Terapia Ocupacional</SelectItem>
                <SelectItem value="Psico">Psicologia</SelectItem>
                <SelectItem value="Psicopedagogia">Psicopedagogia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Início</Label>
            <Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
          </div>
          <div>
            <Label>Fim</Label>
            <Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
          </div>
          <div>
            <Label>Local</Label>
            <Select value={local} onValueChange={(v: Sessao["local"]) => setLocal(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="clinica">Clínica</SelectItem>
                <SelectItem value="domiciliar">Domiciliar</SelectItem>
                <SelectItem value="escolar">Escolar</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Sala</Label>
            <Input placeholder="Ex.: Sala 2" value={sala} onChange={(e) => setSala(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>Cancelar</Button>
          <Button onClick={criar} disabled={salvando}>
            {salvando ? "Criando..." : "Criar sessão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
