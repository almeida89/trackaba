import {
  LayoutDashboard,
  Baby,
  Users,
  ClipboardList,
  BookOpen,
  FileCheck,
  Calendar,
  GraduationCap,
  Heart,
  FileText,
  BarChart3,
  Zap,
  Settings,
  Shield,
  ChevronLeft,
  Menu,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, rotuloPapel } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const itensMenu = [
  { titulo: "Dashboard", url: "/", icone: LayoutDashboard },
  { titulo: "Crianças", url: "/criancas", icone: Baby },
  { titulo: "Funcionários", url: "/funcionarios", icone: Users },
  { titulo: "Sessões", url: "/sessoes", icone: ClipboardList },
  { titulo: "Programas", url: "/programas", icone: BookOpen },
  { titulo: "Avaliações", url: "/avaliacoes", icone: FileCheck },
  { titulo: "Agenda", url: "/agenda", icone: Calendar },
  { titulo: "Escola", url: "/escola", icone: GraduationCap },
  { titulo: "Família", url: "/familia", icone: Heart },
  { titulo: "Relatórios", url: "/relatorios", icone: FileText },
  { titulo: "Gráficos", url: "/graficos", icone: BarChart3 },
  { titulo: "Automações", url: "/automacoes", icone: Zap },
  { titulo: "Configurações", url: "/configuracoes", icone: Settings },
  { titulo: "Logs / Auditoria", url: "/logs", icone: Shield },
];

export function BarraLateral() {
  const [recolhida, setRecolhida] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-card p-2 shadow-md border border-border"
        onClick={() => setRecolhida((v) => !v)}
        aria-label="Menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Backdrop mobile */}
      {!recolhida && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setRecolhida(true)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border",
          recolhida ? "-translate-x-full lg:translate-x-0 lg:w-[68px]" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border shrink-0">
          {!recolhida && (
            <span className="font-heading text-xl font-bold text-sidebar-primary tracking-tight">
              TrackABA
            </span>
          )}
          <button
            onClick={() => setRecolhida((v) => !v)}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
            aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 text-sidebar-foreground transition-transform",
                recolhida && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {itensMenu.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                recolhida && "justify-center px-0"
              )}
              activeClassName="bg-sidebar-accent text-sidebar-primary"
            >
              <item.icone className="h-[18px] w-[18px] shrink-0" />
              {!recolhida && <span>{item.titulo}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {!recolhida && (
          <div className="px-4 py-3 border-t border-sidebar-border text-xs text-sidebar-foreground/50">
            © 2026 TrackABA
          </div>
        )}
      </aside>
    </>
  );
}
