import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

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
    papel: "admin",
    perfil: { nome_completo: "Admin Teste" },
    isAdmin: true,
  }),
  rotuloPapel: {
    admin: "Administrador",
    psicologo: "Psicólogo",
    terapeuta: "Terapeuta",
    familia: "Família",
  },
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
  beforeEach(() => vi.clearAllMocks());

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

describe("BarraLateral — links de navegação", () => {
  const itens: Array<[string, string]> = [
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
    ["Usuários", "/usuarios"],
    ["Configurações", "/configuracoes"],
    ["Logs / Auditoria", "/logs"],
  ];

  it.each(itens)("link '%s' aponta para %s", (label, rota) => {
    renderComRotas(<BarraLateral />);
    const link = screen.getByRole("link", { name: new RegExp(label, "i") });
    expect(link.getAttribute("href")).toBe(rota);
  });
});
