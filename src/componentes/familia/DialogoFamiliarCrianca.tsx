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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { mascararTelefone } from "@/lib/mascaras";
import {
  FamiliarCrianca,
  NovoFamiliarInput,
  ParentescoDb,
} from "@/hooks/useFamiliaresCrianca";

const parentescos: { valor: ParentescoDb; rotulo: string }[] = [
  { valor: "mae", rotulo: "Mãe" },
  { valor: "pai", rotulo: "Pai" },
  { valor: "avo", rotulo: "Avó/Avô" },
  { valor: "tio_tia", rotulo: "Tio(a)" },
  { valor: "responsavel_legal", rotulo: "Responsável legal" },
  { valor: "outro", rotulo: "Outro" },
];

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  familiar: FamiliarCrianca | null;
  aoCriar: (i: NovoFamiliarInput) => Promise<void>;
  aoAtualizar: (params: {
    vinculoId: string;
    userId: string;
    nome?: string;
    telefone?: string | null;
    parentesco: ParentescoDb;
    podeVerEvolucao: boolean;
    podeVerSessoes: boolean;
  }) => Promise<void>;
  salvando: boolean;
}

export function DialogoFamiliarCrianca({
  aberto,
  aoFechar,
  familiar,
  aoCriar,
  aoAtualizar,
  salvando,
}: Props) {
  const editar = !!familiar;
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [parentesco, setParentesco] = useState<ParentescoDb>("mae");
  const [podeVerEvolucao, setPodeVerEvolucao] = useState(true);
  const [podeVerSessoes, setPodeVerSessoes] = useState(true);

  useEffect(() => {
    if (!aberto) return;
    if (familiar) {
      setNome(familiar.nome);
      setEmail("");
      setSenha("");
      setTelefone(familiar.telefone ?? "");
      setParentesco(familiar.parentesco);
      setPodeVerEvolucao(familiar.podeVerEvolucao);
      setPodeVerSessoes(familiar.podeVerSessoes);
    } else {
      setNome("");
      setEmail("");
      setSenha("");
      setTelefone("");
      setParentesco("mae");
      setPodeVerEvolucao(true);
      setPodeVerSessoes(true);
    }
  }, [aberto, familiar]);

  const salvar = async () => {
    if (!nome.trim()) return toast.error("Informe o nome");
    if (editar && familiar) {
      await aoAtualizar({
        vinculoId: familiar.vinculoId,
        userId: familiar.userId,
        nome: nome.trim(),
        telefone: telefone.trim() || null,
        parentesco,
        podeVerEvolucao,
        podeVerSessoes,
      });
      aoFechar();
      return;
    }
    if (!email.trim()) return toast.error("Informe o e-mail");
    if (senha.length < 10) return toast.error("Senha deve ter ao menos 10 caracteres");
    await aoCriar({
      nome: nome.trim(),
      email: email.trim(),
      senha,
      telefone: telefone.trim() || undefined,
      parentesco,
      podeVerEvolucao,
      podeVerSessoes,
    });
    aoFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && aoFechar()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editar ? "Editar familiar" : "Novo familiar"}</DialogTitle>
          <DialogDescription>
            {editar
              ? "Atualize parentesco e permissões de visibilidade."
              : "Cadastra o familiar e libera acesso imediato ao portal."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Nome completo *</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          {!editar && (
            <>
              <div>
                <Label>E-mail (login) *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Senha inicial *</Label>
                <Input
                  type="text"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mín. 10 caracteres"
                />
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Telefone</Label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                placeholder="(11) 91234-5678"
              />
            </div>
            <div>
              <Label>Parentesco</Label>
              <Select value={parentesco} onValueChange={(v) => setParentesco(v as ParentescoDb)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {parentescos.map((p) => (
                    <SelectItem key={p.valor} value={p.valor}>
                      {p.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Pode ver evolução</p>
              <p className="text-xs text-muted-foreground">Gráficos e relatórios</p>
            </div>
            <Switch checked={podeVerEvolucao} onCheckedChange={setPodeVerEvolucao} />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Pode ver sessões</p>
              <p className="text-xs text-muted-foreground">Histórico e resumos</p>
            </div>
            <Switch checked={podeVerSessoes} onCheckedChange={setPodeVerSessoes} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : editar ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
