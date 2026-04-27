/**
 * Suite de testes de segurança automatizados.
 *
 * Objetivo: detectar regressões de RLS e escalonamento de privilégios
 * antes que cheguem em produção. Roda em CI com a chave anon pública.
 *
 * Cria dois usuários descartáveis via signUp (e-mails aleatórios) e
 * valida que nenhum deles consegue:
 *   - se auto-promover a admin inserindo em user_roles
 *   - alterar o próprio papel via UPDATE
 *   - ler o papel de outro usuário
 *   - ler/alterar o perfil de outro usuário
 *   - acessar tabelas sem sessão autenticada
 *
 * Requer que signups por e-mail estejam habilitados e auto-confirmados
 * no ambiente de teste (Lovable Cloud → Auth Settings).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const criarCliente = (): SupabaseClient =>
  createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

const gerarEmail = (prefixo: string) =>
  `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@teste-seguranca.local`;

const SENHA = "Senha@TesteSeguro2026!";

type Usuario = { client: SupabaseClient; userId: string; email: string };

async function criarUsuario(prefixo: string): Promise<Usuario> {
  const client = criarCliente();
  const email = gerarEmail(prefixo);
  const { data, error } = await client.auth.signUp({
    email,
    password: SENHA,
    options: { data: { nome_completo: `Teste ${prefixo}` } },
  });
  if (error) throw new Error(`Falha ao criar usuário ${prefixo}: ${error.message}`);

  // Em ambientes com confirmação de e-mail desativada, signUp já retorna sessão.
  // Caso contrário, tenta login (auto-confirm precisa estar ativo no projeto de teste).
  if (!data.session) {
    const login = await client.auth.signInWithPassword({ email, password: SENHA });
    if (login.error) {
      throw new Error(
        `Não foi possível autenticar ${prefixo}. Habilite auto-confirm no projeto de teste. (${login.error.message})`,
      );
    }
  }

  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error(`Sem usuário após signUp para ${prefixo}`);
  return { client, userId: userData.user.id, email };
}

describe("Segurança RLS — user_roles", () => {
  let alice: Usuario;
  let bob: Usuario;
  const anon = criarCliente();

  beforeAll(async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("VITE_SUPABASE_URL/PUBLISHABLE_KEY ausentes no ambiente de teste.");
    }
    alice = await criarUsuario("alice");
    bob = await criarUsuario("bob");
  }, 30_000);

  afterAll(async () => {
    await alice?.client.auth.signOut();
    await bob?.client.auth.signOut();
  });

  it("usuário comum NÃO consegue se auto-promover a admin", async () => {
    const { error } = await alice.client
      .from("user_roles")
      .insert({ user_id: alice.userId, role: "admin" });
    expect(error, "INSERT em user_roles deve ser bloqueado por RLS").not.toBeNull();
  });

  it("usuário comum NÃO consegue inserir papel para outro usuário", async () => {
    const { error } = await alice.client
      .from("user_roles")
      .insert({ user_id: bob.userId, role: "admin" });
    expect(error).not.toBeNull();
  });

  it("usuário comum NÃO consegue UPDATE em user_roles", async () => {
    const { data, error } = await alice.client
      .from("user_roles")
      .update({ role: "admin" })
      .eq("user_id", alice.userId)
      .select();
    // Pode retornar erro OU array vazio (RLS filtra). Ambos são seguros.
    expect(error !== null || (data?.length ?? 0) === 0).toBe(true);
  });

  it("usuário comum NÃO consegue DELETE em user_roles", async () => {
    const { data, error } = await alice.client
      .from("user_roles")
      .delete()
      .eq("user_id", alice.userId)
      .select();
    expect(error !== null || (data?.length ?? 0) === 0).toBe(true);
  });

  it("usuário comum NÃO consegue ler papel de outro usuário", async () => {
    const { data, error } = await alice.client
      .from("user_roles")
      .select("*")
      .eq("user_id", bob.userId);
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("usuário comum consegue ler APENAS o próprio papel", async () => {
    const { data, error } = await alice.client
      .from("user_roles")
      .select("user_id, role")
      .eq("user_id", alice.userId);
    expect(error).toBeNull();
    expect(data?.every((r) => r.user_id === alice.userId)).toBe(true);
  });

  it("anônimo (sem sessão) NÃO consegue ler user_roles", async () => {
    const { data, error } = await anon.from("user_roles").select("*").limit(1);
    expect(error !== null || (data?.length ?? 0) === 0).toBe(true);
  });

  it("anônimo NÃO consegue inserir em user_roles", async () => {
    const { error } = await anon
      .from("user_roles")
      .insert({ user_id: alice.userId, role: "admin" });
    expect(error).not.toBeNull();
  });
});

describe("Segurança RLS — profiles", () => {
  let alice: Usuario;
  let bob: Usuario;

  beforeAll(async () => {
    alice = await criarUsuario("alice-p");
    bob = await criarUsuario("bob-p");
  }, 30_000);

  afterAll(async () => {
    await alice?.client.auth.signOut();
    await bob?.client.auth.signOut();
  });

  it("usuário NÃO consegue ler perfil de outro usuário", async () => {
    const { data, error } = await alice.client
      .from("profiles")
      .select("*")
      .eq("id", bob.userId);
    expect(error).toBeNull();
    expect(data ?? []).toHaveLength(0);
  });

  it("usuário NÃO consegue alterar perfil de outro usuário", async () => {
    const { data, error } = await alice.client
      .from("profiles")
      .update({ nome_completo: "HACKEADO" })
      .eq("id", bob.userId)
      .select();
    expect(error !== null || (data?.length ?? 0) === 0).toBe(true);

    // Confirma que o perfil de Bob não foi alterado (lendo com a sessão dele).
    const { data: bobProfile } = await bob.client
      .from("profiles")
      .select("nome_completo")
      .eq("id", bob.userId)
      .maybeSingle();
    expect(bobProfile?.nome_completo).not.toBe("HACKEADO");
  });

  it("usuário consegue ler/atualizar o próprio perfil", async () => {
    const novoNome = `Alice Teste ${Date.now()}`;
    const { error } = await alice.client
      .from("profiles")
      .update({ nome_completo: novoNome })
      .eq("id", alice.userId);
    expect(error).toBeNull();

    const { data } = await alice.client
      .from("profiles")
      .select("nome_completo")
      .eq("id", alice.userId)
      .maybeSingle();
    expect(data?.nome_completo).toBe(novoNome);
  });
});
