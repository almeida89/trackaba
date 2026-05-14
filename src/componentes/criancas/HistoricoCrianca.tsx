import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  History,
  ClipboardList,
  FileCheck2,
  CalendarDays,
  UserPlus,
  Pencil,
  LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  criancaId: string;
}

interface EventoTimeline {
  id: string;
  data: string;
  titulo: string;
  descricao?: string;
  icone: LucideIcon;
  cor: string;
}

const formatarDataHora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const rotuloStatusSessao: Record<string, string> = {
  rascunho: "iniciada (rascunho)",
  finalizada: "finalizada",
  assinada: "assinada",
  cancelada: "cancelada",
};

const rotuloStatusAvaliacao: Record<string, string> = {
  agendada: "agendada",
  em_andamento: "em andamento",
  concluida: "concluída",
  cancelada: "cancelada",
};

export function HistoricoCrianca({ criancaId }: Props) {
  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ["historico-crianca", criancaId],
    queryFn: async (): Promise<EventoTimeline[]> => {
      const [crianca, sessoes, avaliacoes, agendamentos] = await Promise.all([
        supabase
          .from("criancas")
          .select("criado_em,atualizado_em")
          .eq("id", criancaId)
          .maybeSingle(),
        supabase
          .from("sessoes")
          .select("id,data_sessao,status,terapeuta_nome,criado_em,assinada_em,finalizada_em")
          .eq("crianca_id", criancaId)
          .order("criado_em", { ascending: false })
          .limit(30),
        supabase
          .from("avaliacoes")
          .select("id,tipo,status,avaliador_nome,data_avaliacao,criado_em")
          .eq("crianca_id", criancaId)
          .order("criado_em", { ascending: false })
          .limit(30),
        supabase
          .from("agendamentos")
          .select("id,data_inicio,terapeuta_nome,status,criado_em")
          .eq("crianca_id", criancaId)
          .order("criado_em", { ascending: false })
          .limit(30),
      ]);

      const lista: EventoTimeline[] = [];

      if (crianca.data) {
        lista.push({
          id: `cad-${criancaId}`,
          data: crianca.data.criado_em,
          titulo: "Cadastro criado",
          descricao: "Criança adicionada ao sistema",
          icone: UserPlus,
          cor: "bg-primary/10 text-primary",
        });
        if (
          crianca.data.atualizado_em &&
          crianca.data.atualizado_em !== crianca.data.criado_em
        ) {
          lista.push({
            id: `upd-${criancaId}`,
            data: crianca.data.atualizado_em,
            titulo: "Perfil atualizado",
            descricao: "Dados cadastrais foram modificados",
            icone: Pencil,
            cor: "bg-status-info/10 text-status-info",
          });
        }
      }

      (sessoes.data ?? []).forEach((s: any) => {
        const dataRef = s.assinada_em ?? s.finalizada_em ?? s.criado_em;
        lista.push({
          id: `ses-${s.id}`,
          data: dataRef,
          titulo: `Sessão ${rotuloStatusSessao[s.status] ?? s.status}`,
          descricao: `Terapeuta: ${s.terapeuta_nome}`,
          icone: ClipboardList,
          cor:
            s.status === "assinada"
              ? "bg-status-success/10 text-status-success"
              : s.status === "cancelada"
              ? "bg-status-error/10 text-status-error"
              : "bg-status-warning/10 text-status-warning",
        });
      });

      (avaliacoes.data ?? []).forEach((a: any) => {
        lista.push({
          id: `ava-${a.id}`,
          data: a.criado_em,
          titulo: `Avaliação ${rotuloStatusAvaliacao[a.status] ?? a.status}`,
          descricao: `${(a.tipo as string).toUpperCase()} • ${a.avaliador_nome}`,
          icone: FileCheck2,
          cor: "bg-secondary/40 text-secondary-foreground",
        });
      });

      (agendamentos.data ?? []).forEach((g: any) => {
        lista.push({
          id: `agd-${g.id}`,
          data: g.criado_em,
          titulo: `Agendamento ${g.status}`,
          descricao: `${g.terapeuta_nome} • ${formatarDataHora(g.data_inicio)}`,
          icone: CalendarDays,
          cor: "bg-accent/40 text-accent-foreground",
        });
      });

      return lista
        .filter((e) => !!e.data)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, 60);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading">Histórico</CardTitle>
        <CardDescription>
          Linha do tempo das atividades recentes relacionadas a esta criança.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : eventos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <History className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Sem registros ainda</p>
            <p className="text-xs text-muted-foreground mt-1">
              As atividades aparecerão aqui conforme forem registradas.
            </p>
          </div>
        ) : (
          <ol className="relative border-l border-border ml-3 space-y-5">
            {eventos.map((ev) => {
              const Icone = ev.icone;
              return (
                <li key={ev.id} className="ml-6">
                  <span
                    className={cn(
                      "absolute -left-[14px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background",
                      ev.cor
                    )}
                  >
                    <Icone className="h-3.5 w-3.5" />
                  </span>
                  <div className="rounded-lg border border-border bg-card px-4 py-3">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{ev.titulo}</p>
                      <time className="text-xs text-muted-foreground font-mono">
                        {formatarDataHora(ev.data)}
                      </time>
                    </div>
                    {ev.descricao && (
                      <p className="text-xs text-muted-foreground mt-1">{ev.descricao}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
