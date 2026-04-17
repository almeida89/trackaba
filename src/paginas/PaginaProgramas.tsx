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
import { BookMarked, Library, Plus, Search, User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CartaoPrograma } from "@/componentes/programas/CartaoPrograma";
import { BIBLIOTECA_PROGRAMAS, PROGRAMAS_CRIANCA_INICIAIS } from "@/componentes/programas/dadosProgramas";
import { DialogoPrograma } from "@/componentes/programas/DialogoPrograma";
import { Programa } from "@/componentes/programas/tiposProgramas";

const CRIANCAS = [
  { id: "1", nome: "Lucas Andrade" },
  { id: "2", nome: "Sofia Martins" },
  { id: "3", nome: "Pedro Henrique" },
];

export default function PaginaProgramas() {
  const [biblioteca, setBiblioteca] = useState<Programa[]>(BIBLIOTECA_PROGRAMAS);
  const [programasCrianca, setProgramasCrianca] = useState<Programa[]>(PROGRAMAS_CRIANCA_INICIAIS);
  const [criancaSelecionada, setCriancaSelecionada] = useState<string>("1");
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
        .filter((p) => p.criancaId === criancaSelecionada)
        .sort((a, b) => a.ordem - b.ordem),
    [programasCrianca, criancaSelecionada],
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
    const outros = programasCrianca.filter((p) => p.criancaId !== criancaSelecionada);
    setProgramasCrianca([...outros, ...reordenado]);
    toast.success("Ordem dos programas atualizada");
  }

  function clonarParaCrianca(programa: Programa) {
    const novo: Programa = {
      ...programa,
      id: `pc-${Date.now()}`,
      criancaId: criancaSelecionada,
      baseadoEm: programa.id,
      criadoEm: new Date().toISOString(),
      criadoPor: "Profissional",
      ordem: programasDaCrianca.length,
      status: "ativo",
    };
    setProgramasCrianca((lista) => [...lista, novo]);
    setAba("crianca");
    toast.success(`"${programa.nome}" adicionado à criança`);
  }

  function clonarPrograma(programa: Programa) {
    const novo: Programa = {
      ...programa,
      id: `${programa.criancaId ? "pc" : "bib"}-${Date.now()}`,
      nome: `${programa.nome} (cópia)`,
      baseadoEm: programa.id,
      criadoEm: new Date().toISOString(),
    };
    if (programa.criancaId) {
      novo.ordem = programasDaCrianca.length;
      setProgramasCrianca((l) => [...l, novo]);
    } else {
      setBiblioteca((l) => [...l, novo]);
    }
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
      if (aba === "crianca") {
        const novo: Programa = {
          ...programa,
          id: `pc-${Date.now()}`,
          criancaId: criancaSelecionada,
          ordem: programasDaCrianca.length,
        };
        setProgramasCrianca((l) => [...l, novo]);
        toast.success("Programa criado para a criança");
      } else {
        const novo: Programa = { ...programa, id: `bib-${Date.now()}`, criancaId: undefined };
        setBiblioteca((l) => [...l, novo]);
        toast.success("Programa adicionado à biblioteca");
      }
    } else if (programa.criancaId) {
      setProgramasCrianca((l) => l.map((p) => (p.id === programa.id ? programa : p)));
      toast.success("Programa atualizado");
    } else {
      setBiblioteca((l) => l.map((p) => (p.id === programa.id ? programa : p)));
      toast.success("Programa atualizado");
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
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Programas</h1>
          <p className="text-muted-foreground">
            Crie, organize e reutilize programas terapêuticos individualizados.
          </p>
        </div>
        <Button onClick={abrirNovo} className="gap-2">
          <Plus className="h-4 w-4" /> Novo programa
        </Button>
      </header>

      <Card className="p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex items-center gap-2 flex-1">
          <User className="h-4 w-4 text-muted-foreground" />
          <Select value={criancaSelecionada} onValueChange={setCriancaSelecionada}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRIANCAS.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar programa..."
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
      </Card>

      <Tabs value={aba} onValueChange={(v) => setAba(v as "crianca" | "biblioteca")}>
        <TabsList>
          <TabsTrigger value="crianca" className="gap-2">
            <BookMarked className="h-4 w-4" /> Da criança ({programasDaCrianca.length})
          </TabsTrigger>
          <TabsTrigger value="biblioteca" className="gap-2">
            <Library className="h-4 w-4" /> Biblioteca ({biblioteca.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crianca" className="mt-4">
          {programasFiltradosCrianca.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <p className="text-muted-foreground mb-3">
                Nenhum programa encontrado para esta criança.
              </p>
              <Button variant="outline" onClick={() => setAba("biblioteca")}>
                Importar da biblioteca
              </Button>
            </Card>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={aoArrastarFim}>
              <SortableContext
                items={programasFiltradosCrianca.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {bibliotecaFiltrada.map((p) => (
              <CartaoPrograma
                key={p.id}
                programa={p}
                aoClicar={abrirEdicao}
                aoClonar={clonarParaCrianca}
                aoEditar={abrirEdicao}
                aoRemover={remover}
              />
            ))}
          </div>
          {bibliotecaFiltrada.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Use o menu (⋮) para clonar um programa da biblioteca para a criança selecionada.
            </p>
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
