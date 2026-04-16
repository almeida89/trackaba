import { useState, useEffect, useMemo } from "react";
import { format, setHours, setMinutes, addHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Agendamento,
  TipoSessao,
  coresTipoSessao,
  salasDisponiveis,
  profissionaisMock,
  criancasMock,
  detectarConflitos,
} from "./tiposAgenda";

interface DialogoAgendamentoProps {
  aberto: boolean;
  aoFechar: () => void;
  aoSalvar: (agendamento: Agendamento) => void;
  agendamento: Agendamento | null;
  agendamentos: Agendamento[];
  horaInicial: Date | null;
}

const tiposSessao: TipoSessao[] = [
  "ABA Individual",
  "ABA Grupo",
  "Fonoaudiologia",
  "Terapia Ocupacional",
  "Psicologia",
  "Supervisão",
  "Avaliação",
];

const horasOpcoes = Array.from({ length: 14 }, (_, i) => {
  const h = i + 7;
  return [
    `${h.toString().padStart(2, "0")}:00`,
    `${h.toString().padStart(2, "0")}:30`,
  ];
}).flat();

function parseHora(str: string, data: Date): Date {
  const [h, m] = str.split(":").map(Number);
  return setMinutes(setHours(data, h), m);
}

export function DialogoAgendamento({
  aberto,
  aoFechar,
  aoSalvar,
  agendamento,
  agendamentos,
  horaInicial,
}: DialogoAgendamentoProps) {
  const [data, setData] = useState<Date>(new Date());
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim, setHoraFim] = useState("09:00");
  const [criancaId, setCriancaId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [tipo, setTipo] = useState<TipoSessao>("ABA Individual");
  const [sala, setSala] = useState(salasDisponiveis[0]);
  const [recorrenciaTipo, setRecorrenciaTipo] = useState<string>("nenhuma");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (agendamento) {
      setData(agendamento.dataInicio);
      setHoraInicio(format(agendamento.dataInicio, "HH:mm"));
      setHoraFim(format(agendamento.dataFim, "HH:mm"));
      setCriancaId(agendamento.criancaId);
      setProfissionalId(agendamento.profissionalId);
      setTipo(agendamento.tipo);
      setSala(agendamento.sala);
      setRecorrenciaTipo(agendamento.recorrencia?.tipo || "nenhuma");
      setObservacoes(agendamento.observacoes || "");
    } else if (horaInicial) {
      setData(horaInicial);
      setHoraInicio(format(horaInicial, "HH:mm"));
      setHoraFim(format(addHours(horaInicial, 1), "HH:mm"));
      setCriancaId("");
      setProfissionalId("");
      setTipo("ABA Individual");
      setSala(salasDisponiveis[0]);
      setRecorrenciaTipo("nenhuma");
      setObservacoes("");
    } else {
      setCriancaId("");
      setProfissionalId("");
      setObservacoes("");
      setRecorrenciaTipo("nenhuma");
    }
  }, [agendamento, horaInicial, aberto]);

  const conflitos = useMemo(() => {
    if (!criancaId || !profissionalId) return [];
    const dataInicio = parseHora(horaInicio, data);
    const dataFim = parseHora(horaFim, data);
    return detectarConflitos(
      {
        profissionalId,
        sala,
        dataInicio,
        dataFim,
        id: agendamento?.id,
      },
      agendamentos
    );
  }, [criancaId, profissionalId, horaInicio, horaFim, data, sala, agendamentos, agendamento]);

  const aoSubmeter = () => {
    const crianca = criancasMock.find((c) => c.id === criancaId);
    const profissional = profissionaisMock.find((p) => p.id === profissionalId);
    if (!crianca || !profissional) return;

    const dataInicio = parseHora(horaInicio, data);
    const dataFim = parseHora(horaFim, data);

    const novoAg: Agendamento = {
      id: agendamento?.id || `ag-${Date.now()}`,
      criancaId,
      criancaNome: crianca.nome,
      profissionalId,
      profissionalNome: profissional.nome,
      tipo,
      sala,
      dataInicio,
      dataFim,
      status: agendamento?.status || "pendente",
      cor: coresTipoSessao[tipo],
      observacoes: observacoes || undefined,
      recorrencia:
        recorrenciaTipo !== "nenhuma"
          ? { tipo: recorrenciaTipo as any }
          : undefined,
    };

    aoSalvar(novoAg);
  };

  const podeSubmeter = criancaId && profissionalId && horaInicio < horaFim;

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && aoFechar()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Criança */}
          <div className="space-y-1.5">
            <Label>Criança</Label>
            <Select value={criancaId} onValueChange={setCriancaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a criança" />
              </SelectTrigger>
              <SelectContent>
                {criancasMock.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Profissional */}
          <div className="space-y-1.5">
            <Label>Profissional</Label>
            <Select value={profissionalId} onValueChange={setProfissionalId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {profissionaisMock.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome} — {p.especialidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Sessão */}
          <div className="space-y-1.5">
            <Label>Tipo de Sessão</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoSessao)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposSessao.map((t) => (
                  <SelectItem key={t} value={t}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: coresTipoSessao[t] }}
                      />
                      {t}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div className="space-y-1.5">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(data, "PPP", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data}
                  onSelect={(d) => d && setData(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horários */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Início</Label>
              <Select value={horaInicio} onValueChange={setHoraInicio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {horasOpcoes.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fim</Label>
              <Select value={horaFim} onValueChange={setHoraFim}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {horasOpcoes
                    .filter((h) => h > horaInicio)
                    .map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sala */}
          <div className="space-y-1.5">
            <Label>Sala</Label>
            <Select value={sala} onValueChange={setSala}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {salasDisponiveis.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recorrência */}
          <div className="space-y-1.5">
            <Label>Recorrência</Label>
            <Select value={recorrenciaTipo} onValueChange={setRecorrenciaTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Sem recorrência</SelectItem>
                <SelectItem value="diaria">Diária</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas sobre o agendamento..."
              rows={2}
            />
          </div>

          {/* Conflitos */}
          {conflitos.length > 0 && (
            <div className="rounded-lg border border-status-warning/30 bg-status-warning/10 p-3 space-y-2">
              <div className="flex items-center gap-2 text-status-warning font-medium text-sm">
                <AlertTriangle className="h-4 w-4" />
                Conflitos Detectados
              </div>
              {conflitos.map((c, i) => (
                <p key={i} className="text-xs text-foreground">
                  • {c.mensagem}
                </p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            onClick={aoSubmeter}
            disabled={!podeSubmeter}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {agendamento ? "Salvar Alterações" : "Criar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
