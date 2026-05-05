import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MembroFamilia } from "./tiposFamilia";
import { parentescosDisponiveis } from "./dadosFamilia";
import { toast } from "sonner";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  membro?: MembroFamilia | null;
  aoSalvar: (m: MembroFamilia) => void;
}

const criancasDisponiveis = [
  { id: "1", nome: "Lucas Mendes" },
  { id: "2", nome: "Maria Silva" },
  { id: "3", nome: "Pedro Rocha" },
  { id: "4", nome: "Julia Santos" },
  { id: "5", nome: "Gabriel Oliveira" },
  { id: "6", nome: "Sofia Almeida" },
];


const formatarCPF = (valor: string) => {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatarTelefone = (valor: string) => {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 10) {
    return digitos
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digitos
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

const vazio = (): MembroFamilia => ({
  id: `fa${Date.now()}`,
  nome: "",
  parentesco: "Mãe",
  email: "",
  telefone: "",
  cpf: "",
  profissao: "",
  observacoes: "",
  recebeRelatorios: true,
  participaOrientacoes: true,
  statusAcessoApp: "sem_acesso",
  criancas: [],
  iniciais: "",
});

export function DialogoMembroFamilia({
  aberto,
  aoFechar,
  membro,
  aoSalvar,
}: Props) {
  const [form, setForm] = useState<MembroFamilia>(vazio());
  const [criancaId, setCriancaId] = useState<string>("");

  useEffect(() => {
    if (membro) setForm(membro);
    else setForm(vazio());
    setCriancaId("");
  }, [membro, aberto]);

  const adicionarCrianca = () => {
    if (!criancaId) return;
    if (form.criancas.some((c) => c.criancaId === criancaId)) return;
    const c = criancasDisponiveis.find((x) => x.id === criancaId);
    if (!c) return;
    setForm({
      ...form,
      criancas: [
        ...form.criancas,
        { criancaId: c.id, nome: c.nome, principal: form.criancas.length === 0 },
      ],
    });
    setCriancaId("");
  };

  const removerCrianca = (id: string) => {
    setForm({
      ...form,
      criancas: form.criancas.filter((c) => c.criancaId !== id),
    });
  };

  const definirPrincipal = (id: string) => {
    setForm({
      ...form,
      criancas: form.criancas.map((c) => ({
        ...c,
        principal: c.criancaId === id,
      })),
    });
  };

  const salvar = () => {
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast.error("Preencha nome e telefone");
      return;
    }
    if (form.criancas.length === 0) {
      toast.error("Vincule ao menos uma criança");
      return;
    }
    const partes = form.nome.trim().split(" ").filter(Boolean);
    const iniciais =
      (partes[0]?.[0] || "") + (partes[partes.length - 1]?.[0] || "");
    aoSalvar({ ...form, iniciais: iniciais.toUpperCase() });
    toast.success(membro ? "Familiar atualizado" : "Familiar cadastrado");
    aoFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && aoFechar()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {membro ? "Editar familiar" : "Novo familiar"}
          </DialogTitle>
          <DialogDescription>
            Dados de contato, vínculo com a(s) criança(s) e preferências de
            comunicação.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="sm:col-span-2 space-y-2">
            <Label>Nome completo *</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex.: Patrícia Mendes"
            />
          </div>

          <div className="space-y-2">
            <Label>Parentesco</Label>
            <Select
              value={form.parentesco}
              onValueChange={(v) =>
                setForm({ ...form, parentesco: v as MembroFamilia["parentesco"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {parentescosDisponiveis.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Profissão</Label>
            <Input
              value={form.profissao || ""}
              onChange={(e) => setForm({ ...form, profissao: e.target.value })}
              placeholder="Ex.: Pedagoga"
            />
          </div>

          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Telefone *</Label>
            <Input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: formatarTelefone(e.target.value) })}
              maxLength={15}
              placeholder="(11) 99999-0000"
            />
          </div>

          <div className="space-y-2">
            <Label>CPF</Label>
            <Input
              value={form.cpf || ""}
              onChange={(e) => setForm({ ...form, cpf: formatarCPF(e.target.value) })}
              maxLength={14}
              placeholder="000.000.000-00"
            />
          </div>

          <div className="space-y-2">
            <Label>Acesso ao app</Label>
            <Select
              value={form.statusAcessoApp}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  statusAcessoApp: v as MembroFamilia["statusAcessoApp"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem_acesso">Sem acesso</SelectItem>
                <SelectItem value="convite_enviado">Convite enviado</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Crianças vinculadas */}
          <div className="sm:col-span-2 space-y-2">
            <Label>Crianças vinculadas</Label>
            <div className="flex gap-2">
              <Select value={criancaId} onValueChange={setCriancaId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione uma criança" />
                </SelectTrigger>
                <SelectContent>
                  {criancasDisponiveis
                    .filter(
                      (c) => !form.criancas.some((v) => v.criancaId === c.id)
                    )
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={adicionarCrianca}
              >
                Adicionar
              </Button>
            </div>
            {form.criancas.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {form.criancas.map((c) => (
                  <div
                    key={c.criancaId}
                    className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-foreground">
                      {c.nome}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => definirPrincipal(c.criancaId)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                          c.principal
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {c.principal ? "Principal" : "Tornar principal"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removerCrianca(c.criancaId)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Recebe relatórios
                </p>
                <p className="text-xs text-muted-foreground">
                  Envio automático mensal
                </p>
              </div>
              <Switch
                checked={form.recebeRelatorios}
                onCheckedChange={(v) =>
                  setForm({ ...form, recebeRelatorios: v })
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Orientação parental
                </p>
                <p className="text-xs text-muted-foreground">
                  Participa das reuniões
                </p>
              </div>
              <Switch
                checked={form.participaOrientacoes}
                onCheckedChange={(v) =>
                  setForm({ ...form, participaOrientacoes: v })
                }
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={form.observacoes || ""}
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
              placeholder="Preferências de contato, situação familiar, etc."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button onClick={salvar}>
            {membro ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
