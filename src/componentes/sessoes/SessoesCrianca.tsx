import { useMemo, useState } from "react";
import { Play, Plus, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CartaoSessao } from "./CartaoSessao";
import { DetalhesSessao } from "./DetalhesSessao";
import { DialogoNovaSessao } from "./DialogoNovaSessao";
import { SESSOES_INICIAIS } from "./dadosSessoes";
import { Sessao } from "./tiposSessoes";

interface Props {
  criancaId: string;
  criancaNome: string;
}

export function SessoesCrianca({ criancaId, criancaNome }: Props) {
  const [sessoes, setSessoes] = useState<Sessao[]>(SESSOES_INICIAIS);
  const [dialogoAberto, setDialogoAberto] = useState(false);

  const sessoesDaCrianca = useMemo(
    () =>
      sessoes
        .filter((s) => s.criancaId === criancaId)
        .sort((a, b) => (b.data + b.horaInicio).localeCompare(a.data + a.horaInicio)),
    [sessoes, criancaId]
  );

  const [selecionadaId, setSelecionadaId] = useState<string>(sessoesDaCrianca[0]?.id ?? "");
  const selecionada =
    sessoesDaCrianca.find((s) => s.id === selecionadaId) ?? sessoesDaCrianca[0];

  const salvar = (atualizada: Sessao) => {
    setSessoes((prev) => prev.map((s) => (s.id === atualizada.id ? atualizada : s)));
    toast.success("Sessão atualizada");
  };

  const criar = (nova: Sessao) => {
    const sessaoComCrianca: Sessao = { ...nova, criancaId, criancaNome };
    setSessoes((prev) => [sessaoComCrianca, ...prev]);
    setSelecionadaId(sessaoComCrianca.id);
    toast.success("Sessão criada");
  };

  const iniciarSessaoAgora = () => {
    const agora = new Date();
    const horaInicio = agora.toTimeString().slice(0, 5);
    const fim = new Date(agora.getTime() + 50 * 60000);
    const horaFim = fim.toTimeString().slice(0, 5);
    const nova: Sessao = {
      id: `s${Date.now()}`,
      criancaId,
      criancaNome,
      profissionalId: "p1",
      profissionalNome: "Dra. Ana Souza",
      data: agora.toISOString().split("T")[0],
      horaInicio,
      horaFim,
      duracaoMin: 50,
      tipo: "ABA",
      local: "clinica",
      status: "em_andamento",
      registros: [],
      narrativaAbc: [],
      reforcadores: [],
      anexos: [],
    };
    setSessoes((prev) => [nova, ...prev]);
    setSelecionadaId(nova.id);
    toast.success("Sessão iniciada agora");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-heading font-semibold text-foreground">
            Sessões de {criancaNome}
          </h3>
          <p className="text-sm text-muted-foreground">
            {sessoesDaCrianca.length} sessão(ões) registrada(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setDialogoAberto(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Agendar
          </Button>
          <Button onClick={iniciarSessaoAgora} className="gap-2">
            <Play className="h-4 w-4" /> Iniciar sessão
          </Button>
        </div>
      </div>

      {sessoesDaCrianca.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">
            Nenhuma sessão registrada para esta criança.
          </p>
          <Button onClick={iniciarSessaoAgora} className="gap-2">
            <Play className="h-4 w-4" /> Iniciar primeira sessão
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
          <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
            {sessoesDaCrianca.map((s) => (
              <CartaoSessao
                key={s.id}
                sessao={s}
                selecionado={s.id === selecionada?.id}
                aoSelecionar={() => setSelecionadaId(s.id)}
              />
            ))}
          </div>
          <div>
            {selecionada && (
              <DetalhesSessao key={selecionada.id} sessao={selecionada} aoSalvar={salvar} />
            )}
          </div>
        </div>
      )}

      <DialogoNovaSessao
        aberto={dialogoAberto}
        aoFechar={() => setDialogoAberto(false)}
        aoCriar={criar}
      />
    </div>
  );
}
