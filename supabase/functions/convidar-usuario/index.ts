// Edge function: cria convite de cadastro para um novo usuário.
// Apenas admin/coordenador. Gera token e envia email via Supabase Auth (inviteUserByEmail).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  clienteAdmin,
  corsHeadersPara,
  ipDoCliente,
  checarRateLimit,
  jsonResp,
} from "../_shared/seguranca.ts";

type Papel = "admin" | "psicologo" | "coordenador" | "recepcionista" | "familia";

interface Body {
  email: string;
  nome_completo: string;
  papel: Papel;
  observacao?: string;
}

Deno.serve(async (req) => {
  const admin = clienteAdmin();
  const cors = await corsHeadersPara(req, admin);

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON =
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return jsonResp({ erro: "Não autenticado." }, 401, cors);

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return jsonResp({ erro: "Sessão inválida." }, 401, cors);

    // Rate limit
    const ok = await checarRateLimit(admin, `user:${userData.user.id}`, "convidar-usuario", {
      maxTentativas: 20,
      janelaMin: 10,
      bloqueioMin: 15,
    });
    if (!ok) return jsonResp({ erro: "Muitos convites enviados, aguarde." }, 429, cors);

    // Permissão: admin OU coordenador
    const { data: ehAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    const { data: ehCoord } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "coordenador",
    });
    if (!ehAdmin && !ehCoord) {
      return jsonResp({ erro: "Acesso restrito." }, 403, cors);
    }

    const body = (await req.json()) as Body;
    const email = (body.email ?? "").trim().toLowerCase();
    const nome = (body.nome_completo ?? "").trim();
    const papel = body.papel;

    if (!email || !nome || !papel) {
      return jsonResp({ erro: "Campos obrigatórios ausentes." }, 400, cors);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResp({ erro: "Email inválido." }, 400, cors);
    }
    // Coordenador não pode convidar admin
    if (!ehAdmin && papel === "admin") {
      return jsonResp({ erro: "Apenas admin pode criar outro admin." }, 403, cors);
    }

    // Cria registro de convite
    const { data: convite, error: convErr } = await admin
      .from("convites_usuario")
      .insert({
        email,
        nome_completo: nome,
        papel,
        observacao: body.observacao ?? null,
        convidado_por: userData.user.id,
      })
      .select()
      .single();

    if (convErr || !convite) {
      console.error("Erro convite:", convErr);
      return jsonResp({ erro: "Falha ao criar convite." }, 500, cors);
    }

    // Envia email via Supabase Auth (inviteUserByEmail). Quando o usuário
    // aceita, o trigger handle_new_user vincula o convite e atribui o papel.
    const origem = req.headers.get("origin") ?? "https://trackaba.lovable.app";
    const { error: mailErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { nome_completo: nome },
      redirectTo: `${origem}/auth?convite=${convite.token}`,
    });
    if (mailErr) {
      console.error("Erro ao enviar email:", mailErr);
      // Não derruba — convite ainda existe e pode ser reenviado
    }

    await admin.from("logs_auditoria").insert({
      user_id: userData.user.id,
      user_email: userData.user.email,
      acao: "criar",
      entidade: "convites_usuario",
      entidade_id: convite.id,
      descricao: `Convite enviado para ${email} (${papel})`,
      ip: ipDoCliente(req),
    });

    return jsonResp({ ok: true, convite }, 200, cors);
  } catch (e) {
    console.error("Erro convidar-usuario:", e);
    return jsonResp({ erro: "Erro interno." }, 500, cors);
  }
});
