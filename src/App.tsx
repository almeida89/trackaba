import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutPrincipal } from "@/componentes/LayoutPrincipal";
import { AuthProvider } from "@/hooks/useAuth";
import { RotaProtegida } from "@/componentes/RotaProtegida";
import { RotaAdmin } from "@/componentes/RotaAdmin";
import PaginaAuth from "@/paginas/PaginaAuth";
import PaginaUsuarios from "@/paginas/PaginaUsuarios";
import PainelPrincipal from "@/paginas/PainelPrincipal";
import ListaCriancas from "@/paginas/ListaCriancas";
import PastaCrianca from "@/paginas/PastaCrianca";
import PaginaModulo from "@/paginas/PaginaModulo";
import PaginaAgenda from "@/paginas/PaginaAgenda";
import PaginaGraficos from "@/paginas/PaginaGraficos";
import PaginaProgramas from "@/paginas/PaginaProgramas";
import PaginaSessoes from "@/paginas/PaginaSessoes";
import PaginaEscola from "@/paginas/PaginaEscola";
import PaginaFuncionarios from "@/paginas/PaginaFuncionarios";
import PaginaFamilia from "@/paginas/PaginaFamilia";
import PaginaRelatorios from "@/paginas/PaginaRelatorios";
import PaginaAvaliacoes from "@/paginas/PaginaAvaliacoes";
import PaginaConfiguracoes from "@/paginas/PaginaConfiguracoes";
import PaginaLogs from "@/paginas/PaginaLogs";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const RotasInternas = () => (
  <LayoutPrincipal>
    <Routes>
      <Route path="/" element={<PainelPrincipal />} />
      <Route path="/criancas" element={<ListaCriancas />} />
      <Route path="/criancas/:id" element={<PastaCrianca />} />
      <Route path="/funcionarios" element={<PaginaFuncionarios />} />
      <Route path="/sessoes" element={<PaginaSessoes />} />
      <Route path="/programas" element={<PaginaProgramas />} />
      <Route path="/avaliacoes" element={<PaginaAvaliacoes />} />
      <Route path="/agenda" element={<PaginaAgenda />} />
      <Route path="/escola" element={<PaginaEscola />} />
      <Route path="/familia" element={<PaginaFamilia />} />
      <Route path="/relatorios" element={<PaginaRelatorios />} />
      <Route path="/graficos" element={<PaginaGraficos />} />
      <Route path="/automacoes" element={<PaginaModulo />} />
      <Route path="/usuarios" element={<RotaAdmin><PaginaUsuarios /></RotaAdmin>} />
      <Route path="/configuracoes" element={<PaginaConfiguracoes />} />
      <Route path="/logs" element={<PaginaLogs />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </LayoutPrincipal>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<PaginaAuth />} />
            <Route
              path="*"
              element={
                <RotaProtegida>
                  <RotasInternas />
                </RotaProtegida>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
