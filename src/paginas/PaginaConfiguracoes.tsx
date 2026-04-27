import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, Bell, Plug, Shield, Palette, Save, Trash2, KeyRound, Mail, MessageSquare, Calendar as CalendarIcon, FileSignature, Users } from "lucide-react";
import { AbaUsuarios } from "@/componentes/configuracoes/AbaUsuarios";
import { toast } from "sonner";

export default function PaginaConfiguracoes() {
  // Clínica
  const [clinica, setClinica] = useState({
    razaoSocial: "TrackABA Clínica de Comportamento Ltda.",
    nomeFantasia: "TrackABA",
    cnpj: "12.345.678/0001-90",
    responsavelTecnico: "Dra. Ana Carolina",
    registroProfissional: "CRP 06/123456",
    email: "contato@trackaba.com.br",
    telefone: "(11) 4002-8922",
    endereco: "Av. Paulista, 1000 — Bela Vista, São Paulo/SP",
    cep: "01310-100",
    horarioAtendimento: "Segunda a sexta, 08h às 19h. Sábados, 08h às 12h.",
    politicaCancelamento: "Cancelamentos com até 24h de antecedência não geram cobrança.",
  });

  // Perfil
  const [perfil, setPerfil] = useState({
    nome: "Dra. Ana Carolina",
    email: "ana.carolina@trackaba.com.br",
    cargo: "Analista do Comportamento",
    registro: "CRP 06/123456",
    telefone: "(11) 99999-0000",
  });

  // Notificações
  const [notif, setNotif] = useState({
    emailSessoes: true,
    emailRelatorios: true,
    emailFinanceiro: false,
    pushAgendamentos: true,
    whatsappLembretes: true,
    resumoSemanal: true,
  });

  // Integrações
  const [integracoes, setIntegracoes] = useState({
    googleCalendar: false,
    whatsappBusiness: true,
    smtpEmail: true,
    assinaturaDigital: false,
  });

  // Segurança
  const [seguranca, setSeguranca] = useState({
    autenticacaoDoisFatores: true,
    sessaoExpiraMinutos: "60",
    bloqueioApos: "5",
    auditoria: true,
  });

  // Aparência
  const [aparencia, setAparencia] = useState({
    tema: "claro",
    densidade: "confortavel",
    idioma: "pt-BR",
    fusoHorario: "America/Sao_Paulo",
    formatoData: "dd/MM/yyyy",
  });

  const salvar = (secao: string) => toast.success(`${secao} salvo(a) com sucesso`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie a clínica, sua conta, notificações, integrações, segurança e aparência do sistema.
        </p>
      </div>

      <Tabs defaultValue="clinica" className="w-full">
        <div className="-mx-3 sm:-mx-4 lg:mx-0 overflow-x-auto">
        <TabsList className="inline-flex w-max lg:w-full lg:grid lg:grid-cols-7 px-3 sm:px-4 lg:px-0">
          <TabsTrigger value="clinica"><Building2 className="h-4 w-4 mr-1.5" />Clínica</TabsTrigger>
          <TabsTrigger value="perfil"><User className="h-4 w-4 mr-1.5" />Perfil</TabsTrigger>
          <TabsTrigger value="usuarios"><Users className="h-4 w-4 mr-1.5" />Usuários</TabsTrigger>
          <TabsTrigger value="notificacoes"><Bell className="h-4 w-4 mr-1.5" />Avisos</TabsTrigger>
          <TabsTrigger value="integracoes"><Plug className="h-4 w-4 mr-1.5" />Integrações</TabsTrigger>
          <TabsTrigger value="seguranca"><Shield className="h-4 w-4 mr-1.5" />Segurança</TabsTrigger>
          <TabsTrigger value="aparencia"><Palette className="h-4 w-4 mr-1.5" />Aparência</TabsTrigger>
        </TabsList>
        </div>

        {/* CLÍNICA */}
        <TabsContent value="clinica" className="pt-4">
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="font-heading font-semibold text-foreground">Dados da clínica</h2>
              <p className="text-sm text-muted-foreground">Informações utilizadas em relatórios, recibos e comunicações oficiais.</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Razão social</Label>
                <Input value={clinica.razaoSocial} onChange={(e) => setClinica({ ...clinica, razaoSocial: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Nome fantasia</Label>
                <Input value={clinica.nomeFantasia} onChange={(e) => setClinica({ ...clinica, nomeFantasia: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>CNPJ</Label>
                <Input value={clinica.cnpj} onChange={(e) => setClinica({ ...clinica, cnpj: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Responsável técnico</Label>
                <Input value={clinica.responsavelTecnico} onChange={(e) => setClinica({ ...clinica, responsavelTecnico: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Registro profissional</Label>
                <Input value={clinica.registroProfissional} onChange={(e) => setClinica({ ...clinica, registroProfissional: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail institucional</Label>
                <Input type="email" value={clinica.email} onChange={(e) => setClinica({ ...clinica, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input value={clinica.telefone} onChange={(e) => setClinica({ ...clinica, telefone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>CEP</Label>
                <Input value={clinica.cep} onChange={(e) => setClinica({ ...clinica, cep: e.target.value })} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Endereço completo</Label>
                <Input value={clinica.endereco} onChange={(e) => setClinica({ ...clinica, endereco: e.target.value })} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Horário de atendimento</Label>
                <Textarea rows={2} value={clinica.horarioAtendimento} onChange={(e) => setClinica({ ...clinica, horarioAtendimento: e.target.value })} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Política de cancelamento</Label>
                <Textarea rows={3} value={clinica.politicaCancelamento} onChange={(e) => setClinica({ ...clinica, politicaCancelamento: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => salvar("Dados da clínica")}><Save className="h-4 w-4 mr-2" />Salvar alterações</Button>
            </div>
          </Card>
        </TabsContent>

        {/* PERFIL */}
        <TabsContent value="perfil" className="pt-4">
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="font-heading font-semibold text-foreground">Meu perfil</h2>
              <p className="text-sm text-muted-foreground">Dados utilizados para identificação no sistema e em relatórios assinados.</p>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/15 text-primary flex items-center justify-center font-heading font-bold text-2xl">
                AC
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{perfil.nome}</p>
                <p className="text-sm text-muted-foreground">{perfil.cargo} · {perfil.registro}</p>
                <Badge variant="outline" className="text-xs">Administrador</Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome completo</Label>
                <Input value={perfil.nome} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" value={perfil.email} onChange={(e) => setPerfil({ ...perfil, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Cargo</Label>
                <Input value={perfil.cargo} onChange={(e) => setPerfil({ ...perfil, cargo: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Registro profissional</Label>
                <Input value={perfil.registro} onChange={(e) => setPerfil({ ...perfil, registro: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input value={perfil.telefone} onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <Button variant="outline"><KeyRound className="h-4 w-4 mr-2" />Alterar senha</Button>
              <Button onClick={() => salvar("Perfil")}><Save className="h-4 w-4 mr-2" />Salvar perfil</Button>
            </div>
          </Card>
        </TabsContent>

        {/* USUÁRIOS */}
        <TabsContent value="usuarios" className="pt-4">
          <AbaUsuarios />
        </TabsContent>

        {/* NOTIFICAÇÕES */}
        <TabsContent value="notificacoes" className="pt-4">
          <Card className="p-6 space-y-4">
            <div>
              <h2 className="font-heading font-semibold text-foreground">Preferências de notificação</h2>
              <p className="text-sm text-muted-foreground">Defina como e quando você quer ser avisado sobre eventos importantes.</p>
            </div>
            <Separator />
            {[
              { chave: "emailSessoes" as const, titulo: "Resumo de sessões por e-mail", desc: "Receba ao final do dia um e-mail com as sessões realizadas.", icone: Mail },
              { chave: "emailRelatorios" as const, titulo: "Novos relatórios gerados", desc: "Notificar quando relatórios clínicos forem emitidos.", icone: FileSignature },
              { chave: "emailFinanceiro" as const, titulo: "Alertas financeiros", desc: "Cobranças, pagamentos e inadimplência.", icone: Mail },
              { chave: "pushAgendamentos" as const, titulo: "Push de agendamentos", desc: "Avisos no navegador sobre novos agendamentos e mudanças.", icone: CalendarIcon },
              { chave: "whatsappLembretes" as const, titulo: "Lembretes via WhatsApp", desc: "Enviar lembretes automáticos aos responsáveis 24h antes da sessão.", icone: MessageSquare },
              { chave: "resumoSemanal" as const, titulo: "Resumo semanal", desc: "Receba todas as segundas um panorama da semana anterior.", icone: Mail },
            ].map(({ chave, titulo, desc, icone: Icone }) => (
              <div key={chave} className="flex items-start justify-between gap-4 py-2">
                <div className="flex gap-3">
                  <div className="p-2 rounded-md bg-muted text-muted-foreground"><Icone className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{titulo}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
                <Switch checked={notif[chave]} onCheckedChange={(v) => setNotif({ ...notif, [chave]: v })} />
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button onClick={() => salvar("Notificações")}><Save className="h-4 w-4 mr-2" />Salvar preferências</Button>
            </div>
          </Card>
        </TabsContent>

        {/* INTEGRAÇÕES */}
        <TabsContent value="integracoes" className="pt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { chave: "googleCalendar" as const, titulo: "Google Calendar", desc: "Sincronize automaticamente os agendamentos com o Google Calendar.", badge: "Agenda" },
              { chave: "whatsappBusiness" as const, titulo: "WhatsApp Business", desc: "Envie lembretes, confirmações e relatórios diretamente para responsáveis.", badge: "Comunicação" },
              { chave: "smtpEmail" as const, titulo: "Servidor SMTP", desc: "Envie e-mails transacionais com seu próprio domínio.", badge: "E-mail" },
              { chave: "assinaturaDigital" as const, titulo: "Assinatura digital", desc: "Permita que profissionais assinem relatórios eletronicamente.", badge: "Documentos" },
            ].map((i) => (
              <Card key={i.chave} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold text-foreground">{i.titulo}</h3>
                      <Badge variant="outline" className="text-xs">{i.badge}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{i.desc}</p>
                  </div>
                  <Switch
                    checked={integracoes[i.chave]}
                    onCheckedChange={(v) => {
                      setIntegracoes({ ...integracoes, [i.chave]: v });
                      toast.success(`${i.titulo} ${v ? "ativada" : "desativada"}`);
                    }}
                  />
                </div>
                <Badge className={integracoes[i.chave] ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground"} variant="outline">
                  {integracoes[i.chave] ? "Conectado" : "Desconectado"}
                </Badge>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SEGURANÇA */}
        <TabsContent value="seguranca" className="pt-4">
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="font-heading font-semibold text-foreground">Segurança e acesso</h2>
              <p className="text-sm text-muted-foreground">Proteja os dados clínicos com políticas de autenticação e auditoria.</p>
            </div>
            <Separator />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Autenticação em dois fatores (2FA)</p>
                <p className="text-xs text-muted-foreground">Exige um código adicional no login para todos os usuários administradores.</p>
              </div>
              <Switch checked={seguranca.autenticacaoDoisFatores} onCheckedChange={(v) => setSeguranca({ ...seguranca, autenticacaoDoisFatores: v })} />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Registro de auditoria</p>
                <p className="text-xs text-muted-foreground">Manter histórico detalhado de ações sensíveis no sistema.</p>
              </div>
              <Switch checked={seguranca.auditoria} onCheckedChange={(v) => setSeguranca({ ...seguranca, auditoria: v })} />
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Sessão expira após (minutos)</Label>
                <Input type="number" value={seguranca.sessaoExpiraMinutos} onChange={(e) => setSeguranca({ ...seguranca, sessaoExpiraMinutos: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Bloquear conta após N tentativas</Label>
                <Input type="number" value={seguranca.bloqueioApos} onChange={(e) => setSeguranca({ ...seguranca, bloqueioApos: e.target.value })} />
              </div>
            </div>
            <Separator />
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
              <p className="text-sm font-medium text-destructive">Zona de perigo</p>
              <p className="text-xs text-muted-foreground">Excluir a conta encerra o acesso e remove permanentemente os dados após 30 dias.</p>
              <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-2" />Solicitar exclusão de conta</Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => salvar("Segurança")}><Save className="h-4 w-4 mr-2" />Salvar políticas</Button>
            </div>
          </Card>
        </TabsContent>

        {/* APARÊNCIA */}
        <TabsContent value="aparencia" className="pt-4">
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="font-heading font-semibold text-foreground">Aparência e localização</h2>
              <p className="text-sm text-muted-foreground">Personalize a interface conforme sua preferência de uso.</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tema</Label>
                <Select value={aparencia.tema} onValueChange={(v) => setAparencia({ ...aparencia, tema: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claro">Claro</SelectItem>
                    <SelectItem value="escuro">Escuro</SelectItem>
                    <SelectItem value="sistema">Seguir sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Densidade da interface</Label>
                <Select value={aparencia.densidade} onValueChange={(v) => setAparencia({ ...aparencia, densidade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compacta">Compacta</SelectItem>
                    <SelectItem value="confortavel">Confortável</SelectItem>
                    <SelectItem value="espacosa">Espaçosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Idioma</Label>
                <Select value={aparencia.idioma} onValueChange={(v) => setAparencia({ ...aparencia, idioma: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fuso horário</Label>
                <Select value={aparencia.fusoHorario} onValueChange={(v) => setAparencia({ ...aparencia, fusoHorario: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                    <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Formato de data</Label>
                <Select value={aparencia.formatoData} onValueChange={(v) => setAparencia({ ...aparencia, formatoData: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">31/12/2025</SelectItem>
                    <SelectItem value="yyyy-MM-dd">2025-12-31</SelectItem>
                    <SelectItem value="MM/dd/yyyy">12/31/2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => salvar("Aparência")}><Save className="h-4 w-4 mr-2" />Salvar preferências</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
