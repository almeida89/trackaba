import { FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity, Loader2, Mail, Lock, User, Phone, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const emailSchema = z.string().trim().email("E-mail inválido.").max(255);
const senhaForteSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.")
  .regex(/[A-Z]/, "Inclua ao menos uma letra maiúscula.")
  .regex(/[a-z]/, "Inclua ao menos uma letra minúscula.")
  .regex(/[0-9]/, "Inclua ao menos um número.");

const cadastroSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo.").max(120),
  email: emailSchema,
  telefone: z.string().trim().max(20).optional(),
  senha: senhaForteSchema,
});

export default function PaginaAuth() {
  const { user, carregando, entrar, cadastrar, recuperarSenha, reenviarConfirmacao } = useAuth();
  const navigate = useNavigate();

  const [aba, setAba] = useState<"entrar" | "cadastrar">("entrar");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [emailNaoConfirmado, setEmailNaoConfirmado] = useState<string | null>(null);

  // Login
  const [emailLogin, setEmailLogin] = useState("");
  const [senhaLogin, setSenhaLogin] = useState("");

  // Cadastro
  const [nome, setNome] = useState("");
  const [emailCad, setEmailCad] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senhaCad, setSenhaCad] = useState("");

  // Recuperação
  const [recuperarAberto, setRecuperarAberto] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [enviandoRecuperar, setEnviandoRecuperar] = useState(false);

  useEffect(() => {
    setErro(null);
    setInfo(null);
    setEmailNaoConfirmado(null);
  }, [aba]);

  if (!carregando && user) {
    return <Navigate to="/" replace />;
  }

  const aoEntrar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setInfo(null);
    setEmailNaoConfirmado(null);

    const emailVal = emailSchema.safeParse(emailLogin);
    if (!emailVal.success) {
      setErro(emailVal.error.issues[0].message);
      return;
    }

    setEnviando(true);
    const { erro: err } = await entrar(emailVal.data, senhaLogin);
    setEnviando(false);
    if (err) {
      setErro(err);
      if (err.toLowerCase().includes("confirme seu e-mail")) {
        setEmailNaoConfirmado(emailVal.data);
      }
      return;
    }
    toast.success("Bem-vindo(a) de volta!");
    navigate("/", { replace: true });
  };

  const aoCadastrar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    setInfo(null);

    const dados = cadastroSchema.safeParse({
      nome,
      email: emailCad,
      telefone: telefone || undefined,
      senha: senhaCad,
    });
    if (!dados.success) {
      setErro(dados.error.issues[0].message);
      return;
    }

    setEnviando(true);
    const { erro: err, mensagem } = await cadastrar(
      dados.data.email,
      dados.data.senha,
      dados.data.nome,
      dados.data.telefone,
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

  const aoRecuperar = async (e: FormEvent) => {
    e.preventDefault();
    const emailVal = emailSchema.safeParse(emailRecuperar);
    if (!emailVal.success) {
      toast.error(emailVal.error.issues[0].message);
      return;
    }
    setEnviandoRecuperar(true);
    const { erro: err, mensagem } = await recuperarSenha(emailVal.data);
    setEnviandoRecuperar(false);
    if (err) {
      toast.error(err);
      return;
    }
    toast.success(mensagem ?? "E-mail enviado.");
    setRecuperarAberto(false);
    setEmailRecuperar("");
  };

  const aoReenviarConfirmacao = async () => {
    if (!emailNaoConfirmado) return;
    setEnviando(true);
    const { erro: err, mensagem } = await reenviarConfirmacao(emailNaoConfirmado);
    setEnviando(false);
    if (err) {
      toast.error(err);
      return;
    }
    toast.success(mensagem ?? "E-mail reenviado.");
    setEmailNaoConfirmado(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
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
                <AlertDescription className="space-y-2">
                  <p>{erro}</p>
                  {emailNaoConfirmado && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={aoReenviarConfirmacao}
                      disabled={enviando}
                      className="mt-1"
                    >
                      {enviando ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      ) : (
                        <Mail className="h-3 w-3 mr-1.5" />
                      )}
                      Reenviar e-mail de confirmação
                    </Button>
                  )}
                </AlertDescription>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="senha-login">Senha</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailRecuperar(emailLogin);
                        setRecuperarAberto(true);
                      }}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
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
                      minLength={8}
                      value={senhaCad}
                      onChange={(e) => setSenhaCad(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Use ao menos 8 caracteres com letras maiúsculas, minúsculas e números.
                    Senhas que apareceram em vazamentos públicos são bloqueadas.
                  </p>
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

      <Dialog open={recuperarAberto} onOpenChange={setRecuperarAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Recuperar senha
            </DialogTitle>
            <DialogDescription>
              Informe o e-mail cadastrado. Enviaremos um link seguro para você criar uma nova senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={aoRecuperar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-rec">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email-rec"
                  type="email"
                  required
                  value={emailRecuperar}
                  onChange={(e) => setEmailRecuperar(e.target.value)}
                  placeholder="voce@exemplo.com"
                  className="pl-9"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRecuperarAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviandoRecuperar}>
                {enviandoRecuperar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enviar link de recuperação"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
