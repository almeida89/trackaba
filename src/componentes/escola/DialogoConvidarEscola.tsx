import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CRIANCAS_DISPONIVEIS } from "@/componentes/sessoes/dadosSessoes";
import { AcessoEscola } from "./tiposEscola";
import { supabase } from "@/integrations/supabase/client";
import { mapearLinhaParaAcesso } from "./mapearAcessoEscola";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: (acesso: AcessoEscola) => void;
}

export function DialogoConvidarEscola({ aberto, aoFechar, aoCriar }: Props) {
  const [criancaId, setCriancaId] = useState("");
  const [escolaNome, setEscolaNome] = useState("");
  const [responsavelNome, setResponsavelNome] = useState("");
  const [responsavelCargo, setResponsavelCargo] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacao, setObservacao] = useState("");
  const [validadeDias, setValidadeDias] = useState("90");
  const [permissoes, setPermissoes] = useState({
    verSessoes: true,
    verEvolucao: true,
    verProgramas: true,
    verRelatorios: false,
    verIncidentes: false,
  });

  const reset = () => {
    setCriancaId("");
    setEscolaNome("");
    setResponsavelNome("");
    setResponsavelCargo("");
    setEmail("");
    setTelefone("");
    setObservacao("");
    setValidadeDias("90");
    setPermissoes({
      verSessoes: true,
      verEvolucao: true,
      verProgramas: true,
      verRelatorios: false,
      verIncidentes: false,
    });
  };

  const [salvando, setSalvando] = useState(false);

  const enviar = async () => {
    const crianca = CRIANCAS_DISPONIVEIS.find((c) => c.id === criancaId);
    if (!crianca || !escolaNome || !email || !responsavelNome) return;
    setSalvando(true);
    const expira = new Date();
    expira.setDate(expira.getDate() + Number(validadeDias));

    // Gera UUID determinístico a partir do id mock para casar com o esquema do banco
    const criancaUuid = /^[0-9a-f-]{36}$/i.test(crianca.id)
      ? crianca.id
      : crypto.randomUUID();

    const { data, error } = await supabase
      .from("acessos_escola")
      .insert({
        crianca_id: criancaUuid,
        crianca_nome: crianca.nome,
        escola_nome: escolaNome,
        responsavel_nome: responsavelNome,
        responsavel_cargo: responsavelCargo || "Responsável pedagógico",
        email,
        telefone: telefone || null,
        status: "pendente",
        expira_em: expira.toISOString(),
        ver_sessoes: permissoes.verSessoes,
        ver_evolucao: permissoes.verEvolucao,
        ver_programas: permissoes.verProgramas,
        ver_relatorios: permissoes.verRelatorios,
        ver_incidentes: permissoes.verIncidentes,
        observacao: observacao || null,
      })
      .select()
      .single();

    setSalvando(false);
    if (error || !data) {
      toast.error("Não foi possível criar o convite");
      return;
    }
    aoCriar(mapearLinhaParaAcesso(data));
    reset();
    aoFechar();
  };

  const togglePerm = (chave: keyof typeof permissoes) =>
    setPermissoes((p) => ({ ...p, [chave]: !p[chave] }));

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Mail className="h-5 w-5 text-primary" /> Convidar escola
          </DialogTitle>
          <DialogDescription>
            O acesso é restrito a uma única criança e às permissões selecionadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Criança vinculada *</Label>
              <Select value={criancaId} onValueChange={setCriancaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a criança" />
                </SelectTrigger>
                <SelectContent>
                  {CRIANCAS_DISPONIVEIS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Validade do acesso</Label>
              <Select value={validadeDias} onValueChange={setValidadeDias}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="60">60 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="180">6 meses</SelectItem>
                  <SelectItem value="365">1 ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nome da escola *</Label>
              <Input
                value={escolaNome}
                onChange={(e) => setEscolaNome(e.target.value)}
                placeholder="Ex: Colégio Sementinha"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nome do responsável *</Label>
              <Input
                value={responsavelNome}
                onChange={(e) => setResponsavelNome(e.target.value)}
                placeholder="Ex: Profa. Beatriz Lopes"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Input
                value={responsavelCargo}
                onChange={(e) => setResponsavelCargo(e.target.value)}
                placeholder="Ex: Professora regente"
              />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@escola.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-heading font-semibold">Permissões</Label>
            {[
              { k: "verSessoes", l: "Ver sessões realizadas", d: "Datas, terapeutas e tipo de atendimento" },
              { k: "verEvolucao", l: "Ver evolução diária", d: "Notas clínicas e progresso registrado" },
              { k: "verProgramas", l: "Ver programas terapêuticos", d: "Metas, objetivos e critérios" },
              { k: "verRelatorios", l: "Ver relatórios consolidados", d: "Gráficos e métricas mensais" },
              { k: "verIncidentes", l: "Ver registros de incidentes", d: "Comportamentos disruptivos e ABCs" },
            ].map((p) => (
              <div
                key={p.k}
                className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.l}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.d}</p>
                </div>
                <Switch
                  checked={permissoes[p.k as keyof typeof permissoes]}
                  onCheckedChange={() => togglePerm(p.k as keyof typeof permissoes)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Observação (opcional)</Label>
            <Textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Mensagem que aparecerá no convite..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button
            onClick={enviar}
            disabled={salvando || !criancaId || !escolaNome || !email || !responsavelNome}
            className="gap-2"
          >
            <Mail className="h-4 w-4" /> {salvando ? "Enviando..." : "Enviar convite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
