import { useState, useCallback, useMemo, useRef } from "react";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  setHours,
  setMinutes,
  differenceInMinutes,
  addWeeks,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Agendamento,
  VistaAgenda,
  coresStatusAgendamento,
} from "./tiposAgenda";
import { agendamentosSemente } from "./dadosSemente";
import { DialogoAgendamento } from "./DialogoAgendamento";
import { DetalhesAgendamento } from "./DetalhesAgendamento";

const HORA_INICIO = 7;
const HORA_FIM = 20;
const ALTURA_HORA = 64; // px por hora

export function GradeAgenda() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(agendamentosSemente);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [vista, setVista] = useState<VistaAgenda>("semana");
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [detalhesAberto, setDetalhesAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);
  const [horaPreSelecionada, setHoraPreSelecionada] = useState<Date | null>(null);

  // Drag state
  const [arrastando, setArrastando] = useState<string | null>(null);
  const gradeRef = useRef<HTMLDivElement>(null);

  const inicioSemana = startOfWeek(dataSelecionada, { weekStartsOn: 1 });

  const diasVisiveis = useMemo(() => {
    if (vista === "dia") return [dataSelecionada];
    // semana
    return Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));
  }, [vista, dataSelecionada, inicioSemana]);

  const horarios = useMemo(() => {
    const h: number[] = [];
    for (let i = HORA_INICIO; i <= HORA_FIM; i++) h.push(i);
    return h;
  }, []);

  const navegarAnterior = () => {
    if (vista === "semana") setDataSelecionada((d) => subWeeks(d, 1));
    else setDataSelecionada((d) => addDays(d, -1));
  };
  const navegarProximo = () => {
    if (vista === "semana") setDataSelecionada((d) => addWeeks(d, 1));
    else setDataSelecionada((d) => addDays(d, 1));
  };
  const irParaHoje = () => setDataSelecionada(new Date());

  const obterAgendamentosDoDia = useCallback(
    (dia: Date) =>
      agendamentos.filter(
        (ag) => isSameDay(ag.dataInicio, dia) && ag.status !== "cancelado"
      ),
    [agendamentos]
  );

  const aoClicarSlot = (dia: Date, hora: number) => {
    setHoraPreSelecionada(setMinutes(setHours(dia, hora), 0));
    setAgendamentoSelecionado(null);
    setDialogoAberto(true);
  };

  const aoClicarAgendamento = (ag: Agendamento, e: React.MouseEvent) => {
    e.stopPropagation();
    setAgendamentoSelecionado(ag);
    setDetalhesAberto(true);
  };

  const aoSalvarAgendamento = (ag: Agendamento) => {
    setAgendamentos((prev) => {
      const existe = prev.find((a) => a.id === ag.id);
      if (existe) return prev.map((a) => (a.id === ag.id ? ag : a));
      return [...prev, ag];
    });
    setDialogoAberto(false);
  };

  const aoEditarAgendamento = () => {
    setDetalhesAberto(false);
    setDialogoAberto(true);
  };

  const aoCancelarAgendamento = (id: string) => {
    setAgendamentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelado" as const } : a))
    );
    setDetalhesAberto(false);
  };

  // Drag & drop
  const aoIniciarArraste = (id: string, e: React.DragEvent) => {
    setArrastando(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const aoSoltarNaGrade = (dia: Date, hora: number, e: React.DragEvent) => {
    e.preventDefault();
    const idAg = e.dataTransfer.getData("text/plain");
    if (!idAg) return;

    setAgendamentos((prev) =>
      prev.map((ag) => {
        if (ag.id !== idAg) return ag;
        const duracao = differenceInMinutes(ag.dataFim, ag.dataInicio);
        const novaInicio = setMinutes(setHours(dia, hora), 0);
        const novaFim = new Date(novaInicio.getTime() + duracao * 60000);
        return { ...ag, dataInicio: novaInicio, dataFim: novaFim };
      })
    );
    setArrastando(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie agendamentos, salas e horários
          </p>
        </div>
        <Button
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            setAgendamentoSelecionado(null);
            setHoraPreSelecionada(null);
            setDialogoAberto(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navegarAnterior}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={irParaHoje}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={navegarProximo}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-heading font-semibold text-foreground ml-2">
            {vista === "semana"
              ? `${format(diasVisiveis[0], "dd MMM", { locale: ptBR })} — ${format(
                  diasVisiveis[diasVisiveis.length - 1],
                  "dd MMM yyyy",
                  { locale: ptBR }
                )}`
              : format(dataSelecionada, "EEEE, dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          {(["dia", "semana"] as VistaAgenda[]).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                vista === v
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Day headers */}
        <div
          className="grid border-b border-border"
          style={{
            gridTemplateColumns: `60px repeat(${diasVisiveis.length}, 1fr)`,
          }}
        >
          <div className="p-2 text-xs text-muted-foreground" />
          {diasVisiveis.map((dia) => (
            <div
              key={dia.toISOString()}
              className={cn(
                "p-2 text-center border-l border-border",
                isSameDay(dia, new Date()) && "bg-primary/5"
              )}
            >
              <div className="text-xs text-muted-foreground uppercase">
                {format(dia, "EEE", { locale: ptBR })}
              </div>
              <div
                className={cn(
                  "text-lg font-heading font-bold mt-0.5",
                  isSameDay(dia, new Date())
                    ? "text-primary"
                    : "text-foreground"
                )}
              >
                {format(dia, "dd")}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div
          ref={gradeRef}
          className="relative overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 320px)" }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `60px repeat(${diasVisiveis.length}, 1fr)`,
            }}
          >
            {/* Hour labels + row slots */}
            {horarios.map((hora) => (
              <div key={hora} className="contents">
                {/* Hour label */}
                <div
                  className="text-xs text-muted-foreground text-right pr-2 pt-1 border-t border-border"
                  style={{ height: ALTURA_HORA }}
                >
                  {`${hora.toString().padStart(2, "0")}:00`}
                </div>

                {/* Day cells */}
                {diasVisiveis.map((dia) => (
                  <div
                    key={`${dia.toISOString()}-${hora}`}
                    className={cn(
                      "relative border-t border-l border-border cursor-pointer hover:bg-muted/30 transition-colors",
                      isSameDay(dia, new Date()) && "bg-primary/[0.02]"
                    )}
                    style={{ height: ALTURA_HORA }}
                    onClick={() => aoClicarSlot(dia, hora)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("bg-primary/10");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("bg-primary/10");
                    }}
                    onDrop={(e) => {
                      e.currentTarget.classList.remove("bg-primary/10");
                      aoSoltarNaGrade(dia, hora, e);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Appointment overlays */}
          {diasVisiveis.map((dia, diaIdx) =>
            obterAgendamentosDoDia(dia).map((ag) => {
              const inicioMin =
                (ag.dataInicio.getHours() - HORA_INICIO) * 60 +
                ag.dataInicio.getMinutes();
              const duracao = differenceInMinutes(ag.dataFim, ag.dataInicio);
              const top = (inicioMin / 60) * ALTURA_HORA;
              const height = (duracao / 60) * ALTURA_HORA;
              const colWidth = `calc((100% - 60px) / ${diasVisiveis.length})`;
              const left = `calc(60px + ${diaIdx} * ${colWidth} + 2px)`;
              const width = `calc(${colWidth} - 4px)`;

              return (
                <div
                  key={ag.id}
                  draggable
                  onDragStart={(e) => aoIniciarArraste(ag.id, e)}
                  onClick={(e) => aoClicarAgendamento(ag, e)}
                  className={cn(
                    "absolute rounded-lg px-2 py-1.5 cursor-grab active:cursor-grabbing overflow-hidden transition-shadow hover:shadow-md border-l-[3px] z-10",
                    arrastando === ag.id && "opacity-50"
                  )}
                  style={{
                    top,
                    height: Math.max(height, 28),
                    left,
                    width,
                    backgroundColor: `${ag.cor}15`,
                    borderLeftColor: ag.cor,
                  }}
                >
                  <div className="flex items-start gap-1">
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: ag.cor }}
                      >
                        {ag.criancaNome}
                      </p>
                      {height > 40 && (
                        <>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {ag.tipo}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              {format(ag.dataInicio, "HH:mm")} —{" "}
                              {format(ag.dataFim, "HH:mm")}
                            </span>
                          </div>
                        </>
                      )}
                      {height > 70 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground truncate">
                            {ag.sala}
                          </span>
                        </div>
                      )}
                    </div>
                    {ag.recorrencia && (
                      <Repeat className="h-3 w-3 shrink-0 text-muted-foreground mt-0.5" />
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Current time line */}
          {diasVisiveis.some((d) => isSameDay(d, new Date())) && (() => {
            const agora = new Date();
            const minDesdeInicio = (agora.getHours() - HORA_INICIO) * 60 + agora.getMinutes();
            if (minDesdeInicio < 0) return null;
            const top = (minDesdeInicio / 60) * ALTURA_HORA;
            const diaIdx = diasVisiveis.findIndex((d) => isSameDay(d, agora));
            if (diaIdx < 0) return null;
            const colWidth = `calc((100% - 60px) / ${diasVisiveis.length})`;

            return (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  top,
                  left: `calc(60px + ${diaIdx} * ${colWidth})`,
                  width: colWidth,
                }}
              >
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive -ml-1" />
                  <div className="flex-1 h-[2px] bg-destructive" />
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {Object.entries(
          agendamentos.reduce<Record<string, string>>((acc, ag) => {
            acc[ag.tipo] = ag.cor;
            return acc;
          }, {})
        ).map(([tipo, cor]) => (
          <div key={tipo} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: cor }}
            />
            <span>{tipo}</span>
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <DialogoAgendamento
        aberto={dialogoAberto}
        aoFechar={() => setDialogoAberto(false)}
        aoSalvar={aoSalvarAgendamento}
        agendamento={agendamentoSelecionado}
        agendamentos={agendamentos}
        horaInicial={horaPreSelecionada}
      />

      <DetalhesAgendamento
        aberto={detalhesAberto}
        aoFechar={() => setDetalhesAberto(false)}
        agendamento={agendamentoSelecionado}
        aoEditar={aoEditarAgendamento}
        aoCancelar={aoCancelarAgendamento}
      />
    </div>
  );
}
