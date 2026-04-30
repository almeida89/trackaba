// Edge function pública: valida token de convite da escola.
// Endurecida com CORS allowlist + rate limit por IP+token.
import {
  clienteAdmin,
  corsHeadersPara,
  ipDoCliente,
  checarRateLimit,
  jsonResp,
} from "../_shared/seguranca.ts";

Deno.serve(async (req) => {
  const admin = clienteAdmin();
  const cors = await corsHeadersPara(req, admin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const ip = ipDoCliente(req);
    // Rate limit por IP: 20 tentativas a cada 5 min, bloqueia por 30 min
    const permitido = await checarRateLimit(admin, ip, "validar-token-escola", {
      maxTentativas: 20,
      janelaMin: 5,
      bloqueioMin: 30,
    });
    if (!permitido) {
      return jsonResp(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        429,
        cors,
      );
    }

    const { token } = await req.json();
    if (!token || typeof token !== "string" || token.length > 100) {
      return jsonResp({ error: "Token ausente ou inválido" }, 400, cors);
    }

    // Rate limit adicional por token (anti-enumeration)
    const okToken = await checarRateLimit(admin, `tok:${token}`, "validar-token-escola", {
      maxTentativas: 10,
      janelaMin: 10,
      bloqueioMin: 60,
    });
    if (!okToken) {
      return jsonResp({ error: "Muitas tentativas para este convite." }, 429, cors);
    }

    const { data: acesso, error: errAcesso } = await admin
      .from("acessos_escola")
      .select("*")
      .eq("token_convite", token)
      .maybeSingle();

    if (errAcesso || !acesso) {
      // Auditoria: tentativa com token inválido
      await admin.from("logs_auditoria").insert({
        acao: "visualizar",
        entidade: "acessos_escola",
        descricao: "Tentativa com token inválido",
        ip,
        user_agent: req.headers.get("user-agent"),
      });
      return jsonResp({ error: "Convite não encontrado" }, 404, cors);
    }

    const expirado = new Date(acesso.expira_em).getTime() < Date.now();
    if (expirado || acesso.status === "revogado") {
      if (expirado && acesso.status !== "expirado") {
        await admin
          .from("acessos_escola")
          .update({ status: "expirado" })
          .eq("id", acesso.id);
      }
      return jsonResp(
        {
          error: "Convite expirado ou revogado",
          acesso: { ...acesso, status: expirado ? "expirado" : acesso.status },
        },
        200,
        cors,
      );
    }

    const novoStatus = acesso.status === "pendente" ? "ativo" : acesso.status;
    await admin
      .from("acessos_escola")
      .update({ status: novoStatus, ultimo_acesso: new Date().toISOString() })
      .eq("id", acesso.id);

    // Log de acesso bem-sucedido
    await admin.from("logs_auditoria").insert({
      acao: "visualizar",
      entidade: "acessos_escola",
      entidade_id: acesso.id,
      descricao: `Acesso da escola ${acesso.escola_nome}`,
      ip,
      user_agent: req.headers.get("user-agent"),
    });

    let sessoes: unknown[] = [];
    let programas: unknown[] = [];

    if (acesso.ver_sessoes) {
      const { data } = await admin
        .from("sessoes")
        .select("id, data_sessao, duracao_minutos, terapeuta_nome, tipo, resumo_familia")
        .eq("crianca_id", acesso.crianca_id)
        .order("data_sessao", { ascending: false })
        .limit(15);
      sessoes = data ?? [];
    }

    if (acesso.ver_programas) {
      const { data } = await admin
        .from("programas")
        .select("id, nome, dominio, meta, nivel_desempenho")
        .eq("crianca_id", acesso.crianca_id)
        .eq("ativo", true);
      programas = data ?? [];
    }

    return jsonResp(
      { acesso: { ...acesso, status: novoStatus }, sessoes, programas },
      200,
      cors,
    );
  } catch (e) {
    console.error("Erro validar-token-escola:", e);
    return jsonResp({ error: "Erro interno" }, 500, cors);
  }
});
