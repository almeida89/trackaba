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

function mapearNivel(nivel: string): NivelDesempenho {
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

export function useGraficosBanco() {
  const [criancas, setCriancas] = useState<CriancaGrafico[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);

    const [{ data: criancasData }, { data: programasData }, { data: resultadosData }] =
      await Promise.all([
        supabase.from("criancas").select("*").eq("ativo", true).order("nome"),
        supabase.from("programas").select("*").eq("ativo", true),
        supabase
          .from("resultados_programa")
          .select("*, sessoes(data_sessao)")
          .order("criado_em"),
      ]);

    if (!criancasData) {
      toast.error("Erro ao carregar dados de gráficos");
      setCarregando(false);
      return;
    }

    const lista: CriancaGrafico[] = criancasData.map((c) => {
      const programasCrianca = (programasData ?? []).filter((p) => p.crianca_id === c.id);
      const programas: ProgramaCrianca[] = programasCrianca.map((p) => {
        const registros: RegistroSessao[] = (resultadosData ?? [])
          .filter((r: any) => r.programa_id === p.id)
          .map((r: any) => ({
            data: r.sessoes?.data_sessao ?? r.criado_em,
            nivel: mapearNivel(p.nivel_desempenho),
            tentativasCorretas: r.acertos,
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
          registros: registros.length
            ? registros
            : [
                {
                  data: new Date().toISOString(),
                  nivel: mapearNivel(p.nivel_desempenho),
                  tentativasCorretas: 0,
                  tentativasTotais: 1,
                },
              ],
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

    setCriancas(lista.filter((c) => c.programas.length > 0));
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { criancas, carregando, recarregar: carregar };
}
