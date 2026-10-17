import fs from "fs";
import path from "path";
import { getGeminiClient, isGeminiConfigured } from "../gemini-client.ts";
import { supabaseAdmin } from "../../../config/supabase.ts";

interface NormativeFileConfig {
  filename: string;
  fuente: string;
  categoria: "LEGISLACION_PERU" | "ACCESIBILIDAD_WCAG" | "RENDIMIENTO_CWV" | "GESTION_ITIL";
}

const KNOWLEDGE_FILES: NormativeFileConfig[] = [
  {
    filename: "01_ley_gobierno_digital_dl1412.md",
    fuente: "D.L. 1412",
    categoria: "LEGISLACION_PERU",
  },
  {
    filename: "02_reglamento_gobierno_digital_ds029_2021_pcm.md",
    fuente: "D.S. 029-2021-PCM / R.SGTD 001-2025-PCM",
    categoria: "LEGISLACION_PERU",
  },
  {
    filename: "03_estandares_accesibilidad_wcag21_remediacion.md",
    fuente: "W3C WCAG 2.1 AA",
    categoria: "ACCESIBILIDAD_WCAG",
  },
  {
    filename: "04_metricas_core_web_vitals_remediacion.md",
    fuente: "Google Core Web Vitals",
    categoria: "RENDIMIENTO_CWV",
  },
  {
    filename: "05_gestion_servicios_itil_slas.md",
    fuente: "ITIL v4 & ISO/IEC 25010",
    categoria: "GESTION_ITIL",
  },
];

interface ChunkItem {
  fuente: string;
  categoria: string;
  titulo: string;
  seccion: string;
  contenido: string;
}

function chunkMarkdownFile(filePath: string, config: NormativeFileConfig): ChunkItem[] {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Archivo no encontrado: ${filePath}`);
    return [];
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const lines = rawContent.split("\n");
  const chunks: ChunkItem[] = [];

  let currentTitle = config.fuente;
  let currentSection = "General";
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("### ") || line.startsWith("## ")) {
      if (currentLines.length > 0) {
        const text = currentLines.join("\n").trim();
        if (text.length > 50) {
          chunks.push({
            fuente: config.fuente,
            categoria: config.categoria,
            titulo: currentTitle,
            seccion: currentSection,
            contenido: text,
          });
        }
        currentLines = [];
      }
      currentTitle = line.replace(/^#+\s*/, "").trim();
      currentSection = currentTitle;
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    const text = currentLines.join("\n").trim();
    if (text.length > 50) {
      chunks.push({
        fuente: config.fuente,
        categoria: config.categoria,
        titulo: currentTitle,
        seccion: currentSection,
        contenido: text,
      });
    }
  }

  return chunks;
}

export async function runKnowledgeBaseSeed(): Promise<void> {
  console.log("==================================================");
  console.log("📚 INICIANDO INDEXACIÓN DE BASE DE CONOCIMIENTO RAG");
  console.log("==================================================");

  if (!isGeminiConfigured()) {
    console.error("❌ ERROR: GEMINI_API_KEY no está configurada en apps/api/.env");
    console.error("   Por favor configure su clave para generar los embeddings vectoriales.");
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    console.error("❌ No se pudo inicializar cliente de Google GenAI.");
    return;
  }

  const kbDir = path.resolve(process.cwd(), "../../docs/knowledge_base");
  const resolvedKbDir = fs.existsSync(kbDir) ? kbDir : path.resolve(process.cwd(), "docs/knowledge_base");

  console.log(`📂 Directorio de fuentes documentales: ${resolvedKbDir}`);

  const allChunks: ChunkItem[] = [];
  for (const fileConfig of KNOWLEDGE_FILES) {
    const filePath = path.join(resolvedKbDir, fileConfig.filename);
    const fileChunks = chunkMarkdownFile(filePath, fileConfig);
    console.log(`   - [${fileConfig.fuente}]: ${fileChunks.length} fragmentos extraídos`);
    allChunks.push(...fileChunks);
  }

  console.log(`\n🧩 Total de fragmentos a procesar: ${allChunks.length}`);
  console.log("⚡ Generando embeddings de 768d e insertando en Supabase...");

  let successCount = 0;
  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    try {
      const textToEmbed = `${chunk.titulo} - ${chunk.seccion}\n${chunk.contenido}`;
      
      const embedResponse = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: textToEmbed,
        config: {
          outputDimensionality: 768,
        },
      });

      const embeddingValues =
        embedResponse.embeddings?.[0]?.values || (embedResponse as any).embedding?.values;
      if (!embeddingValues || embeddingValues.length === 0) {
        console.warn(`⚠️ Embedding vacío para fragmento ${i + 1}`);
        continue;
      }

      // Inserción en Supabase
      const { error } = await supabaseAdmin.from("documentos_normativos").insert({
        fuente: chunk.fuente,
        categoria: chunk.categoria,
        titulo: chunk.titulo,
        seccion: chunk.seccion,
        contenido: chunk.contenido,
        embedding: embeddingValues,
      });

      if (error) {
        console.error(`❌ Error insertando chunk ${i + 1}: ${error.message}`);
      } else {
        successCount++;
        process.stdout.write(`\r✅ Procesados: ${successCount}/${allChunks.length}`);
      }

      // Delay para respetar rate-limits de Google AI Studio
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err: any) {
      console.error(`\n❌ Error en chunk ${i + 1} (${chunk.titulo}):`, err.message || err);
    }
  }

  console.log(`\n\n🎉 INDEXACIÓN COMPLETADA: ${successCount} fragmentos normativos indexados en Supabase.`);
}

// Ejecución directa si se llama por CLI
if (import.meta.main) {
  runKnowledgeBaseSeed();
}
