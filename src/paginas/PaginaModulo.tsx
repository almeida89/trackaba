import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const nomesPaginas: Record<string, string> = {
  "/funcionarios": "Funcionários",
  "/sessoes": "Sessões",
  "/programas": "Programas",
  "/avaliacoes": "Avaliações",
  "/agenda": "Agenda",
  "/escola": "Escola",
  "/familia": "Família",
  "/relatorios": "Relatórios",
  "/graficos": "Gráficos",
  "/automacoes": "Automações",
  "/configuracoes": "Configurações",
  "/logs": "Logs / Auditoria",
};

export default function PaginaModulo() {
  const { pathname } = useLocation();
  const titulo = nomesPaginas[pathname] || "Módulo";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">{titulo}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Este módulo está em desenvolvimento
        </p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-border bg-card">
        <div className="p-4 rounded-full bg-primary/10 mb-4">
          <Construction className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-heading font-semibold text-foreground text-lg">
          {titulo}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
          O módulo de <strong>{titulo.toLowerCase()}</strong> está sendo construído.
          Em breve você poderá gerenciar tudo por aqui.
        </p>
      </div>
    </div>
  );
}
