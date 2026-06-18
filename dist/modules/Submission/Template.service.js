// Submission/Template.service.ts
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
function extrairJSONSeguro(texto) {
    const match = texto.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error("Nenhum JSON encontrado na resposta do modelo.");
    }
    return match[0];
}
// Alterado para receber apenas UMA url e não mais um array
export async function processarGabaritoUnico(url) {
    const prompt = `Analise a imagem deste gabarito.
Extraia as questões e alternativas marcadas.
Retorne ESTRITAMENTE um objeto JSON no formato: {"1": "A", "2": "B"}.
Não inclua nenhuma explicação.
Se uma questão não estiver marcada, ou tiver dupla marcação, use null como valor.`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Falha ao baixar a imagem da nuvem: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    { text: prompt },
                    { inlineData: { data: imageBuffer.toString("base64"), mimeType } },
                ],
            },
        ],
    });
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
        throw new Error("Resposta vazia do modelo."); // Lança o erro para a Fila pegar
    }
    const jsonString = extrairJSONSeguro(rawText);
    return JSON.parse(jsonString);
}
//# sourceMappingURL=Template.service.js.map