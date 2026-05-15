import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CriancaGrafico,
  ProgramaCrianca,
  RegistroSessao,
  NivelDesempenho,
} from "@/componentes/graficos/dadosGraficos";

function calcularIdade(iso: string): number {
  const nasc = new Date(iso);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function iniciais(nome: string): string {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function mapearDominio(d: string): ProgramaCrianca["disciplina"] {
  const v = d.toLowerCase();
  if (v.includes("fono") || v.includes("comunic")) return "Fonoaudiologia";
  if (v.includes("ocup") || v.includes("motor")) return "Terapia Ocupacional";
  if (v.includes("psicop") || v.includes("acad")) return "Psicopedagogia";
  if (v.includes("psico") || v.includes("comport")) return "Psicologia";
  return "ABA";
}

const NIVEIS_VALIDOS: NivelDesempenho[] = ["-", "AFT", "AFL", "AG", "IND", "+"];

function mapearNivel(nivel: string | null | undefined): NivelDesempenho {
  if (!nivel) return "-";
  // resultados_programa.nivel já vem como sigla ('AG', 'AFT', ...) por padrão
  if ((NIVEIS_VALIDOS as string[]).includes(nivel)) return nivel as NivelDesempenho;
  // programas.nivel_desempenho usa enum com nomes longos
  const map: Record<string, NivelDesempenho> = {
    linha_base: "-",
    ajuda_fisica_total: "AFT",
    ajuda_fisica_leve: "AFL",
    ajuda_gestual: "AG",
    independente: "IND",
    acima_esperado: "+",
  };
  return map[nivel] ?? "-";
}

/**
 * Carrega dados de gráficos. Quando `criancaId` é informado, filtra no banco
 * (mais leve e correto). Sem id, mantém comportamento global anterior.
 * O nível de cada ponto é lido do REGISTRO (resultados_programa.nivel),
 * não do campo único do programa, garantindo a curva de aprendizagem real.
 */
export function useGraficosBanco(criancaId?: string) {
  const [criancas, setCriancas] = useState<CriancaGrafico[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);

    let qCriancas = supabase.from("criancas").select("*").eq("ativo", true).order("nome");
    let qProgramas = supabase.from("programas").select("*").eq("ativo", true);
    if (criancaId) {
      qCriancas = qCriancas.eq("id", criancaId);
      qProgramas = qProgramas.eq("crianca_id", criancaId);
    }

    const [{ data: criancasData }, { data: programasData }] = await Promise.all([
      qCriancas,
      qProgramas,
    ]);

    if (!criancasData) {
      toast.error("Erro ao carregar dados de gráficos");
      setCarregando(false);
      return;
    }

    const programaIds = (programasData ?? []).map((p) => p.id);
    let resultadosData: any[] = [];
    if (programaIds.length > 0) {
      const { data } = await supabase
        .from("resultados_programa")
        .select("*, sessoes(data_sessao)")
        .in("programa_id", programaIds)
        .order("criado_em");
      resultadosData = data ?? [];
    }

    const lista: CriancaGrafico[] = criancasData.map((c) => {
      const programasCrianca = (programasData ?? []).filter((p) => p.crianca_id === c.id);
      const programas: ProgramaCrianca[] = programasCrianca.map((p) => {
        const registros: RegistroSessao[] = resultadosData
          .filter((r: any) => r.programa_id === p.id)
          .map((r: any) => ({
            data: r.sessoes?.data_sessao ?? r.criado_em,
            // PER-RECORD level — corrige curva plana do bug anterior
            nivel: mapearNivel(r.nivel),
            tentativasCorretas: r.acertos ?? 0,
            tentativasTotais: r.tentativas || 1,
            observacao: r.observacao ?? undefined,
          }))
          .sort((a, b) => a.data.localeCompare(b.data));

        return {
          id: p.id,
          nome: p.nome,
          disciplina: mapearDominio(p.dominio),
          tipo: "Aquisição",
          objetivo: p.meta ?? p.descricao ?? "",
          criadoEm: p.criado_em,
          registros,
        };
      });

      return {
        id: c.id,
        nome: c.nome,
        iniciais: iniciais(c.nome),
        idade: calcularIdade(c.data_nascimento),
        programas,
      };
    });

    // Mantém crianças mesmo sem programas para empty-state controlado no componente
    setCriancas(lista);
    setCarregando(false);
  }, [criancaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { criancas, carregando, recarregar: carregar };
}
