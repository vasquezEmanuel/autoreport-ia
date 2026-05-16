'use strict';

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Cliente Gemini ───────────────────────────────────────────────────────────
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'placeholder') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// ─── Extractor de datos Excel ─────────────────────────────────────────────────
const extractExcelData = async (filePath, excelColumns) => {
  try {
    let buffer;

    // Si es URL de Supabase, descargar primero
    if (filePath.startsWith('http')) {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`No se pudo descargar el Excel: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = require('fs').readFileSync(filePath);
    }

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const results = [];

    for (const colConfig of excelColumns) {
      if (!colConfig.active) continue;

      const sheetName = colConfig.sheet || workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) continue;

      const cellRef = `${colConfig.column}${colConfig.startRow}`;
      const cell = sheet[cellRef];
      const value = cell ? String(cell.v) : null;

      console.log(`[EXCEL] Buscando celda ${cellRef} en hoja "${sheetName}":`, value);

      results.push({
        fieldName: colConfig.label,
        value: value || 'No encontrado',
        source: 'EXCEL',
        confidence: null,
        status: value ? 'OK' : 'REVIEW',
      });
    }

    return results;
  } catch (error) {
    console.error('[EXCEL] Error extrayendo datos:', error.message);
    return [];
  }
};

// ─── Extracción de campos del PDF con Gemini ──────────────────────────────────
const extractFromPDFWithGemini = async (filePath, pdfFields) => {
  const genAI = getGeminiClient();

  // Si no hay API key usar mock
  if (!genAI) {
    return pdfFields.map((field) => ({
      fieldName: field.name,
      value: `[Mock] Valor de ${field.name}`,
      source: 'PDF',
      confidence: 75,
      status: 'REVIEW',
    }));
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Descargar o leer el PDF
    let pdfBase64;
    if (filePath.startsWith('http')) {
      console.log('[AI] Descargando PDF desde URL:', filePath);
      const response = await fetch(filePath);
      console.log('[AI] Status de descarga:', response.status);
      if (!response.ok) {
        throw new Error(`No se pudo descargar el PDF: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      pdfBase64 = Buffer.from(arrayBuffer).toString('base64');
      console.log('[AI] PDF descargado, tamaño base64:', pdfBase64.length);
    } else {
      const pdfBuffer = fs.readFileSync(filePath);
      pdfBase64 = pdfBuffer.toString('base64');
    }

    const fieldsDescription = pdfFields
      .map((f) => `- "${f.name}": ${f.instruction} (tipo: ${f.type})`)
      .join('\n');

    const prompt = `Eres un extractor de datos de documentos. 
Analiza el PDF adjunto y extrae exactamente estos campos:
${fieldsDescription}

Responde ÚNICAMENTE con un array JSON válido con este formato exacto:
[
  {
    "fieldName": "nombre exacto del campo",
    "value": "valor extraído como string",
    "confidence": número entre 0 y 100,
    "status": "OK" o "REVIEW"
  }
]

Usa "REVIEW" si el valor no es claro o tiene baja confianza.
No incluyas explicaciones, solo el JSON.`;

    console.log('[AI] Enviando a Gemini...');

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      },
      prompt,
    ]);

    const responseText = result.response.text();
    console.log('[AI] Respuesta de Gemini:', responseText.substring(0, 200));

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Respuesta de IA no es JSON válido');

    const extracted = JSON.parse(jsonMatch[0]);

    return extracted.map((item) => ({
      ...item,
      source: 'PDF',
    }));
  } catch (error) {
    console.error('[AI] Error en Gemini:', error.message);
    return pdfFields.map((field) => ({
      fieldName: field.name,
      value: 'Error al extraer — revisar manualmente',
      source: 'PDF',
      confidence: 0,
      status: 'REVIEW',
    }));
  }
};

// ─── Generar resumen ejecutivo con Gemini ─────────────────────────────────────
const generateSummary = async (reportName, extractedFields) => {
  const genAI = getGeminiClient();

  if (!genAI) {
    return `Resumen mock del reporte "${reportName}". Los datos han sido extraídos correctamente y están listos para revisión.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const fieldsText = extractedFields
      .map((f) => `${f.fieldName}: ${f.value} (fuente: ${f.source})`)
      .join('\n');

    const prompt = `Eres un analista de negocios. 
Genera un resumen ejecutivo breve (máximo 3 párrafos) del siguiente reporte llamado "${reportName}".

Datos extraídos:
${fieldsText}

El resumen debe:
- Describir qué contiene el reporte
- Destacar los datos más importantes
- Usar tono profesional y formal en español
- Ser conciso y directo`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return `Resumen del reporte "${reportName}". Los datos han sido procesados exitosamente.`;
  }
};

// ─── Servicio principal ───────────────────────────────────────────────────────
const aiService = {
  processReport: async ({ pdfUpload, excelUpload, pdfFields, excelColumns }) => {
    const extractedFields = [];

    // Extraer datos del PDF con Gemini
    if (pdfUpload && pdfFields.length > 0) {
      const pdfResults = await extractFromPDFWithGemini(pdfUpload.storedPath, pdfFields);
      extractedFields.push(...pdfResults);
    }

    // Extraer datos del Excel directamente
    if (excelUpload && excelColumns.length > 0) {
      const excelResults = await extractExcelData(excelUpload.storedPath, excelColumns);
      extractedFields.push(...excelResults);
    }

    return extractedFields;
  },

  generateSummary,
};

module.exports = aiService;
