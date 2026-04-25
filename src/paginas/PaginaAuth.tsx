import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Loader2, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function PaginaAuth() {
  const { user, carregando, entrar, cadastrar } = useAuth();
  const navigate = useNavigate();

  const [aba, setAba] = useState<"entrar" | "cadastrar">("entrar");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Login
  const [emailLogin, setEmailLogin] = useState("");
  const [senhaLogin, setSenhaLogin] = useState("");

  // Cadastro
  const [nome, setNome] = useState("");
  const [emailCad, setEmailCad] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senhaCad, setSenhaCad] = useState("");

  useEffect(() => {
    setErro(null);
    setInfo(null);
  }, [aba]);

  if (!carregando && user) {
    return <Navigate to="/" replace />;
  }

  const aoEntrar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setInfo(null);
    setEnviando(true);
    const { erro: err } = await entrar(emailLogin.trim(), senhaLogin);
    setEnviando(false);
    if (err) {
      setErro(err);
      return;
    }
    toast.success("Bem-vindo(a) de volta!");
    navigate("/", { replace: true });
  };

  const aoCadastrar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setInfo(null);
    if (senhaCad.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setEnviando(true);
    const { erro: err, mensagem } = await cadastrar(
      emailCad.trim(),
      senhaCad,
      nome.trim(),
      telefone.trim() || undefined,
    );
    setEnviando(false);
    if (err) {
      setErro(err);
      return;
    }
    setInfo(mensagem ?? "Conta criada. Verifique seu e-mail.");
    setNome("");
    setEmailCad("");
    setTelefone("");
    setSenhaCad("");
    setAba("entrar");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">TrackABA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plataforma clínica de acompanhamento ABA
          </p>
        </div>

        <Card className="p-6 shadow-lg">
          <Tabs value={aba} onValueChange={(v) => setAba(v as "entrar" | "cadastrar")}>
            <TabsList className="grid grid-cols-2 mb-6 w-full">
              <TabsTrigger value="entrar">Entrar</TabsTrigger>
              <TabsTrigger value="cadastrar">Criar conta</TabsTrigger>
            </TabsList>

            {erro && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}
            {info && (
              <Alert className="mb-4 border-primary/40 bg-primary/5">
                <AlertDescription className="text-foreground">{info}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="entrar">
              <form onSubmit={aoEntrar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-login"
                      type="email"
                      autoComplete="email"
                      required
                      value={emailLogin}
                      onChange={(e) => setEmailLogin(e.target.value)}
                      placeholder="voce@exemplo.com"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-login">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="senha-login"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={senhaLogin}
                      onChange={(e) => setSenhaLogin(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={enviando}>
                  {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
                </Button>
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3 leading-relaxed">
                  <p className="font-medium text-foreground mb-1">Conta de teste (admin)</p>
                  <p>E-mail: <span className="font-mono">admin@clinica.com</span></p>
                  <p>Senha: <span className="font-mono">Admin@2025</span></p>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="cadastrar">
              <form onSubmit={aoCadastrar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Maria da Silva"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-cad">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-cad"
                      type="email"
                      autoComplete="email"
                      required
                      value={emailCad}
                      onChange={(e) => setEmailCad(e.target.value)}
                      placeholder="voce@exemplo.com"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tel">Telefone (opcional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="tel"
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 99999-0000"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha-cad">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="senha-cad"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={senhaCad}
                      onChange={(e) => setSenhaCad(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-9"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={enviando}>
                  {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Você receberá um e-mail para confirmar antes de entrar.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 TrackABA · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
