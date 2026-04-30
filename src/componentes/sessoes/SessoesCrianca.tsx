import { useMemo, useState } from "react";
import { Plus, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CartaoSessao } from "./CartaoSessao";
import { DetalhesSessao } from "./DetalhesSessao";
import { DialogoNovaSessao } from "./DialogoNovaSessao";
import { useSessoesBanco } from "@/hooks/useSessoesBanco";

interface Props {
  criancaId: string;
  criancaNome: string;
}

export function SessoesCrianca({ criancaId, criancaNome }: Props) {
  const { sessoes, carregando, criarSessao, salvarSessao, finalizarSessao, assinarSessao } = useSessoesBanco();
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [selecionadaId, setSelecionadaId] = useState<string>("");

  const sessoesDaCrianca = useMemo(
    () => sessoes.filter((s) => s.criancaId === criancaId),
    [sessoes, criancaId]
  );

  const selecionada =
    sessoesDaCrianca.find((s) => s.id === selecionadaId) ?? sessoesDaCrianca[0];

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
        <Button onClick={() => setDialogoAberto(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Nova sessão
        </Button>
      </div>

      {carregando ? (
        <Card className="p-12 text-center border-dashed">
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
        </Card>
      ) : sessoesDaCrianca.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">
            Nenhuma sessão registrada para esta criança.
          </p>
          <Button onClick={() => setDialogoAberto(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Criar primeira sessão
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
              <DetalhesSessao
                key={selecionada.id}
                sessao={selecionada}
                aoSalvar={salvarSessao}
                aoFinalizar={finalizarSessao}
                aoAssinar={assinarSessao}
              />
            )}
          </div>
        </div>
      )}

      <DialogoNovaSessao
        aberto={dialogoAberto}
        aoFechar={() => setDialogoAberto(false)}
        criancaPreSelecionadaId={criancaId}
        criancaPreSelecionadaNome={criancaNome}
        aoCriar={async (entrada) => {
          const id = await criarSessao(entrada);
          if (id) setSelecionadaId(id);
        }}
      />
    </div>
  );
}
