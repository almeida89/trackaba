import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LayoutPrincipal } from "@/componentes/LayoutPrincipal";
import PainelPrincipal from "@/paginas/PainelPrincipal";
import ListaCriancas from "@/paginas/ListaCriancas";
import PastaCrianca from "@/paginas/PastaCrianca";
import PaginaModulo from "@/paginas/PaginaModulo";
import PaginaAgenda from "@/paginas/PaginaAgenda";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LayoutPrincipal>
          <Routes>
            <Route path="/" element={<PainelPrincipal />} />
            <Route path="/criancas" element={<ListaCriancas />} />
            <Route path="/criancas/:id" element={<PastaCrianca />} />
            <Route path="/funcionarios" element={<PaginaModulo />} />
            <Route path="/sessoes" element={<PaginaModulo />} />
            <Route path="/programas" element={<PaginaModulo />} />
            <Route path="/avaliacoes" element={<PaginaModulo />} />
            <Route path="/agenda" element={<PaginaAgenda />} />
            <Route path="/escola" element={<PaginaModulo />} />
            <Route path="/familia" element={<PaginaModulo />} />
            <Route path="/relatorios" element={<PaginaModulo />} />
            <Route path="/graficos" element={<PaginaModulo />} />
            <Route path="/automacoes" element={<PaginaModulo />} />
            <Route path="/configuracoes" element={<PaginaModulo />} />
            <Route path="/logs" element={<PaginaModulo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LayoutPrincipal>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
