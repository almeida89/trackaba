import { useState } from "react";
import { Users, Mail, Phone, Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/componentes/EmptyState";
import { DialogoFamiliarCrianca } from "./DialogoFamiliarCrianca";
import {
  FamiliarCrianca,
  ParentescoDb,
  useFamiliaresCrianca,
} from "@/hooks/useFamiliaresCrianca";
import { useUserRole } from "@/hooks/useUserRole";

interface Props {
  criancaId: string;
  criancaNome: string;
}

const rotuloParentesco: Record<ParentescoDb, string> = {
  mae: "Mãe",
  pai: "Pai",
  avo: "Avó/Avô",
  tio_tia: "Tio(a)",
  responsavel_legal: "Responsável legal",
  outro: "Outro",
};

export function SecaoFamiliarCrianca({ criancaId, criancaNome }: Props) {
  const { papel } = useUserRole();
  const podeGerenciar = papel === "admin" || papel === "coordenador";
  const { familiares, carregando, criar, atualizar, remover, salvando } =
    useFamiliaresCrianca(criancaId);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [editando, setEditando] = useState<FamiliarCrianca | null>(null);

  const abrirNovo = () => {
    setEditando(null);
    setDialogoAberto(true);
  };
  const abrirEdicao = (f: FamiliarCrianca) => {
    setEditando(f);
    setDialogoAberto(true);
  };

  const iniciais = (nome: string) => {
    const partes = nome.trim().split(/\s+/);
    return ((partes[0]?.[0] || "") + (partes[partes.length - 1]?.[0] || "")).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-heading font-semibold text-foreground text-lg">
            Núcleo familiar
          </h3>
          <p className="text-sm text-muted-foreground">
            Responsáveis com acesso ao portal vinculados a {criancaNome}.
          </p>
        </div>
        {podeGerenciar && (
          <Button onClick={abrirNovo} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Novo familiar
          </Button>
        )}
      </div>

      {carregando ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : familiares.length === 0 ? (
        <EmptyState
          icone={Users}
          titulo="Nenhum familiar cadastrado"
          descricao="Cadastre o responsável principal para liberar o acesso ao portal da família."
          acaoTexto={podeGerenciar ? "Cadastrar familiar" : undefined}
          aoClicar={podeGerenciar ? abrirNovo : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {familiares.map((f) => (
            <div
              key={f.vinculoId}
              className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-full bg-secondary/15 flex items-center justify-center shrink-0 font-heading font-semibold text-secondary">
                  {iniciais(f.nome)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-semibold text-foreground truncate">
                    {f.nome}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {rotuloParentesco[f.parentesco]}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{f.telefone || "—"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {f.podeVerEvolucao && (
                  <Badge variant="secondary" className="text-[11px] font-normal">
                    Vê evolução
                  </Badge>
                )}
                {f.podeVerSessoes && (
                  <Badge variant="secondary" className="text-[11px] font-normal">
                    Vê sessões
                  </Badge>
                )}
              </div>
              {podeGerenciar && (
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => abrirEdicao(f)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Remover ${f.nome} do núcleo familiar?`)) {
                        void remover(f.vinculoId);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <DialogoFamiliarCrianca
        aberto={dialogoAberto}
        aoFechar={() => setDialogoAberto(false)}
        familiar={editando}
        aoCriar={criar}
        aoAtualizar={atualizar}
        salvando={salvando}
      />
    </div>
  );
}
