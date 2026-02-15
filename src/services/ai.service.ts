/**
 * AI Service: Orchestrates all AI calls.
 * Prompts are versioned and structured here.
 */

export type AIPromptVersion = "v1" | "v2";

export class AIService {
    private static PROMPTS = {
        writing_task1: {
            v1: "Analyze the following IELTS Writing Task 1 response and provide a score based on Task Achievement, Coherence, Lexical Resource, and Grammatical Range.",
        },
        writing_task2: {
            v1: "Analyze the following IELTS Writing Task 2 essay and provide a detailed band score breakdown and improvement suggestions.",
        }
    };

    async generateFeedback(type: keyof typeof AIService.PROMPTS, content: string, version: AIPromptVersion = "v1") {
        const prompt = AIService.PROMPTS[type][version];
        console.log(`Calling AI with prompt: ${prompt}`);

        // Mock response following AI OUTPUT CONTRACT
        return {
            overall_band: 6.5,
            breakdown: {
                task_response: 7.0,
                coherence: 6.0,
                lexical: 6.5,
                grammar: 6.5
            },
            feedback: "Your writing is clear but lacks complex sentence structures.",
            confidence: 0.95,
            version: version
        };
    }
}
