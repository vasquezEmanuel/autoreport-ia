'use strict';

const fs = require('fs');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');

// ─── Extractor de texto PDF ───────────────────────────────────────────────────
const extractPdfText = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch {
    return '';
  }
};

// ─── Extractor de datos Excel ─────────────────────────────────────────────────
const extractExcelData = (filePath, excelColumns) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const results = [];

    for (const colConfig of excelColumns) {
      if (!colConfig.active) continue;

      const sheet = workbook.Sheets[colConfig.sheet] || workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) continue;

      const cellRef = `${colConfig.column}${colConfig.startRow}`;
      const cell = sheet[cellRef];
      const value = cell ? String(cell.v) : null;

      results.push({
        fieldName: colConfig.label,
        value: value || 'No encontrado',
        source: 'EXCEL',
        confidence: null,
        status: value ? 'OK' : 'REVIEW',
      });
    }

    return results;
  } catch {
    return [];
  }
};

// ─── Mock de extracción IA ────────────────────────────────────────────────────
// Cuando tengas la API key de Anthropic, reemplaza esta función
// por la llamada real a Claude. Todo lo demás permanece igual.
const mockExtractWithAI = (pdfText, pdfFields) => {
  return pdfFields.map((field) => {
    // Intento básico de encontrar el valor en el texto del PDF
    // La IA real haría esto de forma inteligente
    const lines = pdfText.split('\n').filter((l) => l.trim());
    let foundValue = null;
    let confidence = 0.75;

    // Búsqueda simple por palabras clave del nombre del campo
    const keywords = field.name.toLowerCase().split(' ');
    for (const line of lines) {
      const lineLower = line.toLowerCase();
      if (keywords.some((kw) => lineLower.includes(kw))) {
        foundValue = line.trim();
        confidence = 0.85;
        break;
      }
    }

    const meetsConfidence = confidence * 100 >= field.minConfidence;

    return {
      fieldName: field.name,
      value: foundValue || `[Valor de ${field.name} no encontrado]`,
      source: 'PDF',
      confidence: Math.round(confidence * 100),
      status: meetsConfidence ? 'OK' : 'REVIEW',
    };
  });
};

// ─── Función real con Claude (activar cuando tengas API key) ──────────────────
// const callClaude = async (pdfText, pdfFields) => {
//   const Anthropic = require('@anthropic-ai/sdk');
//   const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
//
//   const prompt = `Eres un extractor de datos. Del siguiente texto de PDF,
//   extrae estos campos: ${JSON.stringify(pdfFields)}.
//   Texto del PDF: ${pdfText.substring(0, 8000)}
//   Responde SOLO con JSON: [{ fieldName, value, confidence, status }]`;
//
//   const message = await client.messages.create({
//     model: 'claude-sonnet-4-5-20251001',
//     max_tokens: 2048,
//     messages: [{ role: 'user', content: prompt }],
//   });
//
//   return JSON.parse(message.content[0].text);
// };

const aiService = {
  // Procesa un reporte: extrae datos del PDF con IA y del Excel directamente
  processReport: async ({ pdfUpload, excelUpload, pdfFields, excelColumns }) => {
    const extractedFields = [];

    // 1. Extraer datos del PDF con IA (mock por ahora)
    if (pdfUpload && pdfFields.length > 0) {
      const pdfText = await extractPdfText(pdfUpload.storedPath);
      const pdfResults = mockExtractWithAI(pdfText, pdfFields);
      extractedFields.push(...pdfResults);
    }

    // 2. Extraer datos del Excel directamente (sin IA)
    if (excelUpload && excelColumns.length > 0) {
      const excelResults = extractExcelData(excelUpload.storedPath, excelColumns);
      extractedFields.push(...excelResults);
    }

    return extractedFields;
  },
};

module.exports = aiService;
