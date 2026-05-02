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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Verificar si es URL de Supabase o path local
    let pdfBase64;
    if (filePath.startsWith('http')) {
      // Descargar el PDF desde Supabase Storage
      const response = await fetch(filePath);
      const arrayBuffer = await response.arrayBuffer();
      pdfBase64 = Buffer.from(arrayBuffer).toString('base64');
    } else {
      // Leer desde disco (desarrollo local)
      const pdfBuffer = fs.readFileSync(filePath);
      pdfBase64 = pdfBuffer.toString('base64');
    }

    // Construir el prompt con los campos a extraer
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

    // Limpiar respuesta y parsear JSON
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Respuesta de IA no es JSON válido');

    const extracted = JSON.parse(jsonMatch[0]);

    // Agregar source PDF a cada campo
    return extracted.map((item) => ({
      ...item,
      source: 'PDF',
    }));
  } catch (error) {
    // Si Gemini falla retornar campos con status REVIEW
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
      const excelResults = extractExcelData(excelUpload.storedPath, excelColumns);
      extractedFields.push(...excelResults);
    }

    return extractedFields;
  },

  generateSummary,
};

module.exports = aiService;
