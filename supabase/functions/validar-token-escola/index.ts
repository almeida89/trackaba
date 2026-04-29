// Edge function pública: valida token de convite da escola e devolve dados restritos
// Não exige JWT — acessada via link público enviado à escola.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(JSON.stringify({ error: "Token ausente" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cliente com service role — bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Busca o convite
    const { data: acesso, error: errAcesso } = await supabase
      .from("acessos_escola")
      .select("*")
      .eq("token_convite", token)
      .maybeSingle();

    if (errAcesso || !acesso) {
      return new Response(JSON.stringify({ error: "Convite não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expirado = new Date(acesso.expira_em).getTime() < Date.now();
    if (expirado || acesso.status === "revogado") {
      // Atualiza para expirado se necessário
      if (expirado && acesso.status !== "expirado") {
        await supabase
          .from("acessos_escola")
          .update({ status: "expirado" })
          .eq("id", acesso.id);
      }
      return new Response(
        JSON.stringify({ error: "Convite expirado ou revogado", acesso: { ...acesso, status: expirado ? "expirado" : acesso.status } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Marca como ativo se ainda estava pendente + atualiza último acesso
    const novoStatus = acesso.status === "pendente" ? "ativo" : acesso.status;
    await supabase
      .from("acessos_escola")
      .update({ status: novoStatus, ultimo_acesso: new Date().toISOString() })
      .eq("id", acesso.id);

    // 3. Busca dados conforme permissões
    let sessoes: unknown[] = [];
    let programas: unknown[] = [];

    if (acesso.ver_sessoes) {
      const { data } = await supabase
        .from("sessoes")
        .select("id, data_sessao, duracao_minutos, terapeuta_nome, tipo, resumo_familia")
        .eq("crianca_id", acesso.crianca_id)
        .order("data_sessao", { ascending: false })
        .limit(15);
      sessoes = data ?? [];
    }

    if (acesso.ver_programas) {
      const { data } = await supabase
        .from("programas")
        .select("id, nome, dominio, meta, nivel_desempenho")
        .eq("crianca_id", acesso.crianca_id)
        .eq("ativo", true);
      programas = data ?? [];
    }

    return new Response(
      JSON.stringify({
        acesso: { ...acesso, status: novoStatus },
        sessoes,
        programas,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("Erro validar-token-escola:", e);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
