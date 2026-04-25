import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppRole, rotuloPapel, useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

interface UsuarioLista {
  id: string;
  nome_completo: string;
  telefone: string | null;
  papel: AppRole;
}

const papeis: AppRole[] = ["admin", "psicologo", "coordenador", "recepcionista", "familia"];

export function AbaUsuarios() {
  const { isAdmin, carregando: carregandoPapel } = useUserRole();
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

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
    const { error: insErr } = await supabase.from("user_roles").insert({ user_id: userId, role: novoPapel });
    setSalvandoId(null);
    if (insErr) {
      toast.error("Erro ao atribuir novo papel.");
      return;
    }
    setUsuarios((u) => u.map((x) => (x.id === userId ? { ...x, papel: novoPapel } : x)));
    toast.success(`Papel atualizado para ${rotuloPapel[novoPapel]}.`);
  };

  if (carregandoPapel) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="p-8 text-center">
        <ShieldAlert className="h-10 w-10 mx-auto text-warning mb-3" />
        <h3 className="text-lg font-semibold text-foreground">Acesso restrito</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Apenas administradores podem gerenciar usuários e papéis.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Usuários e papéis</h3>
          <p className="text-sm text-muted-foreground">
            Defina o nível de acesso de cada pessoa cadastrada na clínica.
          </p>
        </div>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Papel atual</TableHead>
              <TableHead className="text-right">Alterar papel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nome_completo}</TableCell>
                <TableCell className="text-muted-foreground">{u.telefone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{rotuloPapel[u.papel]}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Select
                    value={u.papel}
                    onValueChange={(v) => alterarPapel(u.id, v as AppRole)}
                    disabled={salvandoId === u.id}
                  >
                    <SelectTrigger className="w-[180px] ml-auto">
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
              </TableRow>
            ))}
            {usuarios.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-8">
                  Nenhum usuário cadastrado ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
