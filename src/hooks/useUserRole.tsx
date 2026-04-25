import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "psicologo" | "coordenador" | "recepcionista" | "familia";

export const rotuloPapel: Record<AppRole, string> = {
  admin: "Administrador",
  psicologo: "Psicólogo",
  coordenador: "Coordenador",
  recepcionista: "Recepcionista",
  familia: "Família",
};

interface PerfilUsuario {
  nome_completo: string;
  telefone: string | null;
  avatar_url: string | null;
}

export function useUserRole() {
  const { user } = useAuth();
  const [papel, setPapel] = useState<AppRole | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user) {
      setPapel(null);
      setPerfil(null);
      setCarregando(false);
      return;
    }

    let ativo = true;
    setCarregando(true);

    Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("nome_completo, telefone, avatar_url").eq("id", user.id).maybeSingle(),
    ]).then(([rolRes, perfRes]) => {
      if (!ativo) return;
      setPapel((rolRes.data?.role as AppRole) ?? "familia");
      setPerfil(perfRes.data ?? null);
      setCarregando(false);
    });

    return () => {
      ativo = false;
    };
  }, [user]);

  return { papel, perfil, carregando, isAdmin: papel === "admin" };
}
