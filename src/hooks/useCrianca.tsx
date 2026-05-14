import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  pediatra_nome: string | null;
  pediatra_telefone: string | null;
  neurologista_nome: string | null;
  alergias: string | null;
  medicacoes: string | null;
  escola_nome: string | null;
  escola_serie: string | null;
  escola_professor: string | null;
  escola_telefone: string | null;
  acomp_escolar_nome: string | null;
  acomp_escolar_horario: string | null;
  acomp_escolar_objetivos: string | null;
  acomp_escolar_observacoes: string | null;
}

const COLUNAS =
  "id,nome,data_nascimento,diagnostico,responsavel_principal,telefone_contato,email_contato,observacoes,foto_url,ativo,criado_em,pediatra_nome,pediatra_telefone,neurologista_nome,alergias,medicacoes,escola_nome,escola_serie,escola_professor,escola_telefone,acomp_escolar_nome,acomp_escolar_horario,acomp_escolar_objetivos,acomp_escolar_observacoes";

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
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["criancas", "detalhe", id],
    enabled: !!id,
    queryFn: async (): Promise<CriancaDetalhe | null> => {
      const { data, error } = await supabase
        .from("criancas")
        .select(COLUNAS)
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return (data as CriancaDetalhe) ?? null;
    },
    staleTime: 30_000,
  });

  const mutFoto = useMutation({
    mutationFn: async (arquivo: File) => {
      if (!id) throw new Error("ID inválido");
      const ext = arquivo.name.split(".").pop()?.toLowerCase() || "jpg";
      const caminho = `${id}/foto-${Date.now()}.${ext}`;

      const { error: errUp } = await supabase.storage
        .from("fotos-criancas")
        .upload(caminho, arquivo, { upsert: false, contentType: arquivo.type });
      if (errUp) throw errUp;

      // URL assinada (bucket privado) válida por 1 ano
      const { data: signed, error: errSign } = await supabase.storage
        .from("fotos-criancas")
        .createSignedUrl(caminho, 60 * 60 * 24 * 365);
      if (errSign) throw errSign;

      const { error: errUpd } = await supabase
        .from("criancas")
        .update({ foto_url: signed.signedUrl })
        .eq("id", id);
      if (errUpd) throw errUpd;

      return signed.signedUrl;
    },
    onSuccess: () => {
      toast.success("Foto atualizada");
      queryClient.invalidateQueries({ queryKey: ["criancas"] });
    },
    onError: (e: Error) => toast.error("Erro ao enviar foto: " + e.message),
  });

  const mutAtualizar = useMutation({
    mutationFn: async (campos: Partial<CriancaDetalhe>) => {
      if (!id) throw new Error("ID inválido");
      const { error } = await supabase.from("criancas").update(campos).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dados atualizados");
      queryClient.invalidateQueries({ queryKey: ["criancas", "detalhe", id] });
    },
    onError: (e: Error) => toast.error("Erro ao salvar: " + e.message),
  });

  return {
    crianca: query.data ?? null,
    carregando: query.isLoading,
    recarregar: () => queryClient.invalidateQueries({ queryKey: ["criancas", "detalhe", id] }),
    enviarFoto: mutFoto.mutateAsync,
    enviandoFoto: mutFoto.isPending,
    atualizar: mutAtualizar.mutateAsync,
    salvando: mutAtualizar.isPending,
  };
}
