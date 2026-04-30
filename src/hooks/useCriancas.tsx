import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TAMANHO_PAGINA, type CriancaForm } from "@/schemas/crianca";

export interface CriancaListagem {
  id: string;
  nome: string;
  idade: number;
  diagnostico: string;
  status: string;
  profissional: string;
  ultimaSessao: string;
  foto_url: string | null;
}

interface FiltrosCriancas {
  busca?: string;
  apenasAtivos?: boolean;
  pagina?: number;
}

interface ResultadoListagem {
  criancas: CriancaListagem[];
  total: number;
  totalPaginas: number;
  pagina: number;
}

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

const COLUNAS_LISTAGEM =
  "id,nome,idade,diagnostico,foto_url,ativo,ultima_sessao_data,ultima_sessao_terapeuta";

async function buscarCriancas(filtros: FiltrosCriancas): Promise<ResultadoListagem> {
  const pagina = Math.max(1, filtros.pagina ?? 1);
  const inicio = (pagina - 1) * TAMANHO_PAGINA;
  const fim = inicio + TAMANHO_PAGINA - 1;

  let query = supabase
    .from("vw_criancas_listagem" as never)
    .select(COLUNAS_LISTAGEM, { count: "exact" })
    .order("nome", { ascending: true })
    .range(inicio, fim);

  if (filtros.apenasAtivos !== false) {
    query = query.eq("ativo", true);
  }

  const termo = filtros.busca?.trim();
  if (termo && termo.length > 0) {
    // Busca em nome ou diagnóstico (case-insensitive)
    const escaped = termo.replace(/[%,]/g, " ");
    query = query.or(`nome.ilike.%${escaped}%,diagnostico.ilike.%${escaped}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const linhas = (data ?? []) as Array<{
    id: string;
    nome: string;
    idade: number | null;
    diagnostico: string | null;
    foto_url: string | null;
    ativo: boolean;
    ultima_sessao_data: string | null;
    ultima_sessao_terapeuta: string | null;
  }>;

  const criancas: CriancaListagem[] = linhas.map((c) => ({
    id: c.id,
    nome: c.nome,
    idade: c.idade ?? 0,
    diagnostico: c.diagnostico ?? "—",
    status: c.ativo ? "Ativo" : "Inativo",
    profissional: c.ultima_sessao_terapeuta ?? "—",
    ultimaSessao: formatarData(c.ultima_sessao_data),
    foto_url: c.foto_url,
  }));

  const total = count ?? 0;
  return {
    criancas,
    total,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(total / TAMANHO_PAGINA)),
  };
}

export function useCriancas(filtros: FiltrosCriancas = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["criancas", "listagem", filtros],
    queryFn: () => buscarCriancas(filtros),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const mutCriar = useMutation({
    mutationFn: async (nova: CriancaForm) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("criancas")
        .insert({
          nome: nova.nome,
          data_nascimento: nova.data_nascimento,
          diagnostico: nova.diagnostico,
          responsavel_principal: nova.responsavel_principal || null,
          telefone_contato: nova.telefone_contato || null,
          email_contato: nova.email_contato || null,
          observacoes: nova.observacoes || null,
          criado_por: userData.user?.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.nome} cadastrada com sucesso`);
      queryClient.invalidateQueries({ queryKey: ["criancas"] });
    },
    onError: (e: Error) => toast.error("Erro ao cadastrar: " + e.message),
  });

  return {
    dados: query.data,
    criancas: query.data?.criancas ?? [],
    total: query.data?.total ?? 0,
    totalPaginas: query.data?.totalPaginas ?? 1,
    pagina: query.data?.pagina ?? 1,
    carregando: query.isLoading,
    atualizando: query.isFetching && !query.isLoading,
    recarregar: () => queryClient.invalidateQueries({ queryKey: ["criancas"] }),
    criar: mutCriar.mutateAsync,
    salvando: mutCriar.isPending,
  };
}
