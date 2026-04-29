import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type AcaoLog =
  | "login"
  | "logout"
  | "criar"
  | "editar"
  | "excluir"
  | "visualizar"
  | "exportar"
  | "alterar_papel"
  | "convidar_escola"
  | "falha_login";

interface RegistrarLogParams {
  acao: AcaoLog;
  entidade: string;
  descricao: string;
  entidadeId?: string;
  detalhes?: Record<string, unknown>;
}

export function useLogAuditoria() {
  const { user } = useAuth();

  const registrar = useCallback(
    async ({ acao, entidade, descricao, entidadeId, detalhes }: RegistrarLogParams) => {
      if (!user) return;
      try {
        await supabase.from("logs_auditoria").insert({
          user_id: user.id,
          user_email: user.email,
          acao,
          entidade,
          entidade_id: entidadeId ?? null,
          descricao,
          detalhes: detalhes ?? null,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        });
      } catch {
        // Falha silenciosa — auditoria não deve quebrar a UX
      }
    },
    [user],
  );

  return { registrar };
}
