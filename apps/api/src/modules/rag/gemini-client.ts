import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.ts";

let genAIInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (genAIInstance) return genAIInstance;

  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.trim() === "") {
    return null;
  }

  try {
    genAIInstance = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    return genAIInstance;
  } catch (err) {
    console.warn("⚠️ Error al inicializar cliente de Google GenAI:", err);
    return null;
  }
}

export function isGeminiConfigured(): boolean {
  return !!env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 5;
}
