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
  UserCog,
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

interface ItemMenu {
  titulo: string;
  url: string;
  icone: typeof LayoutDashboard;
  somenteAdmin?: boolean;
}

interface SecaoMenu {
  titulo: string;
  itens: ItemMenu[];
}

const secoesMenu: SecaoMenu[] = [
  {
    titulo: "Geral",
    itens: [
      { titulo: "Dashboard", url: "/", icone: LayoutDashboard },
    ],
  },
  {
    titulo: "Clínico",
    itens: [
      { titulo: "Crianças", url: "/criancas", icone: Baby },
      { titulo: "Sessões", url: "/sessoes", icone: ClipboardList },
      { titulo: "Programas", url: "/programas", icone: BookOpen },
      { titulo: "Avaliações", url: "/avaliacoes", icone: FileCheck },
      { titulo: "Agenda", url: "/agenda", icone: Calendar },
    ],
  },
  {
    titulo: "Relacionamento",
    itens: [
      { titulo: "Família", url: "/familia", icone: Heart },
      { titulo: "Escola", url: "/escola", icone: GraduationCap },
    ],
  },
  {
    titulo: "Análise",
    itens: [
      { titulo: "Relatórios", url: "/relatorios", icone: FileText },
      { titulo: "Gráficos", url: "/graficos", icone: BarChart3 },
    ],
  },
  {
    titulo: "Administração",
    itens: [
      { titulo: "Funcionários", url: "/funcionarios", icone: Users },
      { titulo: "Usuários", url: "/usuarios", icone: UserCog, somenteAdmin: true },
      { titulo: "Automações", url: "/automacoes", icone: Zap },
      { titulo: "Configurações", url: "/configuracoes", icone: Settings },
      { titulo: "Logs / Auditoria", url: "/logs", icone: Shield },
    ],
  },
];

export function BarraLateral() {
  const [recolhida, setRecolhida] = useState(false);
  const { user, sair } = useAuth();
  const { papel, perfil, isAdmin } = useUserRole();
  const itensVisiveis = itensMenu.filter((i) => !i.somenteAdmin || isAdmin);
  const navigate = useNavigate();

  const aoSair = async () => {
    await sair();
    toast.success("Sessão encerrada.");
    navigate("/auth", { replace: true });
  };

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
          {itensVisiveis.map((item) => (
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

        {/* User + Footer */}
        <div className="border-t border-sidebar-border shrink-0">
          {!recolhida ? (
            <div className="px-3 py-3 space-y-2">
              <div className="px-2">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {perfil?.nome_completo || user?.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {papel && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide border-sidebar-border text-sidebar-foreground/70">
                      {rotuloPapel[papel]}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={aoSair}
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </Button>
              <p className="px-2 text-[10px] text-sidebar-foreground/40">© 2026 TrackABA</p>
            </div>
          ) : (
            <div className="py-3 flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={aoSair}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
