// Edge function: gestão de usuários por admin (criar / remover)
// Endurecida: CORS allowlist + validação senha forte + rate limit + auditoria.
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
  acao: "criar" | "remover";
  email?: string;
  senha?: string;
  nome_completo?: string;
  telefone?: string;
  papel?: Papel;
  user_id?: string;
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

    // Rate limit por usuário admin: 30 ações/5 min
    const ok = await checarRateLimit(admin, `user:${userData.user.id}`, "admin-users", {
      maxTentativas: 30,
      janelaMin: 5,
      bloqueioMin: 10,
    });
    if (!ok) return jsonResp({ erro: "Muitas requisições, aguarde." }, 429, cors);

    const { data: ehAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleErr) return jsonResp({ erro: "Erro ao validar permissões." }, 500, cors);
    if (!ehAdmin) return jsonResp({ erro: "Acesso restrito a administradores." }, 403, cors);

    const body = (await req.json()) as Body;
    const ip = ipDoCliente(req);

    if (body.acao === "criar") {
      const { email, senha, nome_completo, telefone, papel } = body;
      if (!email || !senha || !nome_completo || !papel) {
        return jsonResp({ erro: "Campos obrigatórios ausentes." }, 400, cors);
      }

      // Valida senha forte via banco
      const { data: validacao } = await admin.rpc("validar_forca_senha", { _senha: senha });
      if (validacao && validacao.valida === false) {
        return jsonResp(
          { erro: "Senha fraca", detalhes: validacao.erros },
          400,
          cors,
        );
      }

      const { data: criado, error: criarErr } = await admin.auth.admin.createUser({
        email,
        password: senha,
        email_confirm: true,
        user_metadata: { nome_completo, telefone: telefone ?? null },
      });
      if (criarErr || !criado.user) {
        console.error("Erro ao criar usuário:", criarErr);
        return jsonResp({ erro: "Não foi possível criar o usuário." }, 400, cors);
      }

      if (papel !== "familia") {
        await admin.from("user_roles").delete().eq("user_id", criado.user.id);
        const { error: insErr } = await admin
          .from("user_roles")
          .insert({ user_id: criado.user.id, role: papel });
        if (insErr)
          return jsonResp({ erro: "Usuário criado, mas falha ao definir papel." }, 500, cors);
      }

      await admin.from("logs_auditoria").insert({
        user_id: userData.user.id,
        user_email: userData.user.email,
        acao: "criar",
        entidade: "auth.users",
        entidade_id: criado.user.id,
        descricao: `Admin criou usuário ${email} com papel ${papel}`,
        ip,
      });

      return jsonResp({ ok: true, user_id: criado.user.id }, 200, cors);
    }

    if (body.acao === "remover") {
      const { user_id } = body;
      if (!user_id) return jsonResp({ erro: "user_id obrigatório." }, 400, cors);
      if (user_id === userData.user.id)
        return jsonResp({ erro: "Você não pode remover a si mesmo." }, 400, cors);

      const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
      if (delErr) {
        console.error("Erro ao remover usuário:", delErr);
        return jsonResp({ erro: "Não foi possível remover o usuário." }, 400, cors);
      }

      await admin.from("logs_auditoria").insert({
        user_id: userData.user.id,
        user_email: userData.user.email,
        acao: "excluir",
        entidade: "auth.users",
        entidade_id: user_id,
        descricao: "Admin removeu usuário",
        ip,
      });

      return jsonResp({ ok: true }, 200, cors);
    }

    return jsonResp({ erro: "Ação inválida." }, 400, cors);
  } catch (e) {
    console.error("Erro não tratado em admin-users:", e);
    return jsonResp({ erro: "Erro interno. Tente novamente." }, 500, cors);
  }
});
