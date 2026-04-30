import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EstatisticasPainel {
  criancas_ativas: number;
  criancas_novas_mes: number;
  sessoes_hoje: number;
  sessoes_concluidas_hoje: number;
  avaliacoes_pendentes: number;
  avaliacoes_urgentes: number;
  agendamentos_semana: number;
  agendamentos_confirmados: number;
}

export interface SerieMensal {
  mes: string;
  sessoes: number;
  avaliacoes: number;
}

export interface DistribuicaoNivel {
  nome: string;
  valor: number;
}

export interface AtividadeRecente {
  id: string;
  texto: string;
  hora: string;
  tipo: string;
}

const NOMES_MES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const NOMES_NIVEL: Record<string, string> = {
  linha_base: "Linha Base",
  ajuda_total: "Ajuda Total",
  ajuda_parcial: "Ajuda Parcial",
  ajuda_leve: "Ajuda Leve",
  ajuda_gestual: "Ajuda Gestual",
  independente: "Independente",
};

const NOMES_ACAO: Record<string, string> = {
  criar: "Criou",
  editar: "Atualizou",
  excluir: "Removeu",
  visualizar: "Visualizou",
  exportar: "Exportou",
};

const NOMES_ENTIDADE: Record<string, string> = {
  criancas: "criança",
  sessoes: "sessão",
  programas: "programa",
  avaliacoes: "avaliação",
  agendamentos: "agendamento",
  funcionarios: "funcionário",
  familia_membros: "membro de família",
  acessos_escola: "acesso da escola",
  "auth.users": "usuário",
};

function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Agora";
  if (min < 60) return `Há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Há ${horas}h`;
  const dias = Math.floor(horas / 24);
  return `Há ${dias} dia${dias > 1 ? "s" : ""}`;
}

export function useEstatisticasPainel() {
  return useQuery({
    queryKey: ["painel", "estatisticas"],
    queryFn: async (): Promise<EstatisticasPainel> => {
      const { data, error } = await supabase.rpc("dashboard_estatisticas" as never);
      if (error) throw error;
      return data as unknown as EstatisticasPainel;
    },
    staleTime: 60_000,
  });
}

export function useSerieMensalPainel() {
  return useQuery({
    queryKey: ["painel", "serie-mensal"],
    queryFn: async (): Promise<SerieMensal[]> => {
      const { data, error } = await supabase.rpc("dashboard_serie_mensal" as never);
      if (error) throw error;
      return ((data as unknown) as Array<{ mes_inicio: string; sessoes: number; avaliacoes: number }>).map((r) => {
        const d = new Date(r.mes_inicio);
        return {
          mes: NOMES_MES[d.getUTCMonth()],
          sessoes: Number(r.sessoes),
          avaliacoes: Number(r.avaliacoes),
        };
      });
    },
    staleTime: 5 * 60_000,
  });
}

export function useDistribuicaoNiveis() {
  return useQuery({
    queryKey: ["painel", "distribuicao-niveis"],
    queryFn: async (): Promise<DistribuicaoNivel[]> => {
      const { data, error } = await supabase.rpc("dashboard_distribuicao_niveis" as never);
      if (error) throw error;
      return ((data as unknown) as Array<{ nivel: string; total: number }>).map((r) => ({
        nome: NOMES_NIVEL[r.nivel] ?? r.nivel,
        valor: Number(r.total),
      }));
    },
    staleTime: 5 * 60_000,
  });
}

export function useAtividadesRecentes(limite = 8) {
  return useQuery({
    queryKey: ["painel", "atividades", limite],
    queryFn: async (): Promise<AtividadeRecente[]> => {
      const { data, error } = await supabase
        .from("logs_auditoria")
        .select("id, acao, entidade, descricao, criado_em")
        .order("criado_em", { ascending: false })
        .limit(limite);
      if (error) throw error;
      return (data ?? []).map((log) => {
        const acao = NOMES_ACAO[log.acao] ?? log.acao;
        const ent = NOMES_ENTIDADE[log.entidade] ?? log.entidade;
        return {
          id: log.id,
          texto: log.descricao || `${acao} ${ent}`,
          hora: tempoRelativo(log.criado_em),
          tipo: log.entidade,
        };
      });
    },
    staleTime: 30_000,
  });
}
