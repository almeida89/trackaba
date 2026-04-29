import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

/**
 * Bloqueia rotas internas (admin/equipe). Famílias são redirecionadas
 * para o portal próprio em /familia/portal.
 */
export function RotaEquipe({ children }: { children: ReactNode }) {
  const { user, carregando: carregandoAuth } = useAuth();
  const { papel, carregando: carregandoPapel } = useUserRole();

  if (carregandoAuth || carregandoPapel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (papel === "familia") return <Navigate to="/familia/portal" replace />;

  return <>{children}</>;
}
