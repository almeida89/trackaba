import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useCriancas } from "@/hooks/useCriancas";
import { criancaSchema, type CriancaForm } from "@/schemas/crianca";
import { mascararTelefone } from "@/lib/mascaras";
import { toast } from "sonner";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
}

const inicial: CriancaForm = {
  nome: "",
  data_nascimento: "",
  diagnostico: "",
  responsavel_principal: "",
  telefone_contato: "",
  email_contato: "",
  observacoes: "",
};

export function DialogoNovaCrianca({ aberto, aoFechar }: Props) {
  const { criar, salvando } = useCriancas();
  const [form, setForm] = useState<CriancaForm>(inicial);
  const [erros, setErros] = useState<Partial<Record<keyof CriancaForm, string>>>({});

  const set = <K extends keyof CriancaForm>(k: K, v: CriancaForm[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const submeter = async () => {
    const parsed = criancaSchema.safeParse(form);
    if (!parsed.success) {
      const e: typeof erros = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as keyof CriancaForm;
        if (k && !e[k]) e[k] = i.message;
      });
      setErros(e);
      toast.error("Verifique os campos do formulário");
      return;
    }
    setErros({});
    try {
      await criar(parsed.data);
      setForm(inicial);
      aoFechar();
    } catch {
      // erro tratado no hook
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastrar nova criança</DialogTitle>
          <DialogDescription>
            Preencha os dados básicos. Você poderá completar o perfil depois.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="nome">Nome completo *</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              autoFocus
            />
            {erros.nome && <p className="text-xs text-destructive mt-1">{erros.nome}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dn">Data de nascimento *</Label>
              <Input
                id="dn"
                type="date"
                value={form.data_nascimento}
                onChange={(e) => set("data_nascimento", e.target.value)}
              />
              {erros.data_nascimento && (
                <p className="text-xs text-destructive mt-1">{erros.data_nascimento}</p>
              )}
            </div>
            <div>
              <Label htmlFor="diag">Diagnóstico *</Label>
              <Input
                id="diag"
                placeholder="Ex.: TEA nível 2"
                value={form.diagnostico}
                onChange={(e) => set("diagnostico", e.target.value)}
              />
              {erros.diagnostico && (
                <p className="text-xs text-destructive mt-1">{erros.diagnostico}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="resp">Responsável principal</Label>
            <Input
              id="resp"
              value={form.responsavel_principal}
              onChange={(e) => set("responsavel_principal", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="tel">Telefone</Label>
              <Input
                id="tel"
                inputMode="tel"
                placeholder="(11) 91234-5678"
                value={form.telefone_contato}
                onChange={(e) => set("telefone_contato", mascararTelefone(e.target.value))}
              />
              {erros.telefone_contato && (
                <p className="text-xs text-destructive mt-1">{erros.telefone_contato}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email_contato}
                onChange={(e) => set("email_contato", e.target.value)}
              />
              {erros.email_contato && (
                <p className="text-xs text-destructive mt-1">{erros.email_contato}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              rows={3}
              value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={submeter} disabled={salvando}>
            {salvando ? "Salvando..." : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
