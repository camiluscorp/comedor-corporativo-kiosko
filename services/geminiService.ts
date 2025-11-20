import { GoogleGenAI } from "@google/genai";
import { MealLog } from "../types";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateKitchenNotification = async (
  requesterName: string, 
  quantity: number, 
  reason: string
): Promise<string> => {
  if (!ai) return "Notificación automática: Servicio de IA no configurado.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Actúa como un asistente administrativo formal de un comedor corporativo.
        Genera un mensaje corto y profesional para notificar al Jefe de Cocina sobre un pedido de platos adicionales.
        
        Detalles:
        - Solicitante: ${requesterName}
        - Cantidad: ${quantity} platos
        - Motivo: ${reason}
        - Hora actual: ${new Date().toLocaleTimeString()}
        
        El mensaje debe ser directo, amable y listo para enviarse por Microsoft Teams o Correo. No incluyas saludos genéricos al principio como "Aquí tienes el mensaje", solo el cuerpo del mensaje.
      `,
    });
    return response.text || "Error generando mensaje.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error al conectar con el servicio de IA para notificaciones.";
  }
};

export const analyzeDailyConsumption = async (logs: MealLog[]): Promise<string> => {
    if (!ai) return "Análisis no disponible (falta API Key).";
    if (logs.length === 0) return "No hay datos suficientes para analizar hoy.";

    try {
        const logsJson = JSON.stringify(logs.map(l => ({ time: l.timestamp, type: l.type, reason: l.details })));
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
              Analiza brevemente los siguientes registros de consumo del comedor de hoy en formato JSON.
              Dame 3 puntos clave (insights) sobre el flujo de personas, picos de hora (basado en timestamp) y si hay anomalías en pedidos extra.
              Mantén el tono profesional y ejecutivo en español.
              
              Data: ${logsJson}
            `,
        });
        return response.text || "No se pudo generar el análisis.";
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return "Error en el análisis de datos.";
    }
};