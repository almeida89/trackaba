import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BookMarked, Library, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CartaoPrograma } from "./CartaoPrograma";
import { BIBLIOTECA_PROGRAMAS, PROGRAMAS_CRIANCA_INICIAIS } from "./dadosProgramas";
import { DialogoPrograma } from "./DialogoPrograma";
import { Programa } from "./tiposProgramas";

interface Props {
  criancaId: string;
  criancaNome: string;
}

export function ProgramasCrianca({ criancaId, criancaNome }: Props) {
  const [biblioteca, setBiblioteca] = useState<Programa[]>(BIBLIOTECA_PROGRAMAS);
  const [programasCrianca, setProgramasCrianca] = useState<Programa[]>(PROGRAMAS_CRIANCA_INICIAIS);
  const [busca, setBusca] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState<string>("todas");
  const [aba, setAba] = useState<"crianca" | "biblioteca">("crianca");
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [programaEdicao, setProgramaEdicao] = useState<Programa | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const programasDaCrianca = useMemo(
    () =>
      programasCrianca
        .filter((p) => p.criancaId === criancaId)
        .sort((a, b) => a.ordem - b.ordem),
    [programasCrianca, criancaId],
  );

  function filtrar(lista: Programa[]) {
    return lista.filter((p) => {
      const correspondeBusca =
        !busca ||
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.objetivoGeral.toLowerCase().includes(busca.toLowerCase());
      const correspondeDisciplina = filtroDisciplina === "todas" || p.disciplina === filtroDisciplina;
      return correspondeBusca && correspondeDisciplina;
    });
  }

  const bibliotecaFiltrada = filtrar(biblioteca);
  const programasFiltradosCrianca = filtrar(programasDaCrianca);
  const filtrosAtivos = busca.trim() !== "" || filtroDisciplina !== "todas";

  function limparFiltros() {
    setBusca("");
    setFiltroDisciplina("todas");
  }

  function aoArrastarFim(evento: DragEndEvent) {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;
    const indiceAntigo = programasDaCrianca.findIndex((p) => p.id === active.id);
    const indiceNovo = programasDaCrianca.findIndex((p) => p.id === over.id);
    if (indiceAntigo === -1 || indiceNovo === -1) return;
    const reordenado = arrayMove(programasDaCrianca, indiceAntigo, indiceNovo).map((p, i) => ({
      ...p,
      ordem: i,
    }));
    const outros = programasCrianca.filter((p) => p.criancaId !== criancaId);
    setProgramasCrianca([...outros, ...reordenado]);
    toast.success("Ordem dos programas atualizada");
  }

  function clonarParaCrianca(programa: Programa) {
    const novo: Programa = {
      ...programa,
      id: `pc-${Date.now()}`,
      criancaId,
      baseadoEm: programa.id,
      criadoEm: new Date().toISOString(),
      criadoPor: "Profissional",
      ordem: programasDaCrianca.length,
      status: "ativo",
    };
    setProgramasCrianca((lista) => [...lista, novo]);
    setAba("crianca");
    toast.success(`"${programa.nome}" adicionado a ${criancaNome}`);
  }

  function clonarPrograma(programa: Programa) {
    const novo: Programa = {
      ...programa,
      id: `pc-${Date.now()}`,
      nome: `${programa.nome} (cópia)`,
      baseadoEm: programa.id,
      criadoEm: new Date().toISOString(),
      criancaId,
      ordem: programasDaCrianca.length,
    };
    setProgramasCrianca((l) => [...l, novo]);
    toast.success("Programa clonado");
  }

  function abrirNovo() {
    setProgramaEdicao(null);
    setDialogoAberto(true);
  }

  function abrirEdicao(programa: Programa) {
    setProgramaEdicao(programa);
    setDialogoAberto(true);
  }

  function salvarPrograma(programa: Programa) {
    const ehNovo = programa.id.startsWith("novo-");
    if (ehNovo) {
      const novo: Programa = {
        ...programa,
        id: `pc-${Date.now()}`,
        criancaId,
        ordem: programasDaCrianca.length,
      };
      setProgramasCrianca((l) => [...l, novo]);
      toast.success("Programa criado para a criança");
    } else if (programa.criancaId) {
      setProgramasCrianca((l) => l.map((p) => (p.id === programa.id ? programa : p)));
      toast.success("Programa atualizado");
    } else {
      setBiblioteca((l) => l.map((p) => (p.id === programa.id ? programa : p)));
      toast.success("Programa da biblioteca atualizado");
    }
  }

  function remover(programa: Programa) {
    if (programa.criancaId) {
      setProgramasCrianca((l) => l.filter((p) => p.id !== programa.id));
    } else {
      setBiblioteca((l) => l.filter((p) => p.id !== programa.id));
    }
    toast.success("Programa removido");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-heading font-semibold text-foreground">
            Programas de {criancaNome}
          </h3>
          <p className="text-sm text-muted-foreground">
            {programasDaCrianca.length} programa(s) ativo(s) • Importe da biblioteca ou crie um novo
          </p>
        </div>
        <Button onClick={abrirNovo} className="gap-2">
          <Plus className="h-4 w-4" /> Novo programa
        </Button>
      </div>

      <Card className="p-3 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar em ambas as abas..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroDisciplina} onValueChange={setFiltroDisciplina}>
          <SelectTrigger className="w-full md:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as disciplinas</SelectItem>
            <SelectItem value="ABA">ABA</SelectItem>
            <SelectItem value="Fonoaudiologia">Fonoaudiologia</SelectItem>
            <SelectItem value="Terapia Ocupacional">Terapia Ocupacional</SelectItem>
            <SelectItem value="Psicologia">Psicologia</SelectItem>
            <SelectItem value="Psicopedagogia">Psicopedagogia</SelectItem>
          </SelectContent>
        </Select>
        {filtrosAtivos && (
          <Button
            variant="ghost"
            size="sm"
            onClick={limparFiltros}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" /> Limpar
          </Button>
        )}
      </Card>

      {filtrosAtivos && (
        <p className="text-xs text-muted-foreground -mt-1">
          Filtros aplicados a ambas as abas •{" "}
          <span className="font-medium text-foreground">{programasFiltradosCrianca.length}</span> da criança •{" "}
          <span className="font-medium text-foreground">{bibliotecaFiltrada.length}</span> na biblioteca
        </p>
      )}

      <Tabs value={aba} onValueChange={(v) => setAba(v as "crianca" | "biblioteca")}>
        <TabsList>
          <TabsTrigger value="crianca" className="gap-2">
            <BookMarked className="h-4 w-4" />
            Da criança ({filtrosAtivos ? `${programasFiltradosCrianca.length}/${programasDaCrianca.length}` : programasDaCrianca.length})
          </TabsTrigger>
          <TabsTrigger value="biblioteca" className="gap-2">
            <Library className="h-4 w-4" />
            Biblioteca ({filtrosAtivos ? `${bibliotecaFiltrada.length}/${biblioteca.length}` : biblioteca.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crianca" className="mt-4">
          {programasFiltradosCrianca.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <p className="text-muted-foreground mb-3">
                Nenhum programa atribuído a {criancaNome} ainda.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setAba("biblioteca")}>
                  <Library className="h-4 w-4 mr-2" /> Importar da biblioteca
                </Button>
                <Button onClick={abrirNovo}>
                  <Plus className="h-4 w-4 mr-2" /> Criar novo
                </Button>
              </div>
            </Card>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={aoArrastarFim}>
              <SortableContext
                items={programasFiltradosCrianca.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {programasFiltradosCrianca.map((p) => (
                    <CartaoPrograma
                      key={p.id}
                      programa={p}
                      arrastavel
                      aoClicar={abrirEdicao}
                      aoClonar={clonarPrograma}
                      aoEditar={abrirEdicao}
                      aoRemover={remover}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>

        <TabsContent value="biblioteca" className="mt-4">
          {bibliotecaFiltrada.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <p className="text-muted-foreground">Nenhum programa na biblioteca corresponde aos filtros.</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {bibliotecaFiltrada.map((p) => (
                  <CartaoPrograma
                    key={p.id}
                    programa={p}
                    aoClicar={abrirEdicao}
                    aoClonar={clonarParaCrianca}
                    aoEditar={abrirEdicao}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Use o menu (⋮) → Clonar para adicionar um programa da biblioteca a {criancaNome}.
              </p>
            </>
          )}
        </TabsContent>
      </Tabs>

      <DialogoPrograma
        aberto={dialogoAberto}
        programa={programaEdicao}
        aoFechar={() => setDialogoAberto(false)}
        aoSalvar={salvarPrograma}
      />
    </div>
  );
}
