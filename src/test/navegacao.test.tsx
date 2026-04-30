import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import type { AppRole } from "@/hooks/useUserRole";

let papelMock: AppRole = "admin";
const roleLabel: Record<AppRole, string> = {
  admin: "Administrador",
  psicologo: "Psicólogo",
  coordenador: "Coordenador",
  recepcionista: "Recepcionista",
  familia: "Família",
};

// Mocks de hooks que dependem de Supabase / Auth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "teste@trackaba.com" },
    sair: vi.fn().mockResolvedValue(undefined),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/useUserRole", () => ({
  useUserRole: () => ({
    papel: papelMock,
    perfil: { nome_completo: `${roleLabel[papelMock]} Teste` },
    isAdmin: papelMock === "admin",
  }),
  rotuloPapel: roleLabel,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import PainelPrincipal from "@/paginas/PainelPrincipal";
import { BarraLateral } from "@/componentes/BarraLateral";

// Componente espião que mostra a rota atual
function EspiaoRota() {
  const location = useLocation();
  return <div data-testid="rota-atual">{location.pathname}</div>;
}

const renderComRotas = (ui: React.ReactNode, inicial = "/") =>
  render(
    <MemoryRouter initialEntries={[inicial]}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              {ui}
              <EspiaoRota />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe("PainelPrincipal — botões de Acesso Rápido", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    papelMock = "admin";
  });

  const atalhos: Array<[string, string]> = [
    ["Nova Criança", "/criancas"],
    ["Registrar Sessão", "/sessoes"],
    ["Nova Avaliação", "/avaliacoes"],
    ["Agendar", "/agenda"],
  ];

  it.each(atalhos)("'%s' navega para %s", (label, rota) => {
    renderComRotas(<PainelPrincipal />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(label, "i") }));
    expect(screen.getByTestId("rota-atual").textContent).toBe(rota);
  });
});

describe("BarraLateral — links de navegação por papel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    papelMock = "admin";
  });

  const itensComuns: Array<[string, string]> = [
    ["Dashboard", "/"],
    ["Crianças", "/criancas"],
    ["Funcionários", "/funcionarios"],
    ["Sessões", "/sessoes"],
    ["Programas", "/programas"],
    ["Avaliações", "/avaliacoes"],
    ["Agenda", "/agenda"],
    ["Escola", "/escola"],
    ["Família", "/familia"],
    ["Relatórios", "/relatorios"],
    ["Gráficos", "/graficos"],
    ["Automações", "/automacoes"],
    ["Configurações", "/configuracoes"],
    ["Logs / Auditoria", "/logs"],
  ];

  it.each(["admin", "psicologo", "coordenador", "recepcionista", "familia"] as const)(
    "exibe links comuns para %s",
    (papel) => {
      papelMock = papel;
      renderComRotas(<BarraLateral />);

      for (const [label, rota] of itensComuns) {
        const link = screen.getByRole("link", { name: new RegExp(label, "i") });
        expect(link.getAttribute("href")).toBe(rota);
      }
    }
  );

  it("exibe link 'Usuários' para admin", () => {
    papelMock = "admin";
    renderComRotas(<BarraLateral />);
    const link = screen.getByRole("link", { name: /usuários/i });
    expect(link.getAttribute("href")).toBe("/usuarios");
  });

  it.each(["psicologo", "coordenador", "recepcionista", "familia"] as const)(
    "não exibe link 'Usuários' para %s",
    (papel) => {
      papelMock = papel;
      renderComRotas(<BarraLateral />);
      expect(screen.queryByRole("link", { name: /usuários/i })).not.toBeInTheDocument();
    }
  );
});
