import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CRIANCAS_DISPONIVEIS, PROFISSIONAIS_DISPONIVEIS } from "./dadosSessoes";
import { Sessao } from "./tiposSessoes";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: (s: Sessao) => void;
}

export function DialogoNovaSessao({ aberto, aoFechar, aoCriar }: Props) {
  const [criancaId, setCriancaId] = useState("1");
  const [profissionalId, setProfissionalId] = useState("p1");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("09:50");
  const [tipo, setTipo] = useState<Sessao["tipo"]>("ABA");
  const [local, setLocal] = useState<Sessao["local"]>("clinica");
  const [sala, setSala] = useState("");

  const criar = () => {
    const crianca = CRIANCAS_DISPONIVEIS.find((c) => c.id === criancaId)!;
    const prof = PROFISSIONAIS_DISPONIVEIS.find((p) => p.id === profissionalId)!;
    const [hi, mi] = horaInicio.split(":").map(Number);
    const [hf, mf] = horaFim.split(":").map(Number);
    const duracaoMin = hf * 60 + mf - (hi * 60 + mi);
    aoCriar({
      id: crypto.randomUUID(),
      criancaId,
      criancaNome: crianca.nome,
      profissionalId,
      profissionalNome: prof.nome,
      data,
      horaInicio,
      horaFim,
      duracaoMin,
      tipo,
      local,
      sala: sala || undefined,
      status: "agendada",
      registros: [],
      narrativaAbc: [],
      reforcadores: [],
      anexos: [],
    });
    aoFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && aoFechar()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova sessão</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Label>Criança</Label>
            <Select value={criancaId} onValueChange={setCriancaId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CRIANCAS_DISPONIVEIS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Profissional</Label>
            <Select value={profissionalId} onValueChange={setProfissionalId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROFISSIONAIS_DISPONIVEIS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
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
          <Button onClick={criar}>Criar sessão</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
