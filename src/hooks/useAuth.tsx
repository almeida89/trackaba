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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function traduzirErro(msg: string | undefined): string {
  if (!msg) return "Erro desconhecido. Tente novamente.";
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("user already registered")) return "Este e-mail já está cadastrado.";
  if (m.includes("password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos.";
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

  return (
    <AuthContext.Provider value={{ user, session, carregando, entrar, cadastrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
