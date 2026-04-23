import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SESSOES_INICIAIS } from "@/componentes/sessoes/dadosSessoes";
import { PROGRAMAS_CRIANCA_INICIAIS } from "@/componentes/programas/dadosProgramas";

export type TipoRelatorio =
  | "evolucao"
  | "sessoes"
  | "programas"
  | "consolidado";

export interface OpcoesRelatorio {
  tipo: TipoRelatorio;
  criancaId: string;
  criancaNome: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string;
  observacoes?: string;
  responsavelClinica?: string;
}

const COR_PRIMARIA: [number, number, number] = [38, 166, 154];
const COR_TEXTO: [number, number, number] = [33, 47, 60];
const COR_MUTED: [number, number, number] = [100, 116, 130];

const tiposLabel: Record<string, string> = {
  ABA: "ABA",
  Fono: "Fonoaudiologia",
  TO: "Terapia Ocupacional",
  Psico: "Psicologia",
  Psicopedagogia: "Psicopedagogia",
};

const titulos: Record<TipoRelatorio, string> = {
  evolucao: "Relatório de Evolução Clínica",
  sessoes: "Relatório de Sessões",
  programas: "Relatório de Programas",
  consolidado: "Relatório Consolidado",
};

const formatarData = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");

function secaoTitulo(doc: jsPDF, titulo: string, y: number, margem: number) {
  const altura = doc.internal.pageSize.getHeight();
  if (y > altura - 100) {
    doc.addPage();
    y = 60;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COR_PRIMARIA);
  doc.text(titulo, margem, y);
  doc.setDrawColor(...COR_PRIMARIA);
  doc.setLineWidth(0.8);
  doc.line(margem, y + 4, margem + 60, y + 4);
  return y + 14;
}

export function gerarRelatorioPDF(opcoes: OpcoesRelatorio) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const larguraPag = doc.internal.pageSize.getWidth();
  const margem = 40;

  // Cabeçalho
  doc.setFillColor(...COR_PRIMARIA);
  doc.rect(0, 0, larguraPag, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`${titulos[opcoes.tipo]} — TrackABA`, margem, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Emitido em ${new Date().toLocaleDateString("pt-BR")}`,
    margem,
    52
  );

  let y = 95;
  doc.setTextColor(...COR_TEXTO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Criança: ${opcoes.criancaNome}`, margem, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COR_MUTED);
  doc.text(
    `Período: ${formatarData(opcoes.dataInicio)} a ${formatarData(opcoes.dataFim)}`,
    margem,
    y
  );
  y += 14;
  if (opcoes.responsavelClinica) {
    doc.text(`Responsável clínico: ${opcoes.responsavelClinica}`, margem, y);
    y += 14;
  }
  y += 10;

  // Filtra dados
  const dentroPeriodo = (data: string) =>
    data >= opcoes.dataInicio && data <= opcoes.dataFim;

  const sessoes = SESSOES_INICIAIS.filter(
    (s) => s.criancaId === opcoes.criancaId && dentroPeriodo(s.data)
  ).sort((a, b) => a.data.localeCompare(b.data));
  const concluidas = sessoes.filter((s) => s.status === "concluida");
  const evolucoes = concluidas.filter((s) => s.evolucaoDiaria);
  const incidentes = concluidas.filter((s) => s.notaIncidente);
  const programas = PROGRAMAS_CRIANCA_INICIAIS.filter(
    (p) => p.criancaId === opcoes.criancaId
  );

  // Resumo
  autoTable(doc, {
    startY: y,
    head: [["Sessões", "Concluídas", "Evoluções", "Programas", "Incidentes"]],
    body: [
      [
        String(sessoes.length),
        String(concluidas.length),
        String(evolucoes.length),
        String(programas.length),
        String(incidentes.length),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: COR_PRIMARIA, textColor: 255, fontStyle: "bold" },
    bodyStyles: { halign: "center", fontSize: 11 },
    margin: { left: margem, right: margem },
  });
  y = (doc as any).lastAutoTable.finalY + 24;

  const incluiSessoes =
    opcoes.tipo === "sessoes" || opcoes.tipo === "consolidado";
  const incluiEvolucao =
    opcoes.tipo === "evolucao" || opcoes.tipo === "consolidado";
  const incluiProgramas =
    opcoes.tipo === "programas" || opcoes.tipo === "consolidado";

  if (incluiSessoes && sessoes.length > 0) {
    y = secaoTitulo(doc, "Sessões realizadas", y, margem);
    autoTable(doc, {
      startY: y,
      head: [["Data", "Terapia", "Profissional", "Horário", "Status"]],
      body: sessoes.map((s) => [
        formatarData(s.data),
        tiposLabel[s.tipo] || s.tipo,
        s.profissionalNome,
        `${s.horaInicio} - ${s.horaFim}`,
        s.status.replace("_", " "),
      ]),
      theme: "striped",
      headStyles: { fillColor: COR_PRIMARIA, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 5 },
      margin: { left: margem, right: margem },
    });
    y = (doc as any).lastAutoTable.finalY + 20;
  }

  if (incluiEvolucao && evolucoes.length > 0) {
    y = secaoTitulo(doc, "Evolução diária", y, margem);
    autoTable(doc, {
      startY: y,
      head: [["Data", "Terapia", "Registro de evolução"]],
      body: evolucoes.map((s) => [
        formatarData(s.data),
        tiposLabel[s.tipo] || s.tipo,
        s.evolucaoDiaria || "",
      ]),
      theme: "grid",
      headStyles: { fillColor: COR_PRIMARIA, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 6, valign: "top" },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 90 },
        2: { cellWidth: "auto" },
      },
      margin: { left: margem, right: margem },
    });
    y = (doc as any).lastAutoTable.finalY + 20;
  }

  if (incluiProgramas && programas.length > 0) {
    y = secaoTitulo(doc, "Programas em acompanhamento", y, margem);
    autoTable(doc, {
      startY: y,
      head: [["Programa", "Disciplina", "Objetivo geral", "Status"]],
      body: programas.map((p) => [
        p.nome,
        p.disciplina,
        p.objetivoGeral,
        p.status,
      ]),
      theme: "grid",
      headStyles: { fillColor: COR_PRIMARIA, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 6, valign: "top" },
      margin: { left: margem, right: margem },
    });
    y = (doc as any).lastAutoTable.finalY + 20;
  }

  if (opcoes.tipo === "consolidado" && incidentes.length > 0) {
    y = secaoTitulo(doc, "Registros de incidentes", y, margem);
    autoTable(doc, {
      startY: y,
      head: [["Data", "Profissional", "Descrição"]],
      body: incidentes.map((s) => [
        formatarData(s.data),
        s.profissionalNome,
        s.notaIncidente || "",
      ]),
      theme: "grid",
      headStyles: { fillColor: [217, 119, 6], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 6, valign: "top" },
      margin: { left: margem, right: margem },
    });
    y = (doc as any).lastAutoTable.finalY + 20;
  }

  if (opcoes.observacoes?.trim()) {
    y = secaoTitulo(doc, "Observações clínicas", y, margem);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COR_TEXTO);
    const linhas = doc.splitTextToSize(
      opcoes.observacoes,
      larguraPag - margem * 2
    );
    doc.text(linhas, margem, y);
    y += linhas.length * 12 + 10;
  }

  // Rodapé
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    const altura = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(...COR_MUTED);
    doc.text(
      "Documento confidencial — TrackABA",
      margem,
      altura - 20
    );
    doc.text(`Página ${i} de ${total}`, larguraPag - margem, altura - 20, {
      align: "right",
    });
  }

  const arquivo = `${opcoes.tipo}-${opcoes.criancaNome
    .toLowerCase()
    .replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(arquivo);
}
