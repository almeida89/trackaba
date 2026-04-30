import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<{ erro?: string }>;
  cadastrar: (
    email: string,
    senha: string,
    nomeCompleto: string,
    telefone?: string,
  ) => Promise<{ erro?: string; mensagem?: string }>;
  sair: () => Promise<void>;
  recuperarSenha: (email: string) => Promise<{ erro?: string; mensagem?: string }>;
  reenviarConfirmacao: (email: string) => Promise<{ erro?: string; mensagem?: string }>;
  atualizarSenha: (novaSenha: string) => Promise<{ erro?: string; mensagem?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function traduzirErro(msg: string | undefined): string {
  if (!msg) return "Erro desconhecido. Tente novamente.";
  const m = msg.toLowerCase().trim();

  // Senha fraca / vazada (verificar ANTES de outras regras de senha)
  if (
    m.includes("known to be weak") ||
    m.includes("easy to guess") ||
    m.includes("weak password") ||
    m.includes("password is too weak") ||
    m.includes("password is known to be weak") ||
    (m.includes("weak") && m.includes("password")) ||
    (m.includes("guess") && m.includes("password"))
  ) {
    return "Senha muito fraca e fácil de adivinhar. Escolha outra com ao menos 8 caracteres, misturando maiúsculas, minúsculas, números e símbolos.";
  }
  if (
    m.includes("pwned") ||
    m.includes("compromised") ||
    m.includes("leaked") ||
    m.includes("data breach") ||
    m.includes("have i been pwned") ||
    m.includes("hibp")
  ) {
    return "Esta senha apareceu em vazamentos públicos de dados. Escolha uma senha diferente para sua segurança.";
  }

  // Login / cadastro
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed") || m.includes("email address not confirmed"))
    return "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada (e a pasta de spam).";
  if (m.includes("user already registered") || m.includes("already been registered") || m.includes("already exists"))
    return "Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.";
  if (m.includes("signup") && m.includes("disabled"))
    return "Cadastros estão temporariamente desativados. Tente novamente mais tarde.";

  // Regras de tamanho/complexidade
  if (m.includes("password should be at least") || m.includes("password is too short") || m.includes("at least 8"))
    return "A senha deve ter pelo menos 8 caracteres.";
  if (m.includes("password should contain") || m.includes("password must contain"))
    return "A senha não atende aos requisitos. Use letras maiúsculas, minúsculas, números e símbolos.";

  // Limites e rede
  if (m.includes("rate limit") || m.includes("too many requests") || m.includes("over_request_rate_limit"))
    return "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
  if (m.includes("network") || m.includes("failed to fetch"))
    return "Falha de conexão. Verifique sua internet e tente novamente.";

  // Atualização de senha
  if (m.includes("same as the old password") || m.includes("new password should be different"))
    return "A nova senha deve ser diferente da anterior.";

  // Tokens
  if (m.includes("token has expired") || m.includes("invalid token") || m.includes("otp expired") || m.includes("expired"))
    return "Link expirado ou inválido. Solicite um novo e-mail de recuperação.";

  // Usuário / e-mail
  if (m.includes("user not found")) return "Não encontramos uma conta com esse e-mail.";
  if (m.includes("email") && (m.includes("invalid") || m.includes("not valid")))
    return "E-mail inválido.";

  return msg;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // 1. Listener PRIMEIRO (síncrono)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, novaSessao) => {
      setSession(novaSessao);
      setUser(novaSessao?.user ?? null);
    });

    // 2. Buscar sessão existente DEPOIS
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setCarregando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const entrar: AuthContextValue["entrar"] = async (email, senha) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return { erro: traduzirErro(error.message) };
    return {};
  };

  const cadastrar: AuthContextValue["cadastrar"] = async (email, senha, nomeCompleto, telefone) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: redirectUrl,
        data: { nome_completo: nomeCompleto, telefone: telefone ?? null },
      },
    });
    if (error) return { erro: traduzirErro(error.message) };
    return { mensagem: "Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar." };
  };

  const sair = async () => {
    await supabase.auth.signOut();
  };

  const recuperarSenha: AuthContextValue["recuperarSenha"] = async (email) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return { erro: traduzirErro(error.message) };
    return {
      mensagem:
        "Se este e-mail estiver cadastrado, enviamos um link para redefinir a senha. Verifique sua caixa de entrada e a pasta de spam.",
    };
  };

  const reenviarConfirmacao: AuthContextValue["reenviarConfirmacao"] = async (email) => {
    const emailRedirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo },
    });
    if (error) return { erro: traduzirErro(error.message) };
    return { mensagem: "E-mail de confirmação reenviado. Verifique sua caixa de entrada." };
  };

  const atualizarSenha: AuthContextValue["atualizarSenha"] = async (novaSenha) => {
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) return { erro: traduzirErro(error.message) };
    return { mensagem: "Senha atualizada com sucesso." };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        carregando,
        entrar,
        cadastrar,
        sair,
        recuperarSenha,
        reenviarConfirmacao,
        atualizarSenha,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
