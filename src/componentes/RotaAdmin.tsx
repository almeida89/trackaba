import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

export function RotaAdmin({ children }: { children: ReactNode }) {
  const { user, carregando: carregandoAuth } = useAuth();
  const { isAdmin, carregando } = useUserRole();

  if (carregandoAuth || carregando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="p-10 text-center max-w-lg mx-auto">
          <ShieldAlert className="h-10 w-10 mx-auto text-warning mb-3" />
          <h2 className="text-xl font-semibold text-foreground">Acesso restrito</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Esta área é exclusiva para administradores da clínica.
          </p>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
}
