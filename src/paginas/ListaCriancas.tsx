import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const criancasMock = [
  { id: "1", nome: "Lucas Mendes", idade: 5, diagnostico: "TEA Nível 1", status: "Ativo", profissional: "Dra. Ana Souza", ultimaSessao: "15/04/2026" },
  { id: "2", nome: "Maria Silva", idade: 7, diagnostico: "TEA Nível 2", status: "Ativo", profissional: "Dr. Carlos Lima", ultimaSessao: "14/04/2026" },
  { id: "3", nome: "Pedro Rocha", idade: 4, diagnostico: "TEA Nível 1", status: "Ativo", profissional: "Dra. Ana Souza", ultimaSessao: "15/04/2026" },
  { id: "4", nome: "Julia Santos", idade: 6, diagnostico: "TDAH", status: "Em Avaliação", profissional: "Dr. Paulo Dias", ultimaSessao: "12/04/2026" },
  { id: "5", nome: "Gabriel Oliveira", idade: 8, diagnostico: "TEA Nível 2", status: "Ativo", profissional: "Dra. Fernanda Costa", ultimaSessao: "15/04/2026" },
  { id: "6", nome: "Sofia Almeida", idade: 3, diagnostico: "Atraso no Desenvolvimento", status: "Novo", profissional: "Dra. Ana Souza", ultimaSessao: "—" },
];

const coresStatus: Record<string, string> = {
  Ativo: "bg-status-success/15 text-status-success border-status-success/30",
  "Em Avaliação": "bg-status-warning/15 text-status-warning border-status-warning/30",
  Novo: "bg-status-info/15 text-status-info border-status-info/30",
};

export default function ListaCriancas() {
  const [busca, setBusca] = useState("");
  const navegar = useNavigate();

  const criancasFiltradas = criancasMock.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Crianças</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {criancasMock.length} crianças cadastradas
          </p>
        </div>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Nova Criança
        </Button>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filtros
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {criancasFiltradas.map((crianca) => (
          <button
            key={crianca.id}
            onClick={() => navegar(`/criancas/${crianca.id}`)}
            className="rounded-xl border border-border bg-card p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Baby className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {crianca.nome}
                  </h3>
                  <Badge
                    variant="outline"
                    className={coresStatus[crianca.status] || ""}
                  >
                    {crianca.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {crianca.idade} anos • {crianca.diagnostico}
                </p>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>{crianca.profissional}</span>
                  <span>Última sessão: {crianca.ultimaSessao}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
