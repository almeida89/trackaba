import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Sessao, ROTULOS_STATUS_SESSAO } from "./tiposSessoes";

const ROTULOS_HUMOR: Record<string, string> = {
  otimo: "Ótimo",
  bom: "Bom",
  neutro: "Neutro",
  ansioso: "Ansioso",
  irritado: "Irritado",
  sonolento: "Sonolento",
};

export function exportarSessaoPdf(s: Sessao) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 48;

  // Cabeçalho
  doc.setFillColor(20, 130, 130);
  doc.rect(0, 0, pageWidth, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("TrackABA — Relatório de Sessão", 40, 32);
  doc.setFontSize(10);
  doc.text(`Status: ${ROTULOS_STATUS_SESSAO[s.status]}`, 40, 52);

  doc.setTextColor(20, 20, 20);
  y = 100;

  // Identificação
  doc.setFontSize(13);
  doc.text("Identificação", 40, y);
  y += 8;
  doc.setDrawColor(220);
  doc.line(40, y, pageWidth - 40, y);
  y += 14;
  doc.setFontSize(10);

  const linhasId = [
    ["Criança", s.criancaNome],
    ["Profissional", s.profissionalNome],
    ["Data", new Date(s.data).toLocaleDateString("pt-BR")],
    ["Horário", `${s.horaInicio} – ${s.horaFim} (${s.duracaoMin} min)`],
    ["Tipo / Local", `${s.tipo} • ${s.local}${s.sala ? " • " + s.sala : ""}`],
    ["Humor", s.humor ? ROTULOS_HUMOR[s.humor] : "—"],
  ];
  linhasId.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${k}:`, 40, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(v), 140, y);
    y += 16;
  });

  // Notas
  y += 8;
  doc.setFontSize(13);
  doc.text("Observações clínicas", 40, y);
  y += 8;
  doc.line(40, y, pageWidth - 40, y);
  y += 14;
  doc.setFontSize(10);

  const blocoTexto = (titulo: string, texto?: string) => {
    if (!texto) return;
    doc.setFont("helvetica", "bold");
    doc.text(titulo, 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    const linhas = doc.splitTextToSize(texto, pageWidth - 80);
    doc.text(linhas, 40, y);
    y += linhas.length * 12 + 10;
  };

  blocoTexto("Nota geral", s.notaGeral);
  blocoTexto("Evolução diária", s.evolucaoDiaria);
  blocoTexto("Incidente", s.notaIncidente);

  // Programas
  if (s.registros.length) {
    if (y > 700) { doc.addPage(); y = 48; }
    doc.setFontSize(13);
    doc.text("Programas trabalhados", 40, y);
    y += 6;
    autoTable(doc, {
      startY: y + 4,
      head: [["Programa", "Objetivo", "Tent.", "Acertos", "%", "Nível"]],
      body: s.registros.map((r) => [
        r.programaNome,
        r.objetivo,
        r.tentativas,
        r.acertos,
        r.tentativas ? `${Math.round((r.acertos / r.tentativas) * 100)}%` : "—",
        r.nivel,
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [20, 130, 130] },
    });
    y = (doc as any).lastAutoTable.finalY + 16;
  }

  // ABC
  if (s.narrativaAbc.length) {
    if (y > 680) { doc.addPage(); y = 48; }
    doc.setFontSize(13);
    doc.text("Registros ABC", 40, y);
    autoTable(doc, {
      startY: y + 6,
      head: [["Hora", "Antecedente", "Comportamento", "Consequência", "Intens."]],
      body: s.narrativaAbc.map((a) => [
        a.horario,
        a.antecedente,
        a.comportamento,
        a.consequencia,
        a.intensidade,
      ]),
      styles: { fontSize: 9, cellPadding: 4, valign: "top" },
      columnStyles: { 1: { cellWidth: 110 }, 2: { cellWidth: 110 }, 3: { cellWidth: 110 } },
      headStyles: { fillColor: [20, 130, 130] },
    });
    y = (doc as any).lastAutoTable.finalY + 16;
  }

  // Reforçadores
  if (s.reforcadores.length) {
    if (y > 720) { doc.addPage(); y = 48; }
    doc.setFontSize(13);
    doc.text("Reforçadores utilizados", 40, y);
    autoTable(doc, {
      startY: y + 6,
      head: [["Nome", "Tipo", "Efetividade"]],
      body: s.reforcadores.map((r) => [r.nome, r.tipo, "★".repeat(r.efetividade)]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [20, 130, 130] },
    });
    y = (doc as any).lastAutoTable.finalY + 16;
  }

  // Assinatura
  if (y > 720) { doc.addPage(); y = 48; }
  doc.setDrawColor(220);
  doc.line(40, y, pageWidth - 40, y);
  y += 18;
  doc.setFontSize(10);
  if (s.status === "assinada" && s.assinaturaHash) {
    doc.setFont("helvetica", "bold");
    doc.text("Assinatura digital", 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.text(`Assinada em: ${s.assinadaEm ? new Date(s.assinadaEm).toLocaleString("pt-BR") : "—"}`, 40, y);
    y += 14;
    const hashLinhas = doc.splitTextToSize(`Hash SHA-256: ${s.assinaturaHash}`, pageWidth - 80);
    doc.text(hashLinhas, 40, y);
  } else {
    doc.setTextColor(180, 60, 60);
    doc.text("Documento NÃO assinado — sem valor clínico oficial.", 40, y);
  }

  doc.save(`sessao-${s.criancaNome.replace(/\s+/g, "_")}-${s.data}.pdf`);
}
