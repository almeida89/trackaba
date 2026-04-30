import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Stethoscope,
  Users,
  GraduationCap,
  ClipboardList,
  BookOpen,
  FileCheck,
  BarChart3,
  FileText,
  Paperclip,
  History,
  UserCheck,
  Loader2,
  Camera,
  Baby,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SessoesCrianca } from "@/componentes/sessoes/SessoesCrianca";
import { ProgramasCrianca } from "@/componentes/programas/ProgramasCrianca";
import { SecaoFamiliarCrianca } from "@/componentes/familia/SecaoFamiliarCrianca";
import { useCrianca, calcularIdade, formatarDataBR, CriancaDetalhe } from "@/hooks/useCrianca";

const abas = [
  { id: "cadastro", label: "Cadastro", icone: User },
  { id: "medico", label: "Médico", icone: Stethoscope },
  { id: "familiar", label: "Familiar", icone: Users },
  { id: "escola", label: "Escola", icone: GraduationCap },
  { id: "acompanhante", label: "Acomp. Escolar", icone: UserCheck },
  { id: "sessoes", label: "Sessões", icone: ClipboardList },
  { id: "programas", label: "Programas", icone: BookOpen },
  { id: "avaliacoes", label: "Avaliações", icone: FileCheck },
  { id: "graficos", label: "Gráficos", icone: BarChart3 },
  { id: "relatorios", label: "Relatórios", icone: FileText },
  { id: "anexos", label: "Anexos", icone: Paperclip },
  { id: "historico", label: "Histórico", icone: History },
];

function ConteudoCadastro({ crianca }: { crianca: CriancaDetalhe }) {
  const idade = calcularIdade(crianca.data_nascimento);
  const dadosPessoais: [string, string][] = [
    ["Nome Completo", crianca.nome],
    ["Data de Nascimento", formatarDataBR(crianca.data_nascimento)],
    ["Idade", `${idade} ${idade === 1 ? "ano" : "anos"}`],
    ["Responsável Principal", crianca.responsavel_principal || "—"],
    ["Telefone de Contato", crianca.telefone_contato || "—"],
    ["E-mail de Contato", crianca.email_contato || "—"],
  ];
  const dadosClinicos: [string, string][] = [
    ["Diagnóstico", crianca.diagnostico || "—"],
    ["Status", crianca.ativo ? "Ativo" : "Inativo"],
    ["Cadastrado em", formatarDataBR(crianca.criado_em)],
    ["Observações", crianca.observacoes || "—"],
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-foreground">Dados Pessoais</h3>
        {dadosPessoais.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <p className="text-xs text-muted-foreground">{rotulo}</p>
            <p className="text-sm font-medium text-foreground">{valor}</p>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <h3 className="font-heading font-semibold text-foreground">Informações Clínicas</h3>
        {dadosClinicos.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <p className="text-xs text-muted-foreground">{rotulo}</p>
            <p className="text-sm font-medium text-foreground whitespace-pre-wrap">{valor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaceholderAba({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <p className="text-sm">Seção <strong>{titulo}</strong> em desenvolvimento</p>
    </div>
  );
}

export default function PastaCrianca() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { crianca, carregando, enviarFoto, enviandoFoto } = useCrianca(id);
  const [abaAtiva, setAbaAtiva] = useState("cadastro");
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const aoSelecionarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    const tiposAceitos = ["image/jpeg", "image/png", "image/webp"];
    if (!tiposAceitos.includes(arquivo.type)) {
      toast.error("Use JPG, PNG ou WebP");
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 5MB)");
      return;
    }
    try {
      await enviarFoto(arquivo);
    } catch {
      // toast tratado no hook
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!crianca) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navegar("/criancas")}
          className="p-2 rounded-lg hover:bg-muted transition-colors inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-medium text-foreground">Criança não encontrada</p>
          <p className="text-sm text-muted-foreground mt-1">
            O cadastro pode ter sido removido ou você não tem acesso.
          </p>
        </div>
      </div>
    );
  }

  const idade = calcularIdade(crianca.data_nascimento);
  const status = crianca.ativo ? "Ativo" : "Inativo";

  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case "cadastro":
        return <ConteudoCadastro crianca={crianca} />;
      case "programas":
        return <ProgramasCrianca criancaId={crianca.id} criancaNome={crianca.nome} />;
      case "sessoes":
        return <SessoesCrianca criancaId={crianca.id} criancaNome={crianca.nome} />;
      case "familiar":
        return <SecaoFamiliarCrianca criancaId={crianca.id} criancaNome={crianca.nome} />;
      default:
        return <PlaceholderAba titulo={abas.find((a) => a.id === abaAtiva)?.label || ""} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navegar("/criancas")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="relative group">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
            {crianca.foto_url ? (
              <img
                src={crianca.foto_url}
                alt={crianca.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <Baby className="h-6 w-6 text-primary" />
            )}
          </div>
          <button
            type="button"
            onClick={() => inputFotoRef.current?.click()}
            disabled={enviandoFoto}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white disabled:opacity-100 disabled:bg-black/60"
            aria-label="Trocar foto"
          >
            {enviandoFoto ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={aoSelecionarFoto}
          />
        </div>

        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            {crianca.nome}
          </h1>
          <p className="text-sm text-muted-foreground">
            {idade} {idade === 1 ? "ano" : "anos"} • {crianca.diagnostico || "Sem diagnóstico"}
          </p>
        </div>
        <Badge
          className={cn(
            "ml-auto border",
            crianca.ativo
              ? "bg-status-success/15 text-status-success border-status-success/30"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {status}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-1 min-w-max pb-px">
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 whitespace-nowrap",
                abaAtiva === aba.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <aba.icone className="h-3.5 w-3.5" />
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in">{renderizarConteudo()}</div>
    </div>
  );
}
