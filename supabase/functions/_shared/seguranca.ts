// Utilitários compartilhados de segurança para edge functions
// - CORS allowlist dinâmica (consulta tabela origens_permitidas)
// - Rate limit (consulta função consumir_rate_limit)
// - Identificação de IP do cliente
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const FALLBACK_ORIGENS = new Set([
  "https://trackaba.lovable.app",
  "https://id-preview--09a24013-092f-4773-b13b-226e004ad470.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
]);

const HEADERS_BASE = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

export function clienteAdmin(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export function ipDoCliente(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ?? "desconhecido";
}

export async function corsHeadersPara(
  req: Request,
  admin: SupabaseClient,
): Promise<Record<string, string>> {
  const origem = req.headers.get("origin") ?? "";
  const previewLovable = /^https:\/\/(?:id-preview--)?[a-z0-9-]+\.lovable\.app$/i;
  let permitida = FALLBACK_ORIGENS.has(origem) || previewLovable.test(origem);

  if (!permitida && origem) {
    try {
      const { data } = await admin
        .from("origens_permitidas")
        .select("origem")
        .eq("origem", origem)
        .eq("ativo", true)
        .maybeSingle();
      permitida = !!data;
    } catch {
      // Se falhar, mantém fallback
    }
  }

  return {
    ...HEADERS_BASE,
    "Access-Control-Allow-Origin": permitida ? origem : "null",
  };
}

export async function checarRateLimit(
  admin: SupabaseClient,
  identificador: string,
  endpoint: string,
  opts: { maxTentativas?: number; janelaMin?: number; bloqueioMin?: number } = {},
): Promise<boolean> {
  const { data, error } = await admin.rpc("consumir_rate_limit", {
    _identificador: identificador,
    _endpoint: endpoint,
    _max_tentativas: opts.maxTentativas ?? 10,
    _janela_minutos: opts.janelaMin ?? 5,
    _bloqueio_minutos: opts.bloqueioMin ?? 15,
  });
  if (error) {
    console.error("rate_limit erro:", error);
    return true; // fail-open para não derrubar serviço
  }
  return data === true;
}

export function jsonResp(
  payload: unknown,
  status: number,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
