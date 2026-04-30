import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CriancaDetalhe {
  id: string;
  nome: string;
  data_nascimento: string;
  diagnostico: string | null;
  responsavel_principal: string | null;
  telefone_contato: string | null;
  email_contato: string | null;
  observacoes: string | null;
  foto_url: string | null;
  ativo: boolean;
  criado_em: string;
}

export function calcularIdade(iso: string): number {
  const nasc = new Date(iso);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export function formatarDataBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export function useCrianca(id: string | undefined) {
  const [crianca, setCrianca] = useState<CriancaDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    if (!id) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    const { data, error } = await supabase
      .from("criancas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      toast.error("Erro ao carregar criança");
    }
    setCrianca(data ?? null);
    setCarregando(false);
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { crianca, carregando, recarregar: carregar };
}
