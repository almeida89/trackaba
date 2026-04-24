import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CartaoEstatistica } from "@/componentes/CartaoEstatistica";
import { ClipboardList, Plus, Search, FileCheck2, Clock, AlertCircle, Pencil, Calendar } from "lucide-react";
import { Avaliacao } from "@/componentes/avaliacoes/tiposAvaliacoes";
import { avaliacoesIniciais, corStatus, protocolosDisponiveis, rotuloStatus } from "@/componentes/avaliacoes/dadosAvaliacoes";
import { DialogoAvaliacao } from "@/componentes/avaliacoes/DialogoAvaliacao";

const criancasMock = [
  { id: "1", nome: "Lucas Almeida" },
  { id: "2", nome: "Maria Eduarda" },
  { id: "3", nome: "Pedro Henrique" },
];

export default function PaginaAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(avaliacoesIniciais);
  const [busca, setBusca] = useState("");
  const [filtroProtocolo, setFiltroProtocolo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Avaliacao | null>(null);

  const filtradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return avaliacoes.filter((a) => {
      const okBusca = !termo
        || a.criancaNome.toLowerCase().includes(termo)
        || a.titulo.toLowerCase().includes(termo)
        || a.responsavel.toLowerCase().includes(termo);
      const okProtocolo = filtroProtocolo === "todos" || a.protocolo === filtroProtocolo;
      const okStatus = filtroStatus === "todos" || a.status === filtroStatus;
      return okBusca && okProtocolo && okStatus;
    });
  }, [avaliacoes, busca, filtroProtocolo, filtroStatus]);

  const stats = useMemo(() => ({
    total: avaliacoes.length,
    concluidas: avaliacoes.filter((a) => a.status === "concluida").length,
    andamento: avaliacoes.filter((a) => a.status === "em_andamento").length,
    pendentes: avaliacoes.filter((a) => a.status === "rascunho" || a.status === "revisao").length,
  }), [avaliacoes]);

  const salvar = (av: Avaliacao) => {
    setAvaliacoes((prev) => {
      const existe = prev.find((p) => p.id === av.id);
      return existe ? prev.map((p) => (p.id === av.id ? av : p)) : [av, ...prev];
    });
  };

  const abrirNova = () => { setEditando(null); setAberto(true); };
  const abrirEdicao = (a: Avaliacao) => { setEditando(a); setAberto(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Avaliações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aplique protocolos padronizados (VB-MAPP, ABLLS-R, AFLS, Vineland) e acompanhe o progresso clínico.
          </p>
        </div>
        <Button onClick={abrirNova}>
          <Plus className="h-4 w-4 mr-2" /> Nova avaliação
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CartaoEstatistica titulo="Total" valor={stats.total} icone={ClipboardList} />
        <CartaoEstatistica titulo="Concluídas" valor={stats.concluidas} icone={FileCheck2} variante="sucesso" />
        <CartaoEstatistica titulo="Em andamento" valor={stats.andamento} icone={Clock} variante="aviso" />
        <CartaoEstatistica titulo="Rascunho/Revisão" valor={stats.pendentes} icone={AlertCircle} variante="info" />
      </div>

      <Tabs defaultValue="lista" className="w-full">
        <TabsList>
          <TabsTrigger value="lista">Avaliações</TabsTrigger>
          <TabsTrigger value="protocolos">Protocolos</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4 pt-4">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por criança, título ou responsável..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filtroProtocolo} onValueChange={setFiltroProtocolo}>
                <SelectTrigger><SelectValue placeholder="Protocolo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os protocolos</SelectItem>
                  {protocolosDisponiveis.map((p) => (
                    <SelectItem key={p.valor} value={p.valor}>{p.valor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="em_andamento">Em andamento</SelectItem>
                  <SelectItem value="revisao">Em revisão</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground mt-3">
              Mostrando <strong>{filtradas.length}</strong> de <strong>{avaliacoes.length}</strong> avaliações
            </div>
          </Card>

          <div className="grid gap-3">
            {filtradas.map((a) => {
              const pct = a.pontuacaoMaxima ? Math.round((a.pontuacaoTotal / a.pontuacaoMaxima) * 100) : 0;
              return (
                <Card key={a.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono">{a.protocolo}</Badge>
                        <Badge className={corStatus[a.status]} variant="outline">{rotuloStatus[a.status]}</Badge>
                      </div>
                      <h3 className="font-heading font-semibold text-foreground mt-2">{a.titulo}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {a.criancaNome} · {a.responsavel} {a.cargoResponsavel && `(${a.cargoResponsavel})`}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Início {new Date(a.dataInicio).toLocaleDateString("pt-BR")}
                        </span>
                        {a.dataConclusao && (
                          <span>Conclusão {new Date(a.dataConclusao).toLocaleDateString("pt-BR")}</span>
                        )}
                        {a.proximaReavaliacao && (
                          <span>Reavaliação {new Date(a.proximaReavaliacao).toLocaleDateString("pt-BR")}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => abrirEdicao(a)}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" /> Abrir
                    </Button>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Pontuação geral</span>
                      <span className="font-mono font-medium">{a.pontuacaoTotal} / {a.pontuacaoMaxima} ({pct}%)</span>
                    </div>
                    <Progress value={pct} />
                  </div>

                  {a.resumoClinico && (
                    <p className="text-sm text-muted-foreground mt-3 italic line-clamp-2">"{a.resumoClinico}"</p>
                  )}
                </Card>
              );
            })}
            {filtradas.length === 0 && (
              <Card className="p-12 text-center text-sm text-muted-foreground">
                Nenhuma avaliação encontrada com os filtros atuais.
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="protocolos" className="pt-4">
          <div className="grid md:grid-cols-2 gap-3">
            {protocolosDisponiveis.map((p) => (
              <Card key={p.valor} className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-semibold text-foreground">{p.valor}</h4>
                  <Badge variant="outline" className="text-xs">{p.faixaEtaria}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{p.descricao}</p>
                <p className="text-xs text-muted-foreground mt-3">
                  {(protocolosDisponiveis.length, 0)}
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <DialogoAvaliacao
        aberto={aberto}
        onOpenChange={setAberto}
        avaliacao={editando}
        onSalvar={salvar}
        criancas={criancasMock}
      />
    </div>
  );
}
