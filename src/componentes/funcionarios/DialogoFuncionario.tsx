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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Funcionario } from "./tiposFuncionarios";
import {
  cargosDisponiveis,
  niveisAcessoDisponiveis,
} from "./dadosFuncionarios";
import { toast } from "sonner";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  funcionario?: Funcionario | null;
  aoSalvar: (f: Funcionario) => void;
}

const vazio = (): Funcionario => ({
  id: `f${Date.now()}`,
  nome: "",
  email: "",
  telefone: "",
  cargo: "Terapeuta ABA",
  registroProfissional: "",
  especialidades: [],
  status: "ativo",
  nivelAcesso: "operacional",
  dataAdmissao: new Date().toISOString().slice(0, 10),
  cargaHorariaSemanal: 30,
  criancasAtendidas: 0,
  sessoesNoMes: 0,
  iniciais: "",
});

export function DialogoFuncionario({
  aberto,
  aoFechar,
  funcionario,
  aoSalvar,
}: Props) {
  const [form, setForm] = useState<Funcionario>(vazio());
  const [especialidadesTexto, setEspecialidadesTexto] = useState("");

  useEffect(() => {
    if (funcionario) {
      setForm(funcionario);
      setEspecialidadesTexto(funcionario.especialidades.join(", "));
    } else {
      setForm(vazio());
      setEspecialidadesTexto("");
    }
  }, [funcionario, aberto]);

  const salvar = () => {
    if (!form.nome.trim() || !form.email.trim()) {
      toast.error("Preencha nome e e-mail");
      return;
    }
    const partes = form.nome.trim().split(" ").filter(Boolean);
    const iniciais =
      (partes[0]?.[0] || "") + (partes[partes.length - 1]?.[0] || "");
    const especialidades = especialidadesTexto
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    aoSalvar({
      ...form,
      iniciais: iniciais.toUpperCase(),
      especialidades,
    });
    toast.success(
      funcionario ? "Funcionário atualizado" : "Funcionário cadastrado"
    );
    aoFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && aoFechar()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {funcionario ? "Editar funcionário" : "Novo funcionário"}
          </DialogTitle>
          <DialogDescription>
            Informações profissionais e nível de acesso ao sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="sm:col-span-2 space-y-2">
            <Label>Nome completo *</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex.: Dra. Ana Souza"
            />
          </div>

          <div className="space-y-2">
            <Label>E-mail *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nome@trackaba.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              placeholder="(11) 99999-0000"
            />
          </div>

          <div className="space-y-2">
            <Label>Cargo</Label>
            <Select
              value={form.cargo}
              onValueChange={(v) =>
                setForm({ ...form, cargo: v as Funcionario["cargo"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cargosDisponiveis.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Registro profissional</Label>
            <Input
              value={form.registroProfissional || ""}
              onChange={(e) =>
                setForm({ ...form, registroProfissional: e.target.value })
              }
              placeholder="Ex.: CRP 06/123456"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label>Especialidades (separadas por vírgula)</Label>
            <Input
              value={especialidadesTexto}
              onChange={(e) => setEspecialidadesTexto(e.target.value)}
              placeholder="TEA, PECS, Manejo de comportamentos"
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm({ ...form, status: v as Funcionario["status"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="ferias">Em férias</SelectItem>
                <SelectItem value="afastado">Afastado</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nível de acesso</Label>
            <Select
              value={form.nivelAcesso}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  nivelAcesso: v as Funcionario["nivelAcesso"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {niveisAcessoDisponiveis.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n.charAt(0).toUpperCase() + n.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data de admissão</Label>
            <Input
              type="date"
              value={form.dataAdmissao}
              onChange={(e) =>
                setForm({ ...form, dataAdmissao: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Carga horária semanal (h)</Label>
            <Input
              type="number"
              min={0}
              max={60}
              value={form.cargaHorariaSemanal}
              onChange={(e) =>
                setForm({
                  ...form,
                  cargaHorariaSemanal: Number(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button onClick={salvar}>
            {funcionario ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
