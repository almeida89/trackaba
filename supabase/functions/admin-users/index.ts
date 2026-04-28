// Edge function: gestão de usuários por admin (criar / remover)
// Validação de papel admin é feita no servidor antes de qualquer ação privilegiada.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Papel = "admin" | "psicologo" | "coordenador" | "recepcionista" | "familia";

interface Body {
  acao: "criar" | "remover";
  email?: string;
  senha?: string;
  nome_completo?: string;
  telefone?: string;
  papel?: Papel;
  user_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return json({ erro: "Não autenticado." }, 401);
    }

    // Cliente com JWT do usuário, para descobrir quem chama
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ erro: "Sessão inválida." }, 401);

    // Cliente admin (service role) para validar papel e executar ações privilegiadas
    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: ehAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleErr) return json({ erro: "Erro ao validar permissões." }, 500);
    if (!ehAdmin) return json({ erro: "Acesso restrito a administradores." }, 403);

    const body = (await req.json()) as Body;

    if (body.acao === "criar") {
      const { email, senha, nome_completo, telefone, papel } = body;
      if (!email || !senha || !nome_completo || !papel) {
        return json({ erro: "Campos obrigatórios ausentes." }, 400);
      }
      if (senha.length < 8) return json({ erro: "A senha deve ter ao menos 8 caracteres." }, 400);

      const { data: criado, error: criarErr } = await admin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { nome_completo, telefone: telefone ?? null },
      });
      if (criarErr || !criado.user) {
        console.error("Erro ao criar usuário:", criarErr);
        return json({ erro: "Não foi possível criar o usuário." }, 400);
      }

      // Trigger handle_new_user já criou profile e papel 'familia'. Ajustar papel se diferente.
      if (papel !== "familia") {
        await admin.from("user_roles").delete().eq("user_id", criado.user.id);
        const { error: insErr } = await admin
          .from("user_roles")
          .insert({ user_id: criado.user.id, role: papel });
        if (insErr) return json({ erro: "Usuário criado, mas falha ao definir papel." }, 500);
      }

      return json({ ok: true, user_id: criado.user.id });
    }

    if (body.acao === "remover") {
      const { user_id } = body;
      if (!user_id) return json({ erro: "user_id obrigatório." }, 400);
      if (user_id === userData.user.id) {
        return json({ erro: "Você não pode remover a si mesmo." }, 400);
      }
      const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
      if (delErr) {
        console.error("Erro ao remover usuário:", delErr);
        return json({ erro: "Não foi possível remover o usuário." }, 400);
      }
      return json({ ok: true });
    }

    return json({ erro: "Ação inválida." }, 400);
  } catch (e) {
    console.error("Erro não tratado em admin-users:", e);
    return json({ erro: "Erro interno. Tente novamente." }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
