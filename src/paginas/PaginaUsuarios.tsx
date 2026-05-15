import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, rotuloPapel, useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { mascararTelefone } from "@/lib/mascaras";

interface UsuarioLista {
  id: string;
  nome_completo: string;
  telefone: string | null;
  papel: AppRole;
}

const papeis: AppRole[] = ["admin", "psicologo", "coordenador", "recepcionista", "familia"];

const esquemaCriar = z.object({
  nome_completo: z.string().trim().min(2, "Nome muito curto").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  telefone: z.string().trim().max(30).optional().or(z.literal("")),
  senha: z.string().min(8, "Senha deve ter ao menos 8 caracteres").max(72),
  papel: z.enum(["admin", "psicologo", "coordenador", "recepcionista", "familia"]),
});

export default function PaginaUsuarios() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState({
    nome_completo: "",
    email: "",
    telefone: "",
    senha: "",
    papel: "familia" as AppRole,
  });

  const carregar = async () => {
    setCarregando(true);
    const { data: profs, error } = await supabase
      .from("profiles")
      .select("id, nome_completo, telefone")
      .order("nome_completo");
    if (error) {
      toast.error("Não foi possível carregar usuários.");
      setCarregando(false);
      return;
    }
    const ids = (profs ?? []).map((p) => p.id);
    const { data: roles } = ids.length
      ? await supabase.from("user_roles").select("user_id, role").in("user_id", ids)
      : { data: [] as { user_id: string; role: AppRole }[] };
    const mapaRole = new Map((roles ?? []).map((r) => [r.user_id, r.role as AppRole]));
    setUsuarios(
      (profs ?? []).map((p) => ({
        id: p.id,
        nome_completo: p.nome_completo || "(sem nome)",
        telefone: p.telefone,
        papel: mapaRole.get(p.id) ?? "familia",
      })),
    );
    setCarregando(false);
  };

  useEffect(() => {
    if (isAdmin) carregar();
  }, [isAdmin]);

  const alterarPapel = async (userId: string, novoPapel: AppRole) => {
    setSalvandoId(userId);
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) {
      toast.error("Erro ao atualizar papel.");
      setSalvandoId(null);
      return;
    }
    const { error: insErr } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: novoPapel });
    setSalvandoId(null);
    if (insErr) {
      toast.error("Erro ao atribuir novo papel.");
      return;
    }
    setUsuarios((u) => u.map((x) => (x.id === userId ? { ...x, papel: novoPapel } : x)));
    toast.success(`Papel atualizado para ${rotuloPapel[novoPapel]}.`);
  };

  const criarUsuario = async () => {
    const parsed = esquemaCriar.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }
    setCriando(true);
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: {
        acao: "criar",
        email: parsed.data.email,
        senha: parsed.data.senha,
        nome_completo: parsed.data.nome_completo,
        telefone: parsed.data.telefone || undefined,
        papel: parsed.data.papel,
      },
    });
    setCriando(false);
    const erro = (data as { erro?: string } | null)?.erro ?? error?.message;
    if (erro) {
      toast.error(erro);
      return;
    }
    toast.success("Usuário criado com sucesso.");
    setDialogoAberto(false);
    setForm({ nome_completo: "", email: "", telefone: "", senha: "", papel: "familia" });
    carregar();
  };

  const removerUsuario = async (userId: string) => {
    setSalvandoId(userId);
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { acao: "remover", user_id: userId },
    });
    setSalvandoId(null);
    const erro = (data as { erro?: string } | null)?.erro ?? error?.message;
    if (erro) {
      toast.error(erro);
      return;
    }
    setUsuarios((u) => u.filter((x) => x.id !== userId));
    toast.success("Usuário removido.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Gestão de usuários
            </h1>
            <p className="text-sm text-muted-foreground">
              Crie contas, defina papéis e remova acessos da clínica.
            </p>
          </div>
        </div>

        <Dialog open={dialogoAberto} onOpenChange={setDialogoAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Novo usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" /> Criar novo usuário
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={form.nome_completo}
                  onChange={(e) => setForm({ ...form, nome_completo: e.target.value })}
                  maxLength={120}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={255}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tel">Telefone (opcional)</Label>
                <Input
                  id="tel"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: mascararTelefone(e.target.value) })}
                  maxLength={30}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="senha">Senha provisória</Label>
                <Input
                  id="senha"
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  maxLength={72}
                />
                <p className="text-xs text-muted-foreground">Mínimo 8 caracteres.</p>
              </div>
              <div className="grid gap-2">
                <Label>Papel</Label>
                <Select
                  value={form.papel}
                  onValueChange={(v) => setForm({ ...form, papel: v as AppRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {papeis.map((p) => (
                      <SelectItem key={p} value={p}>
                        {rotuloPapel[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogoAberto(false)} disabled={criando}>
                Cancelar
              </Button>
              <Button onClick={criarUsuario} disabled={criando}>
                {criando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Criar usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-0 overflow-hidden">
        {carregando ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => {
                const ehVoce = u.id === user?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.nome_completo}
                      {ehVoce && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">você</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.telefone ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.papel}
                        onValueChange={(v) => alterarPapel(u.id, v as AppRole)}
                        disabled={salvandoId === u.id || ehVoce}
                      >
                        <SelectTrigger className="w-[170px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {papeis.map((p) => (
                            <SelectItem key={p} value={p}>
                              {rotuloPapel[p]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={ehVoce || salvandoId === u.id}
                            title={ehVoce ? "Você não pode remover a si mesmo" : "Remover usuário"}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação remove permanentemente <strong>{u.nome_completo}</strong> e
                              todo o seu acesso à clínica. Não é possível desfazer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removerUsuario(u.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-12">
                    Nenhum usuário cadastrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
