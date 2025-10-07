import { GoogleGenAI } from "@google/genai";
import { Goal, Habit } from "../types";

// IMPORTANT: This check is to prevent errors in environments where process.env is not defined.
const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
if (!apiKey) {
    console.warn("API_KEY não definida no ambiente. As funcionalidades de IA serão desativadas.");
}
const ai = new GoogleGenAI({ apiKey: apiKey! });


export async function getAIGoalSuggestions(title: string, description: string | null): Promise<string[]> {
    if (!apiKey) return Promise.resolve([]);
    try {
        const prompt = `Divida a seguinte meta em uma lista de subtarefas pequenas e acionáveis.
Título da Meta: "${title}"
Descrição da Meta: "${description || 'Nenhuma descrição fornecida.'}"
Forneça a resposta como um objeto JSON com uma única chave "subtasks", que é um array de strings. Por exemplo: {"subtasks": ["Primeiro passo", "Segundo passo", "Terceiro passo"]}. As subtarefas devem ser concisas e em português do Brasil.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        
        if (result.subtasks && Array.isArray(result.subtasks)) {
            return result.subtasks;
        }
        return [];
    } catch (error) {
        console.error("Erro ao obter sugestões de metas da IA:", error);
        throw new Error("Falha ao gerar sugestões da IA. Por favor, tente novamente.");
    }
}

export async function getAIJournalPrompt(): Promise<string> {
    if (!apiKey) return Promise.resolve("Qual foi a sua maior vitória hoje?");
    try {
        const prompt = `Gere um único tópico de diário, perspicaz e breve, para alguém trabalhando em metas e hábitos pessoais. O tópico deve encorajar a reflexão. Formule como uma pergunta em português do Brasil.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Erro ao obter tópico de diário da IA:", error);
        return "Qual foi um desafio que você superou hoje?"; // Tópico de fallback
    }
}

export async function getAIPerformanceInsights(goals: Goal[], habits: Habit[]): Promise<string> {
    if (!apiKey) return Promise.resolve("A análise por IA está indisponível. Continue focado em seus objetivos!");
    try {
        const dataSummary = `
            Metas (${goals.length} no total):
            ${goals.map(g => `- ${g.title} (Categoria: ${g.category}, Progresso: ${g.progress_percentage}%)`).join('\n')}

            Hábitos (${habits.length} no total):
            ${habits.map(h => `- ${h.title} (Frequência: ${h.frequency}, Vezes Concluído: ${h.completions.length})`).join('\n')}
        `;

        const prompt = `Com base no seguinte resumo das metas e hábitos de um usuário, forneça 1-2 frases de insight encorajador e acionável. Seja positivo e motivador. Dirija-se ao usuário diretamente como "você". Fale em português do Brasil.
        Dados:
        ${dataSummary}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Erro ao obter insights de desempenho da IA:", error);
        throw new Error("Falha ao gerar insights da IA.");
    }
}