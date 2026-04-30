import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sessao,
  StatusSessao,
  HumorCrianca,
  ReforcadorUsado,
  NivelDesempenho,
} from "@/componentes/sessoes/tiposSessoes";

function mapearHumor(valor: number | null): HumorCrianca | undefined {
  if (valor == null) return undefined;
  if (valor >= 5) return "otimo";
  if (valor === 4) return "bom";
  if (valor === 3) return "neutro";
  if (valor === 2) return "ansioso";
  return "irritado";
}

function humorParaNumero(h?: HumorCrianca): number | null {
  switch (h) {
    case "otimo": return 5;
    case "bom": return 4;
    case "neutro": return 3;
    case "ansioso": return 2;
    case "irritado": return 1;
    case "sonolento": return 2;
    default: return null;
  }
}

function mapearTipo(tipo: string): Sessao["tipo"] {
  const t = tipo.toLowerCase();
  if (t.includes("fono")) return "Fono";
  if (t.includes("ocup") || t === "to") return "TO";
  if (t.includes("psicop")) return "Psicopedagogia";
  if (t.includes("psico")) return "Psico";
  return "ABA";
}

function tipoParaBanco(tipo: Sessao["tipo"]): "individual" | "grupo" | "domiciliar" | "escolar" | "online" | "supervisao" {
  // tabela usa enum tipo_sessao; manter "individual" para tipos clínicos
  return "individual";
}

function mapearLocal(v: string | null): Sessao["local"] {
  if (v === "domiciliar" || v === "escolar" || v === "online" || v === "clinica") return v;
  return "clinica";
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
          .select("*")
          .in("sessao_id", ids)
      : { data: [] };
    const { data: abcs } = ids.length
      ? await supabase.from("registros_abc").select("*").in("sessao_id", ids)
      : { data: [] };

    const mapeadas: Sessao[] = (sessoesData ?? []).map((s: any) => {
      const dt = new Date(s.data_sessao);
      const horaInicio = dt.toTimeString().slice(0, 5);
      const horaFim = new Date(dt.getTime() + s.duracao_minutos * 60000)
        .toTimeString()
        .slice(0, 5);

      const registrosSessao = (resultados ?? [])
        .filter((r: any) => r.sessao_id === s.id)
        .map((r: any) => ({
          programaId: r.id,
          programaNome: r.programa_nome ?? "Programa",
          objetivo: r.objetivo ?? "",
          tentativas: r.tentativas,
          acertos: r.acertos,
          nivel: (r.nivel ?? "AG") as NivelDesempenho,
          observacao: r.observacao ?? undefined,
        }));

      const abcSessao = (abcs ?? [])
        .filter((a: any) => a.sessao_id === s.id)
        .map((a: any) => ({
          id: a.id,
          horario: (a.horario ?? "").toString().slice(0, 5),
          antecedente: a.antecedente,
          comportamento: a.comportamento,
          consequencia: a.consequencia,
          intensidade: (a.intensidade ?? "leve") as "leve" | "moderada" | "intensa",
        }));

      return {
        id: s.id,
        criancaId: s.crianca_id,
        criancaNome: s.criancas?.nome ?? "—",
        profissionalId: s.terapeuta_id ?? "",
        profissionalNome: s.terapeuta_nome,
        data: dt.toISOString().split("T")[0],
        horaInicio,
        horaFim,
        duracaoMin: s.duracao_minutos,
        tipo: mapearTipo(s.tipo),
        local: mapearLocal(s.local),
        sala: s.sala ?? undefined,
        status: (s.status ?? "rascunho") as StatusSessao,
        humor: mapearHumor(s.humor_inicial),
        notaGeral: s.observacoes ?? undefined,
        notaIncidente: s.nota_incidente ?? undefined,
        evolucaoDiaria: s.evolucao_diaria ?? s.resumo_familia ?? undefined,
        registros: registrosSessao,
        narrativaAbc: abcSessao,
        reforcadores: ((s.reforcadores ?? []) as ReforcadorUsado[]),
        anexos: [],
        assinadaEm: s.assinada_em ?? undefined,
        assinadaPor: s.assinada_por ?? undefined,
        assinaturaHash: s.assinatura_hash ?? undefined,
        finalizadaEm: s.finalizada_em ?? undefined,
      };
    });

    setSessoes(mapeadas);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // ---------- Mutations ----------

  const criarSessao = useCallback(
    async (entrada: {
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
    }): Promise<string | null> => {
      const [hi, mi] = entrada.horaInicio.split(":").map(Number);
      const [hf, mf] = entrada.horaFim.split(":").map(Number);
      const duracao = Math.max(15, hf * 60 + mf - (hi * 60 + mi));
      const dataSessao = new Date(`${entrada.data}T${entrada.horaInicio}:00`).toISOString();

      const { data, error } = await supabase
        .from("sessoes")
        .insert({
          crianca_id: entrada.criancaId,
          terapeuta_id: entrada.terapeutaId ?? null,
          terapeuta_nome: entrada.terapeutaNome,
          data_sessao: dataSessao,
          duracao_minutos: duracao,
          tipo: tipoParaBanco(entrada.tipo),
          local: entrada.local,
          sala: entrada.sala ?? null,
          status: "rascunho",
        } as any)
        .select("id")
        .single();

      if (error) {
        toast.error("Erro ao criar sessão: " + error.message);
        return null;
      }
      toast.success("Sessão criada");
      await carregar();
      return data?.id ?? null;
    },
    [carregar]
  );

  const salvarSessao = useCallback(
    async (s: Sessao): Promise<boolean> => {
      if (s.status === "assinada") {
        toast.error("Sessão assinada não pode ser editada");
        return false;
      }

      const dataSessao = new Date(`${s.data}T${s.horaInicio}:00`).toISOString();

      const { error: errSes } = await supabase
        .from("sessoes")
        .update({
          data_sessao: dataSessao,
          duracao_minutos: s.duracaoMin,
          tipo: tipoParaBanco(s.tipo),
          local: s.local,
          sala: s.sala ?? null,
          observacoes: s.notaGeral ?? null,
          nota_incidente: s.notaIncidente ?? null,
          evolucao_diaria: s.evolucaoDiaria ?? null,
          humor_inicial: humorParaNumero(s.humor),
          reforcadores: s.reforcadores as any,
        } as any)
        .eq("id", s.id);

      if (errSes) {
        toast.error("Erro ao salvar: " + errSes.message);
        return false;
      }

      // Sincroniza resultados_programa: estratégia simples — apaga e reinsere
      await supabase.from("resultados_programa").delete().eq("sessao_id", s.id);
      if (s.registros.length > 0) {
        const linhas = s.registros
          .filter((r) => r.programaNome.trim())
          .map((r) => ({
            sessao_id: s.id,
            programa_id: s.criancaId, // fallback (programa_id é NOT NULL); usa criancaId como placeholder válido
            programa_nome: r.programaNome,
            objetivo: r.objetivo,
            tentativas: r.tentativas,
            acertos: r.acertos,
            nivel: r.nivel,
            observacao: r.observacao ?? null,
          }));
        // Tenta resolver programa_id real via tabela programas (match por nome+criança)
        const { data: progs } = await supabase
          .from("programas")
          .select("id, nome")
          .eq("crianca_id", s.criancaId);
        const mapaProg = new Map((progs ?? []).map((p: any) => [p.nome, p.id]));
        const linhasResolvidas = linhas.map((l) => ({
          ...l,
          programa_id: mapaProg.get(l.programa_nome) ?? l.programa_id,
        }));
        const { error: errR } = await supabase.from("resultados_programa").insert(linhasResolvidas as any);
        if (errR) {
          toast.error("Erro ao salvar registros: " + errR.message);
          return false;
        }
      }

      // Sincroniza ABC
      await supabase.from("registros_abc").delete().eq("sessao_id", s.id);
      if (s.narrativaAbc.length > 0) {
        const { error: errA } = await supabase.from("registros_abc").insert(
          s.narrativaAbc.map((n) => ({
            sessao_id: s.id,
            horario: n.horario || "00:00",
            antecedente: n.antecedente,
            comportamento: n.comportamento,
            consequencia: n.consequencia,
            intensidade: n.intensidade,
          })) as any
        );
        if (errA) {
          toast.error("Erro ao salvar ABC: " + errA.message);
          return false;
        }
      }

      toast.success("Sessão salva");
      await carregar();
      return true;
    },
    [carregar]
  );

  const finalizarSessao = useCallback(
    async (id: string): Promise<boolean> => {
      const { error } = await supabase.rpc("finalizar_sessao" as any, { _sessao_id: id });
      if (error) {
        toast.error("Erro ao finalizar: " + error.message);
        return false;
      }
      toast.success("Sessão finalizada");
      await carregar();
      return true;
    },
    [carregar]
  );

  const assinarSessao = useCallback(
    async (id: string): Promise<boolean> => {
      const { error } = await supabase.rpc("assinar_sessao" as any, { _sessao_id: id });
      if (error) {
        toast.error("Erro ao assinar: " + error.message);
        return false;
      }
      toast.success("Sessão assinada digitalmente");
      await carregar();
      return true;
    },
    [carregar]
  );

  return {
    sessoes,
    carregando,
    recarregar: carregar,
    criarSessao,
    salvarSessao,
    finalizarSessao,
    assinarSessao,
  };
}
