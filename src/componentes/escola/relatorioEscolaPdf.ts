import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AcessoEscola } from "./tiposEscola";
import { SESSOES_INICIAIS } from "@/componentes/sessoes/dadosSessoes";
import {
  BIBLIOTECA_PROGRAMAS,
  PROGRAMAS_CRIANCA_INICIAIS,
} from "@/componentes/programas/dadosProgramas";

const tiposLabel: Record<string, string> = {
  ABA: "ABA",
  Fono: "Fonoaudiologia",
  TO: "Terapia Ocupacional",
  Psico: "Psicologia",
  Psicopedagogia: "Psicopedagogia",
};

const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// Paleta TrackABA (teal) em RGB
const COR_PRIMARIA: [number, number, number] = [38, 166, 154];
const COR_TEXTO: [number, number, number] = [33, 47, 60];
const COR_MUTED: [number, number, number] = [100, 116, 130];

export function gerarRelatorioEscolaPDF(acesso: AcessoEscola) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const larguraPag = doc.internal.pageSize.getWidth();
  const margem = 40;

  // === Cabeçalho ===
  doc.setFillColor(...COR_PRIMARIA);
  doc.rect(0, 0, larguraPag, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Relatório Escolar — TrackABA", margem, 32);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Emitido em ${new Date().toLocaleDateString("pt-BR")} • Acesso restrito`,
    margem,
    52
  );

  let y = 95;

  // === Bloco identificação ===
  doc.setTextColor(...COR_TEXTO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Criança: ${acesso.criancaNome}`, margem, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COR_MUTED);
  doc.text(`Escola: ${acesso.escolaNome}`, margem, y);
  y += 14;
  doc.text(
    `Responsável: ${acesso.responsavelNome} (${acesso.responsavelCargo})`,
    margem,
    y
  );
  y += 14;
  doc.text(
    `Validade do acesso: até ${formatarData(acesso.expiraEm)}`,
    margem,
    y
  );
  y += 22;

  // Permissões resumidas
  const perms: string[] = [];
  if (acesso.permissoes.verSessoes) perms.push("Sessões");
  if (acesso.permissoes.verEvolucao) perms.push("Evolução");
  if (acesso.permissoes.verProgramas) perms.push("Programas");
  if (acesso.permissoes.verRelatorios) perms.push("Relatórios");
  if (acesso.permissoes.verIncidentes) perms.push("Incidentes");
  doc.setTextColor(...COR_TEXTO);
  doc.setFont("helvetica", "bold");
  doc.text("Escopo deste relatório:", margem, y);
  doc.setFont("helvetica", "normal");
  doc.text(perms.join(" • ") || "Nenhuma permissão", margem + 130, y);
  y += 10;

  // Filtra dados pela criança
  const sessoes = SESSOES_INICIAIS.filter(
    (s) => s.criancaId === acesso.criancaId
  ).sort((a, b) =>
    (b.data + b.horaInicio).localeCompare(a.data + a.horaInicio)
  );
  const concluidas = sessoes.filter((s) => s.status === "concluida");
  const evolucoes = concluidas.filter((s) => s.evolucaoDiaria);
  const incidentes = concluidas.filter((s) => s.notaIncidente);

  let programas = PROGRAMAS_CRIANCA_INICIAIS.filter(
    (p) => p.criancaId === acesso.criancaId
  );
  if (programas.length === 0) programas = BIBLIOTECA_PROGRAMAS.slice(0, 2);

  // === Resumo numérico ===
  y += 10;
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

  // === Sessões ===
  if (acesso.permissoes.verSessoes && sessoes.length > 0) {
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

  // === Evoluções ===
  if (acesso.permissoes.verEvolucao && evolucoes.length > 0) {
    y = secaoTitulo(doc, "Evolução diária", y, margem, doc);
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

  // === Programas ===
  if (acesso.permissoes.verProgramas && programas.length > 0) {
    y = secaoTitulo(doc, "Programas em acompanhamento", y, margem, doc);
    autoTable(doc, {
      startY: y,
      head: [["Programa", "Disciplina", "Objetivo geral"]],
      body: programas.map((p) => [
        p.nome,
        p.disciplina,
        p.objetivoGeral,
      ]),
      theme: "grid",
      headStyles: { fillColor: COR_PRIMARIA, textColor: 255 },
      styles: { fontSize: 9, cellPadding: 6, valign: "top" },
      margin: { left: margem, right: margem },
    });
    y = (doc as any).lastAutoTable.finalY + 20;
  }

  // === Incidentes (se permitido) ===
  if (acesso.permissoes.verIncidentes && incidentes.length > 0) {
    y = secaoTitulo(doc, "Registros de incidentes", y, margem, doc);
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

  // === Rodapé em todas as páginas ===
  const totalPag = doc.getNumberOfPages();
  for (let i = 1; i <= totalPag; i++) {
    doc.setPage(i);
    const alturaPag = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(...COR_MUTED);
    doc.text(
      "Documento confidencial — uso restrito da escola autorizada.",
      margem,
      alturaPag - 20
    );
    doc.text(
      `Página ${i} de ${totalPag}`,
      larguraPag - margem,
      alturaPag - 20,
      { align: "right" }
    );
  }

  const arquivo = `relatorio-escolar-${acesso.criancaNome
    .toLowerCase()
    .replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(arquivo);
}

function secaoTitulo(
  doc: jsPDF,
  titulo: string,
  y: number,
  margem: number,
  docRef?: jsPDF
): number {
  const d = docRef || doc;
  const alturaPag = d.internal.pageSize.getHeight();
  if (y > alturaPag - 100) {
    d.addPage();
    y = 60;
  }
  d.setFont("helvetica", "bold");
  d.setFontSize(12);
  d.setTextColor(...COR_PRIMARIA);
  d.text(titulo, margem, y);
  d.setDrawColor(...COR_PRIMARIA);
  d.setLineWidth(0.8);
  d.line(margem, y + 4, margem + 60, y + 4);
  return y + 14;
}
