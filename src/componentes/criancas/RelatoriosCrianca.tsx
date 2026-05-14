import { FileText, Printer, Baby, Stethoscope, GraduationCap, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CriancaDetalhe, calcularIdade, formatarDataBR } from "@/hooks/useCrianca";

interface Props {
  crianca: CriancaDetalhe;
}

export function RelatoriosCrianca({ crianca }: Props) {
  const idade = calcularIdade(crianca.data_nascimento);

  const handlePrint = () => {
    window.print();
  };

  const secaoPessoal = [
    { rotulo: "Nome", valor: crianca.nome },
    { rotulo: "Data de Nascimento", valor: formatarDataBR(crianca.data_nascimento) },
    { rotulo: "Idade", valor: `${idade} ${idade === 1 ? "ano" : "anos"}` },
    { rotulo: "Diagnóstico", valor: crianca.diagnostico || "—" },
    { rotulo: "Responsável Principal", valor: crianca.responsavel_principal || "—" },
    { rotulo: "Telefone de Contato", valor: crianca.telefone_contato || "—" },
    { rotulo: "E-mail de Contato", valor: crianca.email_contato || "—" },
    { rotulo: "Status", valor: crianca.ativo ? "Ativo" : "Inativo" },
  ];

  const secaoMedico = [
    { rotulo: "Pediatra", valor: crianca.pediatra_nome || "—" },
    { rotulo: "Telefone do Pediatra", valor: crianca.pediatra_telefone || "—" },
    { rotulo: "Neurologista", valor: crianca.neurologista_nome || "—" },
    { rotulo: "Alergias", valor: crianca.alergias || "—" },
    { rotulo: "Medicações", valor: crianca.medicacoes || "—" },
  ];

  const secaoEscola = [
    { rotulo: "Escola", valor: crianca.escola_nome || "—" },
    { rotulo: "Série / Ano", valor: crianca.escola_serie || "—" },
    { rotulo: "Professor(a)", valor: crianca.escola_professor || "—" },
    { rotulo: "Telefone da Escola", valor: crianca.escola_telefone || "—" },
  ];

  const secaoAcompanhante = [
    { rotulo: "Profissional", valor: crianca.acomp_escolar_nome || "—" },
    { rotulo: "Carga Horária", valor: crianca.acomp_escolar_horario || "—" },
    { rotulo: "Objetivos", valor: crianca.acomp_escolar_objetivos || "—" },
    { rotulo: "Observações", valor: crianca.acomp_escolar_observacoes || "—" },
  ];

  return (
    <div className="space-y-6">
      {/* Botão de impressão */}
      <div className="flex justify-end print:hidden">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Cabeçalho do relatório */}
      <div className="text-center space-y-2 pb-4 border-b border-border print:border-black">
        <h2 className="text-2xl font-heading font-bold text-foreground print:text-black">
          Ficha da Criança
        </h2>
        <p className="text-sm text-muted-foreground print:text-black">
          Relatório consolidado gerado em {new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Pessoais */}
        <Card className="print:shadow-none print:border-black print:border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Baby className="h-5 w-5 text-primary print:text-black" />
              <CardTitle className="text-base">Dados Pessoais</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {secaoPessoal.map((item) => (
              <div key={item.rotulo} className="flex justify-between items-start gap-4">
                <span className="text-sm text-muted-foreground print:text-black">{item.rotulo}</span>
                <span className="text-sm font-medium text-foreground print:text-black text-right">
                  {item.valor}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Informações Médicas */}
        <Card className="print:shadow-none print:border-black print:border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary print:text-black" />
              <CardTitle className="text-base">Informações Médicas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {secaoMedico.map((item) => (
              <div key={item.rotulo} className="flex justify-between items-start gap-4">
                <span className="text-sm text-muted-foreground print:text-black">{item.rotulo}</span>
                <span className="text-sm font-medium text-foreground print:text-black text-right whitespace-pre-wrap">
                  {item.valor}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dados Escolares */}
        <Card className="print:shadow-none print:border-black print:border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary print:text-black" />
              <CardTitle className="text-base">Dados Escolares</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {secaoEscola.map((item) => (
              <div key={item.rotulo} className="flex justify-between items-start gap-4">
                <span className="text-sm text-muted-foreground print:text-black">{item.rotulo}</span>
                <span className="text-sm font-medium text-foreground print:text-black text-right">
                  {item.valor}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Acompanhante Escolar */}
        <Card className="print:shadow-none print:border-black print:border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary print:text-black" />
              <CardTitle className="text-base">Acompanhante Escolar</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {secaoAcompanhante.map((item) => (
              <div key={item.rotulo} className="flex justify-between items-start gap-4">
                <span className="text-sm text-muted-foreground print:text-black">{item.rotulo}</span>
                <span className="text-sm font-medium text-foreground print:text-black text-right whitespace-pre-wrap">
                  {item.valor}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator className="print:bg-black" />

      {/* Rodapé */}
      <div className="text-center text-xs text-muted-foreground print:text-black pt-2">
        <p>Documento gerado pelo TrackABA — CRM Clínico para Terapia ABA</p>
        <p className="mt-1">Este relatório é de uso interno e confidencial.</p>
      </div>
    </div>
  );
}
