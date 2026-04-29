'use strict';

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const REPORTS_DIR = process.env.REPORTS_DIR || path.join(__dirname, '../../reports');

// Crear directorio si no existe
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// ─── Colores y estilos ────────────────────────────────────────────────────────
const COLORS = {
  primary: '#1B4F72',
  secondary: '#2E86C1',
  accent: '#1ABC9C',
  dark: '#1C2833',
  gray: '#566573',
  lightGray: '#F2F3F4',
  white: '#FFFFFF',
  success: '#1A8A5A',
  warning: '#D4AC0D',
  error: '#C0392B',
};

const exportService = {
  // Genera el PDF del reporte y retorna la ruta del archivo
  generatePDF: async ({ report, extractedFields, aiSummary }) => {
    return new Promise((resolve, reject) => {
      const fileName = `report_${report.id}_${Date.now()}.pdf`;
      const filePath = path.join(REPORTS_DIR, fileName);

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 60, right: 60 },
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ── ENCABEZADO ──────────────────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 90).fill(COLORS.primary);

      doc.fillColor(COLORS.white).fontSize(22).font('Helvetica-Bold').text('AutoReport IA', 60, 25);

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('rgba(255,255,255,0.8)')
        .text('Sistema de Generación Automática de Reportes', 60, 52);

      // ── TÍTULO DEL REPORTE ──────────────────────────────────────────────────
      doc.moveDown(3);

      doc
        .fillColor(COLORS.dark)
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(report.name, 60, 110, { align: 'left' });

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(COLORS.gray)
        .text(
          `Generado el ${new Date().toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          60,
          135
        );

      // Línea separadora
      doc
        .moveTo(60, 155)
        .lineTo(doc.page.width - 60, 155)
        .strokeColor(COLORS.secondary)
        .lineWidth(2)
        .stroke();

      // ── SECCIÓN: DATOS EXTRAÍDOS ────────────────────────────────────────────
      doc
        .moveDown(2)
        .fillColor(COLORS.primary)
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('Datos Consolidados', 60, 170);

      // Tabla de datos
      const tableTop = 195;
      const colWidths = { field: 180, source: 80, value: 180, status: 55 };
      const tableLeft = 60;

      // Encabezados de tabla
      doc.rect(tableLeft, tableTop, doc.page.width - 120, 24).fill(COLORS.secondary);

      doc
        .fillColor(COLORS.white)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Campo', tableLeft + 8, tableTop + 7)
        .text('Fuente', tableLeft + colWidths.field + 8, tableTop + 7)
        .text('Valor extraído', tableLeft + colWidths.field + colWidths.source + 8, tableTop + 7)
        .text(
          'Estado',
          tableLeft + colWidths.field + colWidths.source + colWidths.value + 8,
          tableTop + 7
        );

      // Filas de datos
      let rowY = tableTop + 24;
      const fields = extractedFields || [];

      fields.forEach((field, index) => {
        const rowHeight = 28;
        const bgColor = index % 2 === 0 ? COLORS.white : COLORS.lightGray;

        doc.rect(tableLeft, rowY, doc.page.width - 120, rowHeight).fill(bgColor);

        // Borde de fila
        doc
          .rect(tableLeft, rowY, doc.page.width - 120, rowHeight)
          .strokeColor('#D5D8DC')
          .lineWidth(0.5)
          .stroke();

        const statusColor =
          field.status === 'OK'
            ? COLORS.success
            : field.status === 'REVIEW'
              ? COLORS.warning
              : COLORS.error;

        doc
          .fillColor(COLORS.dark)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(field.fieldName || '', tableLeft + 8, rowY + 9, {
            width: colWidths.field - 16,
            ellipsis: true,
          });

        // Badge de fuente
        const sourceColor = field.source === 'PDF' ? '#E8F4FD' : '#E8F5EE';
        const sourceTextColor = field.source === 'PDF' ? COLORS.secondary : COLORS.success;

        doc.rect(tableLeft + colWidths.field + 8, rowY + 7, 40, 14).fill(sourceColor);

        doc
          .fillColor(sourceTextColor)
          .fontSize(8)
          .font('Helvetica-Bold')
          .text(field.source || '', tableLeft + colWidths.field + 12, rowY + 10);

        doc
          .fillColor(COLORS.dark)
          .fontSize(9)
          .font('Helvetica')
          .text(
            String(field.value || ''),
            tableLeft + colWidths.field + colWidths.source + 8,
            rowY + 9,
            { width: colWidths.value - 16, ellipsis: true }
          );

        // Badge de estado
        doc
          .circle(
            tableLeft + colWidths.field + colWidths.source + colWidths.value + 18,
            rowY + 14,
            5
          )
          .fill(statusColor);

        doc
          .fillColor(statusColor)
          .fontSize(8)
          .font('Helvetica-Bold')
          .text(
            field.status || '',
            tableLeft + colWidths.field + colWidths.source + colWidths.value + 26,
            rowY + 10
          );

        rowY += rowHeight;
      });

      // ── SECCIÓN: RESUMEN IA ─────────────────────────────────────────────────
      if (aiSummary) {
        rowY += 30;

        // Verificar si hay espacio en la página
        if (rowY > doc.page.height - 200) {
          doc.addPage();
          rowY = 60;
        }

        doc
          .fillColor(COLORS.primary)
          .fontSize(13)
          .font('Helvetica-Bold')
          .text('Resumen Ejecutivo', 60, rowY);

        rowY += 20;

        // Caja de resumen
        const summaryBoxHeight = Math.min(200, aiSummary.length / 3);
        doc.rect(60, rowY, doc.page.width - 120, summaryBoxHeight + 30).fill('#EBF5FB');

        doc.rect(60, rowY, 3, summaryBoxHeight + 30).fill(COLORS.accent);

        doc
          .fillColor(COLORS.dark)
          .fontSize(10)
          .font('Helvetica')
          .text(aiSummary, 75, rowY + 15, {
            width: doc.page.width - 150,
            align: 'justify',
          });

        rowY += summaryBoxHeight + 50;
      }

      // ── PIE DE PÁGINA ───────────────────────────────────────────────────────
      const pageBottom = doc.page.height - 45;

      doc
        .moveTo(60, pageBottom)
        .lineTo(doc.page.width - 60, pageBottom)
        .strokeColor(COLORS.lightGray)
        .lineWidth(1)
        .stroke();

      doc
        .fillColor(COLORS.gray)
        .fontSize(8)
        .font('Helvetica')
        .text(
          `AutoReport IA — Reporte generado automáticamente — ${new Date().getFullYear()}`,
          60,
          pageBottom + 8,
          { align: 'center', width: doc.page.width - 120 }
        );

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  },
};

module.exports = exportService;
