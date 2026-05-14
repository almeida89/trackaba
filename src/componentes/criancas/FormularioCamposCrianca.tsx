import { useEffect, useState } from "react";
import { Loader2, Save, Pencil, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CriancaDetalhe } from "@/hooks/useCrianca";

export type CampoCrianca = {
  campo: keyof CriancaDetalhe;
  rotulo: string;
  placeholder?: string;
  tipo?: "text" | "tel" | "textarea";
  colSpan?: 1 | 2;
};

interface Props {
  titulo: string;
  descricao?: string;
  crianca: CriancaDetalhe;
  campos: CampoCrianca[];
  salvando: boolean;
  onSalvar: (campos: Partial<CriancaDetalhe>) => Promise<void>;
}

export function FormularioCamposCrianca({ titulo, descricao, crianca, campos, salvando, onSalvar }: Props) {
  const [editando, setEditando] = useState(false);
  const [valores, setValores] = useState<Record<string, string>>({});

  useEffect(() => {
    const inicial: Record<string, string> = {};
    campos.forEach((c) => {
      inicial[c.campo as string] = (crianca[c.campo] as string) ?? "";
    });
    setValores(inicial);
  }, [crianca, campos]);

  const cancelar = () => {
    const inicial: Record<string, string> = {};
    campos.forEach((c) => {
      inicial[c.campo as string] = (crianca[c.campo] as string) ?? "";
    });
    setValores(inicial);
    setEditando(false);
  };

  const salvar = async () => {
    const patch: Partial<CriancaDetalhe> = {};
    campos.forEach((c) => {
      const v = valores[c.campo as string]?.trim() ?? "";
      (patch as Record<string, string | null>)[c.campo as string] = v === "" ? null : v;
    });
    await onSalvar(patch);
    setEditando(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-heading">{titulo}</CardTitle>
          {descricao && <CardDescription>{descricao}</CardDescription>}
        </div>
        {!editando ? (
          <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={cancelar} disabled={salvando}>
              <X className="h-3.5 w-3.5 mr-1.5" /> Cancelar
            </Button>
            <Button size="sm" onClick={salvar} disabled={salvando}>
              {salvando ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              Salvar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {campos.map((c) => {
            const valor = valores[c.campo as string] ?? "";
            const colClasse = c.colSpan === 2 ? "md:col-span-2" : "";
            return (
              <div key={c.campo as string} className={`space-y-1.5 ${colClasse}`}>
                <Label htmlFor={c.campo as string} className="text-xs text-muted-foreground">
                  {c.rotulo}
                </Label>
                {editando ? (
                  c.tipo === "textarea" ? (
                    <Textarea
                      id={c.campo as string}
                      value={valor}
                      placeholder={c.placeholder}
                      onChange={(e) =>
                        setValores((v) => ({ ...v, [c.campo as string]: e.target.value }))
                      }
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={c.campo as string}
                      type={c.tipo || "text"}
                      value={valor}
                      placeholder={c.placeholder}
                      onChange={(e) =>
                        setValores((v) => ({ ...v, [c.campo as string]: e.target.value }))
                      }
                    />
                  )
                ) : (
                  <p className="text-sm font-medium text-foreground whitespace-pre-wrap min-h-[1.25rem]">
                    {(crianca[c.campo] as string) || "—"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
