import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OpcaoFuncionario {
  id: string;
  nome: string;
  cargo: string | null;
}

interface Props {
  // Modo controlado (no cadastro novo, sem persistência)
  selecionados: { funcionarioId: string; nome: string; cargo: string | null }[];
  aoAdicionar: (f: OpcaoFuncionario) => void | Promise<void>;
  aoRemover: (funcionarioId: string) => void | Promise<void>;
  desabilitado?: boolean;
}

const CARGOS_CLINICOS = new Set([
  "Analista do Comportamento",
  "Terapeuta ABA",
  "Psicólogo(a)",
  "Fonoaudiologo(a)",
  "Terapeuta Ocupacional",
]);

export function SeletorResponsaveis({ selecionados, aoAdicionar, aoRemover, desabilitado }: Props) {
  const [opcoes, setOpcoes] = useState<OpcaoFuncionario[]>([]);
  const [valor, setValor] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("funcionarios")
        .select("id,nome_completo,sub_cargo,cargo,ativo")
        .eq("ativo", true)
        .order("nome_completo");
      const lista = (data ?? [])
        .map((f) => ({
          id: f.id,
          nome: f.nome_completo,
          cargo: (f.sub_cargo as string | null) ?? (f.cargo as string | null),
        }))
        .filter((f) => !f.cargo || CARGOS_CLINICOS.has(f.cargo));
      setOpcoes(lista);
    })();
  }, []);

  const disponiveis = useMemo(
    () => opcoes.filter((o) => !selecionados.some((s) => s.funcionarioId === o.id)),
    [opcoes, selecionados],
  );

  const adicionar = async () => {
    const f = opcoes.find((o) => o.id === valor);
    if (!f) return;
    await aoAdicionar(f);
    setValor("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-9">
        {selecionados.length === 0 && (
          <span className="text-xs text-muted-foreground">Nenhum profissional vinculado</span>
        )}
        {selecionados.map((s) => (
          <Badge key={s.funcionarioId} variant="secondary" className="gap-1.5 py-1 px-2">
            <span>{s.nome}</span>
            {s.cargo && <span className="text-[10px] text-muted-foreground">· {s.cargo}</span>}
            {!desabilitado && (
              <button
                type="button"
                onClick={() => aoRemover(s.funcionarioId)}
                className="hover:text-destructive"
                aria-label={`Remover ${s.nome}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
      {!desabilitado && (
        <div className="flex gap-2">
          <Select value={valor} onValueChange={setValor}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Adicionar profissional..." />
            </SelectTrigger>
            <SelectContent>
              {disponiveis.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Nenhum profissional disponível
                </div>
              )}
              {disponiveis.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.nome}
                  {f.cargo ? ` — ${f.cargo}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={adicionar} disabled={!valor}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
