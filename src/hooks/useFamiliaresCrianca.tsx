import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ParentescoDb = "mae" | "pai" | "avo" | "tio_tia" | "responsavel_legal" | "outro";

export interface FamiliarCrianca {
  vinculoId: string;
  userId: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  parentesco: ParentescoDb;
  podeVerEvolucao: boolean;
  podeVerSessoes: boolean;
}

export interface NovoFamiliarInput {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  parentesco: ParentescoDb;
  podeVerEvolucao: boolean;
  podeVerSessoes: boolean;
}

export function useFamiliaresCrianca(criancaId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["familia-membros", criancaId],
    enabled: !!criancaId,
    queryFn: async (): Promise<FamiliarCrianca[]> => {
      const { data, error } = await supabase
        .from("familia_membros")
        .select("id,user_id,parentesco,pode_ver_evolucao,pode_ver_sessoes")
        .eq("crianca_id", criancaId!);
      if (error) throw error;
      const linhas = data ?? [];
      const userIds = linhas.map((l) => l.user_id);
      let perfilPorId: Record<string, { nome: string; telefone: string | null }> = {};
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id,nome_completo,telefone")
          .in("id", userIds);
        (profs ?? []).forEach((p) => {
          perfilPorId[p.id] = {
            nome: p.nome_completo || "—",
            telefone: p.telefone ?? null,
          };
        });
      }
      return linhas.map((l) => ({
        vinculoId: l.id,
        userId: l.user_id,
        nome: perfilPorId[l.user_id]?.nome ?? "(perfil indisponível)",
        telefone: perfilPorId[l.user_id]?.telefone ?? null,
        email: null,
        parentesco: l.parentesco as ParentescoDb,
        podeVerEvolucao: l.pode_ver_evolucao,
        podeVerSessoes: l.pode_ver_sessoes,
      }));
    },
  });

  const criar = useMutation({
    mutationFn: async (input: NovoFamiliarInput) => {
      if (!criancaId) throw new Error("criancaId ausente");
      // Cria usuário com papel "familia" via edge function
      const { data: resp, error: edgeErr } = await supabase.functions.invoke("admin-users", {
        body: {
          acao: "criar",
          email: input.email,
          senha: input.senha,
          nome_completo: input.nome,
          telefone: input.telefone || null,
          papel: "familia",
        },
      });
      const erroEdge = (resp as { erro?: string })?.erro || edgeErr?.message;
      if (erroEdge) throw new Error(erroEdge);
      const novoUserId = (resp as { user_id?: string })?.user_id;
      if (!novoUserId) throw new Error("Falha ao criar acesso do familiar.");

      // Garante perfil (insere se trigger não tiver criado)
      await supabase.from("profiles").upsert(
        { id: novoUserId, nome_completo: input.nome, telefone: input.telefone || null },
        { onConflict: "id" },
      );

      const { error: vincErr } = await supabase.from("familia_membros").insert({
        crianca_id: criancaId,
        user_id: novoUserId,
        parentesco: input.parentesco,
        pode_ver_evolucao: input.podeVerEvolucao,
        pode_ver_sessoes: input.podeVerSessoes,
      });
      if (vincErr) throw vincErr;
    },
    onSuccess: () => {
      toast.success("Familiar cadastrado com acesso ao portal");
      qc.invalidateQueries({ queryKey: ["familia-membros", criancaId] });
    },
    onError: (e: Error) => toast.error("Erro ao cadastrar familiar: " + e.message),
  });

  const atualizar = useMutation({
    mutationFn: async (params: {
      vinculoId: string;
      userId: string;
      nome?: string;
      telefone?: string | null;
      parentesco: ParentescoDb;
      podeVerEvolucao: boolean;
      podeVerSessoes: boolean;
    }) => {
      const { error: e1 } = await supabase
        .from("familia_membros")
        .update({
          parentesco: params.parentesco,
          pode_ver_evolucao: params.podeVerEvolucao,
          pode_ver_sessoes: params.podeVerSessoes,
        })
        .eq("id", params.vinculoId);
      if (e1) throw e1;
      if (params.nome !== undefined || params.telefone !== undefined) {
        const patch: Record<string, string | null> = {};
        if (params.nome !== undefined) patch.nome_completo = params.nome;
        if (params.telefone !== undefined) patch.telefone = params.telefone;
        const { error: e2 } = await supabase
          .from("profiles")
          .update(patch)
          .eq("id", params.userId);
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      toast.success("Familiar atualizado");
      qc.invalidateQueries({ queryKey: ["familia-membros", criancaId] });
    },
    onError: (e: Error) => toast.error("Erro ao atualizar: " + e.message),
  });

  const remover = useMutation({
    mutationFn: async (vinculoId: string) => {
      const { error } = await supabase.from("familia_membros").delete().eq("id", vinculoId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vínculo removido");
      qc.invalidateQueries({ queryKey: ["familia-membros", criancaId] });
    },
    onError: (e: Error) => toast.error("Erro ao remover: " + e.message),
  });

  return {
    familiares: query.data ?? [],
    carregando: query.isLoading,
    criar: criar.mutateAsync,
    atualizar: atualizar.mutateAsync,
    remover: remover.mutateAsync,
    salvando: criar.isPending || atualizar.isPending || remover.isPending,
  };
}
