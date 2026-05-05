import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, TrendingUp, MessageSquare, Heart, Loader2, LogOut } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface Crianca {
  id: string;
  nome: string;
  data_nascimento: string;
  diagnostico: string | null;
  foto_url: string | null;
}

interface Sessao {
  id: string;
  data_sessao: string;
  duracao_minutos: number;
  terapeuta_nome: string;
  resumo_familia: string | null;
  humor_final: number | null;
}

interface ProgramaCount {
  total: number;
  avancados: number;
}

const emoji = ["😢", "😐", "🙂", "😊", "🤩"];

export default function PaginaPortalFamilia() {
  const { user, sair } = useAuth();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [contagemProgramas, setContagemProgramas] = useState<ProgramaCount>({ total: 0, avancados: 0 });

  useEffect(() => {
    const carregar = async () => {
      if (!user) return;
      setCarregando(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      const { data: vinculos } = await sb
        .from("familia_membros")
        .select("crianca_id")
        .eq("user_id", user.id);

      const ids = (vinculos ?? []).map((v: { crianca_id: string }) => v.crianca_id);
      if (ids.length === 0) {
        setCarregando(false);
        return;
      }

      const { data: criancasData } = await sb
        .from("criancas")
        .select("id, nome, data_nascimento, diagnostico, foto_url")
        .in("id", ids);
      setCriancas(criancasData ?? []);

      const { data: sessoesData } = await sb
        .from("sessoes")
        .select("id, data_sessao, duracao_minutos, terapeuta_nome, resumo_familia, humor_final")
        .in("crianca_id", ids)
        .order("data_sessao", { ascending: false })
        .limit(5);
      setSessoes(sessoesData ?? []);

      const { data: programasData } = await sb
        .from("programas")
        .select("nivel_desempenho")
        .in("crianca_id", ids)
        .eq("ativo", true);
      const total = programasData?.length ?? 0;
      const avancados =
        programasData?.filter((p: { nivel_desempenho: string }) =>
          ["em_manutencao", "generalizado", "independente"].includes(p.nivel_desempenho),
        ).length ?? 0;
      setContagemProgramas({ total, avancados });

      setCarregando(false);
    };
    carregar();
  }, [user]);

  const aoSair = async () => {
    await sair();
    navigate("/auth", { replace: true });
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (criancas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center space-y-3">
          <Heart className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-xl font-heading font-bold">Bem-vindo ao TrackABA</h1>
          <p className="text-sm text-muted-foreground">
            Sua conta ainda não foi vinculada a nenhuma criança. Entre em contato com a clínica para liberação.
          </p>
          <Button onClick={aoSair} variant="outline" className="mt-4">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </Card>
      </div>
    );
  }

  const crianca = criancas[0]; // demo: 1 criança por família
  const idade =
    new Date().getFullYear() -
    new Date(crianca.data_nascimento).getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-foreground">TrackABA · Portal da Família</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={aoSair}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Card da criança */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-2xl font-heading font-bold ring-4 ring-background shadow-md">
              {crianca.nome.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Acompanhando</p>
              <h2 className="text-2xl font-heading font-bold text-foreground truncate leading-tight">{crianca.nome}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-xs">{idade} anos</Badge>
                {crianca.diagnostico && (
                  <Badge variant="outline" className="text-xs">{crianca.diagnostico}</Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Estatísticas amigáveis */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-heading font-bold text-foreground leading-none">{sessoes.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Últimas sessões</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-heading font-bold text-foreground leading-none">
                  {contagemProgramas.avancados}<span className="text-base text-muted-foreground font-medium">/{contagemProgramas.total}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Programas avançados</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Últimas evoluções */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="font-heading font-semibold text-foreground">Últimas evoluções</h3>
            <p className="text-xs text-muted-foreground">Mensagens da equipe terapêutica para a família</p>
          </div>

          {sessoes.length === 0 ? (
            <Alert>
              <AlertDescription>Ainda não há sessões registradas.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {sessoes.map((s) => (
                <div key={s.id} className="border-l-2 border-primary/40 pl-4 py-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(s.data_sessao).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                    })}
                    <span>·</span>
                    <span>{s.terapeuta_nome}</span>
                    {s.humor_final && (
                      <Badge variant="secondary" className="ml-auto text-base px-2 py-0">
                        {emoji[s.humor_final - 1]}
                      </Badge>
                    )}
                  </div>
                  {s.resumo_familia ? (
                    <p className="text-sm text-foreground leading-relaxed">{s.resumo_familia}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Resumo não disponível.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* CTA para falar com a equipe */}
        <Card className="p-5 bg-accent/5 border-accent/20">
          <div className="flex items-center gap-3 flex-wrap">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">Quer falar com a equipe?</p>
              <p className="text-xs text-muted-foreground">Envie uma mensagem para a coordenação.</p>
            </div>
            <Button
              onClick={() => toast.success("Mensagem enviada para a coordenação!")}
              className="w-full sm:w-auto"
            >
              Enviar mensagem
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
