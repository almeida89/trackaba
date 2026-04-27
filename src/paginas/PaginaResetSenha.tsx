import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const senhaSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.")
  .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula.")
  .regex(/[a-z]/, "Inclua ao menos uma letra minúscula.")
  .regex(/[0-9]/, "Inclua ao menos um número.");

export default function PaginaResetSenha() {
  const { atualizarSenha } = useAuth();
  const navigate = useNavigate();

  const [sessaoValida, setSessaoValida] = useState<boolean | null>(null);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    // Listener primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        setSessaoValida(true);
      }
    });

    // Verifica se há sessão (vinda do link do e-mail)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessaoValida(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const aoEnviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);

    const validacao = senhaSchema.safeParse(senha);
    if (!validacao.success) {
      setErro(validacao.error.issues[0].message);
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    const { erro: err } = await atualizarSenha(senha);
    setEnviando(false);

    if (err) {
      setErro(err);
      return;
    }
    setSucesso(true);
    toast.success("Senha redefinida com sucesso!");
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">
            TrackABA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Redefinir senha</p>
        </div>

        <Card className="p-6 shadow-lg">
          {sessaoValida === null ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !sessaoValida ? (
            <div className="space-y-4 text-center">
              <Alert variant="destructive">
                <AlertDescription>
                  Link inválido ou expirado. Solicite um novo e-mail de
                  recuperação na tela de login.
                </AlertDescription>
              </Alert>
              <Button onClick={() => navigate("/auth")} className="w-full">
                Voltar para o login
              </Button>
            </div>
          ) : sucesso ? (
            <div className="space-y-4 text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-status-success/15 text-status-success">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="font-medium text-foreground">
                Senha redefinida com sucesso!
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecionando para o login…
              </p>
            </div>
          ) : (
            <form onSubmit={aoEnviar} className="space-y-4">
              <div>
                <h2 className="font-heading font-semibold text-foreground">
                  Crie uma nova senha
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Mínimo 8 caracteres, com maiúsculas, minúsculas e números.
                </p>
              </div>

              {erro && (
                <Alert variant="destructive">
                  <AlertDescription>{erro}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="senha-nova">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="senha-nova"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha-confirmar">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="senha-confirmar"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Redefinir senha"
                )}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 TrackABA · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
