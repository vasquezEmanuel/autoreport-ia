'use strict';

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  }

  return createClient(url, key);
};

const storageService = {
  // Sube un archivo a Supabase Storage y retorna la URL pública
  uploadFile: async ({ filePath, fileName, mimeType, userId }) => {
    const supabase = getSupabaseClient();

    // Leer el archivo del disco
    const fileBuffer = fs.readFileSync(filePath);

    // Crear un path único en el bucket: userId/timestamp_filename
    const timestamp = Date.now();
    const ext = path.extname(fileName);
    const storagePath = `${userId}/${timestamp}${ext}`;

    // Subir a Supabase Storage
    const { error } = await supabase.storage.from('uploads').upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

    if (error) {
      throw new Error(`Error subiendo archivo a Supabase: ${error.message}`);
    }

    // Obtener la URL pública
    const { data } = supabase.storage.from('uploads').getPublicUrl(storagePath);

    // Eliminar el archivo temporal del disco local
    try {
      fs.unlinkSync(filePath);
    } catch {
      // Si no se puede eliminar no es crítico
    }

    return {
      publicUrl: data.publicUrl,
      storagePath,
    };
  },

  // Elimina un archivo de Supabase Storage
  deleteFile: async (storagePath) => {
    const supabase = getSupabaseClient();

    const { error } = await supabase.storage.from('uploads').remove([storagePath]);

    if (error) {
      throw new Error(`Error eliminando archivo: ${error.message}`);
    }
  },
};

module.exports = storageService;
