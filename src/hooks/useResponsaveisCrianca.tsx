import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ResponsavelCrianca {
  vinculoId: string;
  funcionarioId: string;
  nome: string;
  cargo: string | null;
  papelClinico: string;
}

export function useResponsaveisCrianca(criancaId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["crianca-responsaveis", criancaId],
    enabled: !!criancaId,
    queryFn: async (): Promise<ResponsavelCrianca[]> => {
      const { data, error } = await supabase
        .from("crianca_responsaveis")
        .select("id,funcionario_id,papel_clinico,funcionarios(nome_completo,sub_cargo,cargo)")
        .eq("crianca_id", criancaId!);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        vinculoId: r.id,
        funcionarioId: r.funcionario_id,
        nome: r.funcionarios?.nome_completo ?? "—",
        cargo: r.funcionarios?.sub_cargo ?? r.funcionarios?.cargo ?? null,
        papelClinico: r.papel_clinico ?? "responsavel",
      }));
    },
  });

  const adicionar = useMutation({
    mutationFn: async (funcionarioId: string) => {
      if (!criancaId) throw new Error("criancaId ausente");
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("crianca_responsaveis").insert({
        crianca_id: criancaId,
        funcionario_id: funcionarioId,
        criado_por: userData.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profissional vinculado");
      qc.invalidateQueries({ queryKey: ["crianca-responsaveis", criancaId] });
    },
    onError: (e: Error) => toast.error("Erro ao vincular: " + e.message),
  });

  const remover = useMutation({
    mutationFn: async (vinculoId: string) => {
      const { error } = await supabase
        .from("crianca_responsaveis")
        .delete()
        .eq("id", vinculoId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vínculo removido");
      qc.invalidateQueries({ queryKey: ["crianca-responsaveis", criancaId] });
    },
    onError: (e: Error) => toast.error("Erro ao remover: " + e.message),
  });

  return {
    responsaveis: query.data ?? [],
    carregando: query.isLoading,
    adicionar: adicionar.mutateAsync,
    remover: remover.mutateAsync,
    salvando: adicionar.isPending || remover.isPending,
  };
}
