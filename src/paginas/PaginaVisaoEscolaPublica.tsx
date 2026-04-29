import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, GraduationCap, Calendar, TrendingUp, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AcessoEscola {
  id: string;
  crianca_id: string;
  crianca_nome: string;
  escola_nome: string;
  responsavel_nome: string;
  responsavel_cargo: string;
  status: string;
  expira_em: string;
  ver_sessoes: boolean;
  ver_evolucao: boolean;
  ver_programas: boolean;
  ver_relatorios: boolean;
  ver_incidentes: boolean;
}

interface Sessao {
  id: string;
  data_sessao: string;
  duracao_minutos: number;
  terapeuta_nome: string;
  tipo: string;
  resumo_familia: string | null;
}

interface Programa {
  id: string;
  nome: string;
  dominio: string;
  meta: string | null;
  nivel_desempenho: string;
}

const rotuloNivel: Record<string, { texto: string; cor: string }> = {
  linha_base: { texto: "Linha de base", cor: "bg-muted text-muted-foreground" },
  em_aquisicao: { texto: "Em aquisição", cor: "bg-status-warning/15 text-status-warning border-status-warning/30" },
  em_manutencao: { texto: "Em manutenção", cor: "bg-status-info/15 text-status-info border-status-info/30" },
  generalizado: { texto: "Generalizado", cor: "bg-primary/15 text-primary border-primary/30" },
  independente: { texto: "Independente", cor: "bg-status-success/15 text-status-success border-status-success/30" },
};

export default function PaginaVisaoEscolaPublica() {
  const { token } = useParams<{ token: string }>();
  const [carregando, setCarregando] = useState(true);
  const [acesso, setAcesso] = useState<AcessoEscola | null>(null);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      if (!token) {
        setErro("Token não informado.");
        setCarregando(false);
        return;
      }

      // Busca via RPC ou edge function não exigiria login.
      // Por enquanto o RLS exige autenticação — usaremos a Service Role via edge function NO FUTURO.
      // Para a demo, validamos pelo lado público usando uma chamada direta:
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).functions.invoke("validar-token-escola", {
        body: { token },
      });

      if (error || !data?.acesso) {
        setErro("Convite inválido, revogado ou expirado.");
        setCarregando(false);
        return;
      }

      const ac: AcessoEscola = data.acesso;
      const expirado = new Date(ac.expira_em).getTime() < Date.now();
      if (expirado || ac.status === "revogado" || ac.status === "expirado") {
        setErro("Este convite expirou ou foi revogado pela clínica.");
        setCarregando(false);
        return;
      }

      setAcesso(ac);
      if (data.sessoes) setSessoes(data.sessoes);
      if (data.programas) setProgramas(data.programas);
      setCarregando(false);
    };
    carregar();
  }, [token]);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (erro || !acesso) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-heading font-bold">Acesso indisponível</h1>
          <p className="text-sm text-muted-foreground">{erro ?? "Convite não encontrado."}</p>
          <p className="text-xs text-muted-foreground">
            Entre em contato com a clínica para receber um novo link de acesso.
          </p>
        </Card>
      </div>
    );
  }

  const dataExpira = new Date(acesso.expira_em).toLocaleDateString("pt-BR");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header institucional */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-foreground">TrackABA — Visão da Escola</h1>
            <p className="text-xs text-muted-foreground">{acesso.escola_nome}</p>
          </div>
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="h-3 w-3" /> Acesso seguro
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Alert>
          <GraduationCap className="h-4 w-4" />
          <AlertTitle>Bem-vindo(a), {acesso.responsavel_nome}</AlertTitle>
          <AlertDescription>
            Você tem acesso restrito à pasta de <strong>{acesso.crianca_nome}</strong>, autorizado pela clínica.
            Acesso válido até <strong>{dataExpira}</strong>. Os dados são confidenciais — não compartilhe.
          </AlertDescription>
        </Alert>

        {/* Resumo da criança */}
        <Card className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Aluno(a)</p>
              <h2 className="text-2xl font-heading font-bold text-foreground">{acesso.crianca_nome}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {acesso.ver_sessoes && <Badge variant="secondary">Sessões liberadas</Badge>}
              {acesso.ver_evolucao && <Badge variant="secondary">Evolução liberada</Badge>}
              {acesso.ver_programas && <Badge variant="secondary">Programas liberados</Badge>}
            </div>
          </div>
        </Card>

        <Tabs defaultValue={acesso.ver_sessoes ? "sessoes" : "programas"}>
          <TabsList>
            {acesso.ver_sessoes && <TabsTrigger value="sessoes">Sessões</TabsTrigger>}
            {acesso.ver_programas && <TabsTrigger value="programas">Programas</TabsTrigger>}
            {acesso.ver_evolucao && <TabsTrigger value="evolucao">Evolução</TabsTrigger>}
          </TabsList>

          {acesso.ver_sessoes && (
            <TabsContent value="sessoes" className="space-y-3 mt-4">
              {sessoes.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">Sem sessões registradas.</Card>
              ) : (
                sessoes.map((s) => (
                  <Card key={s.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          {new Date(s.data_sessao).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {s.terapeuta_nome} · {s.duracao_minutos}min · {s.tipo}
                        </p>
                      </div>
                    </div>
                    {s.resumo_familia && (
                      <p className="text-sm text-foreground mt-3 leading-relaxed border-l-2 border-primary/40 pl-3">
                        {s.resumo_familia}
                      </p>
                    )}
                  </Card>
                ))
              )}
            </TabsContent>
          )}

          {acesso.ver_programas && (
            <TabsContent value="programas" className="space-y-3 mt-4">
              {programas.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">Sem programas ativos.</Card>
              ) : (
                programas.map((p) => {
                  const nivel = rotuloNivel[p.nivel_desempenho] ?? rotuloNivel.linha_base;
                  return (
                    <Card key={p.id} className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <h3 className="font-heading font-semibold text-foreground">{p.nome}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{p.dominio.replace(/_/g, " ")}</p>
                          {p.meta && <p className="text-sm text-foreground mt-2">Meta: {p.meta}</p>}
                        </div>
                        <Badge variant="outline" className={nivel.cor}>{nivel.texto}</Badge>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          )}

          {acesso.ver_evolucao && (
            <TabsContent value="evolucao" className="mt-4">
              <Card className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-heading font-semibold mb-2">Evolução geral</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {acesso.crianca_nome} apresenta <strong>{programas.filter((p) => p.nivel_desempenho === "generalizado" || p.nivel_desempenho === "em_manutencao").length}</strong> de <strong>{programas.length}</strong> programas em níveis avançados (manutenção ou generalizado).
                </p>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <p className="text-center text-xs text-muted-foreground pt-6">
          Documento confidencial · Conformidade LGPD · TrackABA © {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
}
