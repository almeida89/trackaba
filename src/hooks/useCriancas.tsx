import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CriancaBanco {
  id: string;
  nome: string;
  data_nascimento: string;
  diagnostico: string | null;
  responsavel_principal: string | null;
  telefone_contato: string | null;
  email_contato: string | null;
  observacoes: string | null;
  ativo: boolean;
  criado_em: string;
}

export interface CriancaListagem {
  id: string;
  nome: string;
  idade: number;
  diagnostico: string;
  status: string;
  profissional: string;
  ultimaSessao: string;
}

function calcularIdade(iso: string): number {
  const nasc = new Date(iso);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function useCriancas() {
  const [criancas, setCriancas] = useState<CriancaListagem[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { data: criancasData, error } = await supabase
      .from("criancas")
      .select("*")
      .eq("ativo", true)
      .order("nome");

    if (error) {
      toast.error("Erro ao carregar crianças");
      setCarregando(false);
      return;
    }

    // Buscar última sessão por criança
    const { data: sessoesData } = await supabase
      .from("sessoes")
      .select("crianca_id, data_sessao, terapeuta_nome")
      .order("data_sessao", { ascending: false });

    const ultimasPorCrianca = new Map<string, { data: string; terapeuta: string }>();
    sessoesData?.forEach((s) => {
      if (!ultimasPorCrianca.has(s.crianca_id)) {
        ultimasPorCrianca.set(s.crianca_id, {
          data: s.data_sessao,
          terapeuta: s.terapeuta_nome,
        });
      }
    });

    const lista: CriancaListagem[] = (criancasData ?? []).map((c) => {
      const ultima = ultimasPorCrianca.get(c.id);
      return {
        id: c.id,
        nome: c.nome,
        idade: calcularIdade(c.data_nascimento),
        diagnostico: c.diagnostico ?? "—",
        status: "Ativo",
        profissional: ultima?.terapeuta ?? "—",
        ultimaSessao: formatarData(ultima?.data ?? null),
      };
    });

    setCriancas(lista);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = async (nova: {
    nome: string;
    data_nascimento: string;
    diagnostico: string;
    responsavel_principal?: string;
  }) => {
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("criancas").insert({
      nome: nova.nome,
      data_nascimento: nova.data_nascimento,
      diagnostico: nova.diagnostico,
      responsavel_principal: nova.responsavel_principal,
      criado_por: userData.user?.id,
    });

    if (error) {
      toast.error("Erro ao cadastrar: " + error.message);
      return false;
    }

    toast.success(`${nova.nome} cadastrada com sucesso`);
    await carregar();
    return true;
  };

  return { criancas, carregando, recarregar: carregar, criar };
}
