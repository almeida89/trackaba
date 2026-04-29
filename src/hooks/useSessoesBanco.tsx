import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sessao, StatusSessao, HumorCrianca } from "@/componentes/sessoes/tiposSessoes";

function mapearHumor(valor: number | null): HumorCrianca | undefined {
  if (valor == null) return undefined;
  if (valor >= 5) return "otimo";
  if (valor === 4) return "bom";
  if (valor === 3) return "neutro";
  if (valor === 2) return "ansioso";
  return "irritado";
}

function calcularStatus(dataSessao: string): StatusSessao {
  const agora = Date.now();
  const dt = new Date(dataSessao).getTime();
  if (dt > agora) return "agendada";
  if (agora - dt < 60 * 60 * 1000) return "em_andamento";
  return "concluida";
}

function mapearTipo(tipo: string): Sessao["tipo"] {
  const t = tipo.toLowerCase();
  if (t.includes("fono")) return "Fono";
  if (t.includes("ocup") || t === "to") return "TO";
  if (t.includes("psicop")) return "Psicopedagogia";
  if (t.includes("psico")) return "Psico";
  return "ABA";
}

export function useSessoesBanco() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);

    const { data: sessoesData, error } = await supabase
      .from("sessoes")
      .select("*, criancas(nome)")
      .order("data_sessao", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar sessões");
      setCarregando(false);
      return;
    }

    const ids = sessoesData?.map((s) => s.id) ?? [];
    const { data: resultados } = ids.length
      ? await supabase
          .from("resultados_programa")
          .select("*, programas(nome, dominio, meta)")
          .in("sessao_id", ids)
      : { data: [] };
    const { data: abcs } = ids.length
      ? await supabase.from("registros_abc").select("*").in("sessao_id", ids)
      : { data: [] };

    const mapeadas: Sessao[] = (sessoesData ?? []).map((s) => {
      const dt = new Date(s.data_sessao);
      const horaInicio = dt.toTimeString().slice(0, 5);
      const horaFim = new Date(dt.getTime() + s.duracao_minutos * 60000)
        .toTimeString()
        .slice(0, 5);

      const registrosSessao = (resultados ?? [])
        .filter((r: any) => r.sessao_id === s.id)
        .map((r: any) => ({
          programaId: r.programa_id,
          programaNome: r.programas?.nome ?? "Programa",
          objetivo: r.programas?.meta ?? "",
          tentativas: r.tentativas,
          acertos: r.acertos,
          nivel: "AG" as const,
          observacao: r.observacao ?? undefined,
        }));

      const abcSessao = (abcs ?? [])
        .filter((a: any) => a.sessao_id === s.id)
        .map((a: any) => ({
          id: a.id,
          horario: a.horario.slice(0, 5),
          antecedente: a.antecedente,
          comportamento: a.comportamento,
          consequencia: a.consequencia,
          intensidade: (a.intensidade ?? "leve") as "leve" | "moderada" | "intensa",
        }));

      return {
        id: s.id,
        criancaId: s.crianca_id,
        criancaNome: (s as any).criancas?.nome ?? "—",
        profissionalId: s.terapeuta_id ?? "",
        profissionalNome: s.terapeuta_nome,
        data: dt.toISOString().split("T")[0],
        horaInicio,
        horaFim,
        duracaoMin: s.duracao_minutos,
        tipo: mapearTipo(s.tipo),
        local: "clinica",
        status: calcularStatus(s.data_sessao),
        humor: mapearHumor(s.humor_inicial),
        notaGeral: s.observacoes ?? undefined,
        evolucaoDiaria: s.resumo_familia ?? undefined,
        registros: registrosSessao,
        narrativaAbc: abcSessao,
        reforcadores: [],
        anexos: [],
      };
    });

    setSessoes(mapeadas);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { sessoes, carregando, recarregar: carregar };
}
