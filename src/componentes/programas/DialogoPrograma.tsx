import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DisciplinaPrograma, Objetivo, Programa, StatusPrograma, TipoPrograma } from "./tiposProgramas";

interface PropriedadesDialogoPrograma {
  aberto: boolean;
  programa: Programa | null;
  aoFechar: () => void;
  aoSalvar: (programa: Programa) => void;
}

const DISCIPLINAS: DisciplinaPrograma[] = [
  "ABA",
  "Fonoaudiologia",
  "Terapia Ocupacional",
  "Psicologia",
  "Psicopedagogia",
];
const TIPOS: TipoPrograma[] = ["Aquisição", "Manutenção", "Generalização"];
const STATUS: StatusPrograma[] = ["ativo", "pausado", "concluido"];

function programaVazio(): Programa {
  return {
    id: `novo-${Date.now()}`,
    nome: "",
    disciplina: "ABA",
    tipo: "Aquisição",
    status: "ativo",
    objetivoGeral: "",
    descricao: "",
    objetivos: [],
    tentativasPorSessao: 10,
    criterioMaestria: "80% em 3 sessões consecutivas",
    criadoEm: new Date().toISOString(),
    criadoPor: "Profissional",
    ordem: 0,
  };
}

export function DialogoPrograma({ aberto, programa, aoFechar, aoSalvar }: PropriedadesDialogoPrograma) {
  const [formulario, setFormulario] = useState<Programa>(programaVazio());

  useEffect(() => {
    setFormulario(programa ?? programaVazio());
  }, [programa, aberto]);

  function atualizar<K extends keyof Programa>(campo: K, valor: Programa[K]) {
    setFormulario((f) => ({ ...f, [campo]: valor }));
  }

  function adicionarObjetivo() {
    const novo: Objetivo = {
      id: `obj-${Date.now()}`,
      descricao: "",
      criterio: "",
      concluido: false,
    };
    setFormulario((f) => ({ ...f, objetivos: [...f.objetivos, novo] }));
  }

  function atualizarObjetivo(id: string, campo: keyof Objetivo, valor: string) {
    setFormulario((f) => ({
      ...f,
      objetivos: f.objetivos.map((o) => (o.id === id ? { ...o, [campo]: valor } : o)),
    }));
  }

  function removerObjetivo(id: string) {
    setFormulario((f) => ({ ...f, objetivos: f.objetivos.filter((o) => o.id !== id) }));
  }

  function salvar() {
    if (!formulario.nome.trim() || !formulario.objetivoGeral.trim()) return;
    aoSalvar(formulario);
    aoFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && aoFechar()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{programa?.id?.startsWith("novo-") || !programa ? "Novo programa" : "Editar programa"}</DialogTitle>
          <DialogDescription>
            Defina o objetivo geral, disciplina, critérios de maestria e objetivos específicos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do programa</Label>
            <Input
              id="nome"
              value={formulario.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
              placeholder="Ex.: Contato Visual"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Disciplina</Label>
              <Select
                value={formulario.disciplina}
                onValueChange={(v) => atualizar("disciplina", v as DisciplinaPrograma)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISCIPLINAS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formulario.tipo} onValueChange={(v) => atualizar("tipo", v as TipoPrograma)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formulario.status} onValueChange={(v) => atualizar("status", v as StatusPrograma)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objetivo">Objetivo geral</Label>
            <Textarea
              id="objetivo"
              value={formulario.objetivoGeral}
              onChange={(e) => atualizar("objetivoGeral", e.target.value)}
              placeholder="Descreva o objetivo principal do programa"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição / Procedimento</Label>
            <Textarea
              id="descricao"
              value={formulario.descricao}
              onChange={(e) => atualizar("descricao", e.target.value)}
              placeholder="Como conduzir o programa"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tentativas">Tentativas por sessão</Label>
              <Input
                id="tentativas"
                type="number"
                min={1}
                value={formulario.tentativasPorSessao}
                onChange={(e) => atualizar("tentativasPorSessao", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criterio">Critério de maestria</Label>
              <Input
                id="criterio"
                value={formulario.criterioMaestria}
                onChange={(e) => atualizar("criterioMaestria", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Objetivos específicos</Label>
              <Button type="button" variant="outline" size="sm" onClick={adicionarObjetivo}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {formulario.objetivos.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Nenhum objetivo adicionado.</p>
              )}
              {formulario.objetivos.map((obj, i) => (
                <div key={obj.id} className="flex gap-2 items-start p-2 rounded-md border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground mt-2 w-5">{i + 1}.</span>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Descrição do objetivo"
                      value={obj.descricao}
                      onChange={(e) => atualizarObjetivo(obj.id, "descricao", e.target.value)}
                    />
                    <Input
                      placeholder="Critério (ex.: 8/10)"
                      value={obj.criterio}
                      onChange={(e) => atualizarObjetivo(obj.id, "criterio", e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive"
                    onClick={() => removerObjetivo(obj.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button onClick={salvar}>Salvar programa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
