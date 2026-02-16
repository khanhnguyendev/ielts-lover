import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Logger } from "@/lib/logger";

/**
 * AI Service: Orchestrates all AI calls.
 * Prompts are versioned and structured here.
 */

export type AIPromptVersion = "v1" | "v2";

export interface AIFeedbackResponse {
    overall_band: number;
    breakdown: {
        task_response: number;
        coherence: number;
        lexical: number;
        grammar: number;
    };
    feedback: string;
    confidence: number;
    version: string;
}

export class AIService {
    private genAI: GoogleGenerativeAI;
    private modelName: string;
    private logger: Logger;
    private static PROMPTS = {
        writing_task1: {
            v1: "Analyze the following IELTS Writing Task 1 response and provide a score based on Task Achievement, Coherence, Lexical Resource, and Grammatical Range.",
        },
        writing_task2: {
            v1: "Analyze the following IELTS Writing Task 2 essay and provide a detailed band score breakdown and improvement suggestions.",
        },
        speaking_part1: {
            v1: "Analyze the following IELTS Speaking Part 1 transcript and provide a score based on Fluency, Lexical Resource, Grammatical Range, and Pronunciation.",
        },
        speaking_part2: {
            v1: "Analyze the following IELTS Speaking Part 2 transcript and provide a score based on Fluency, Lexical Resource, Grammatical Range, and Pronunciation.",
        },
        speaking_part3: {
            v1: "Analyze the following IELTS Speaking Part 3 transcript and provide a score based on Fluency, Lexical Resource, Grammatical Range, and Pronunciation.",
        },
        rewrite: {
            v1: "Rewrite the following text to be more academic and professional, suitable for IELTS Writing Band 8.0+. Improve vocabulary and sentence structure while retaining the original meaning.",
        },
        generation: {
            writing_task1: {
                v1: "Generate a realistic IELTS Writing Task 1 prompt. Include a title describing the chart/graph/process, and the full question prompt. NOTE: Since you cannot generate images, strictly describe what the visual data would be in the prompt text so the user knows what image to find/create.",
            },
            writing_task2: {
                v1: "Generate a challenging IELTS Writing Task 2 essay prompt on a common topic (e.g., Education, Environment, Technology). Include a catchy title and the full essay question.",
            },
            speaking_part1: {
                v1: "Generate a set of 3-4 IELTS Speaking Part 1 questions on a specific manufacturing topic. Return a title (e.g., 'Hometown', 'Work') and the list of questions.",
            },
            speaking_part2: {
                v1: "Generate an IELTS Speaking Part 2 Cue Card topic. Include the main topic title and the bullet points the candidate should cover.",
            },
            speaking_part3: {
                v1: "Generate a set of 4-5 abstract IELTS Speaking Part 3 questions related to a specific theme. Return a title and the list of questions.",
            }
        }
    };

    private static OPERATION_SCHEMA = {
        type: SchemaType.OBJECT,
        properties: {
            title: { type: SchemaType.STRING, description: "A short, descriptive title for the exercise" },
            prompt: { type: SchemaType.STRING, description: "The full content of the question/prompt" }
        },
        required: ["title", "prompt"]
    };

    private static RESPONSE_SCHEMA = {
        type: SchemaType.OBJECT,
        properties: {
            overall_band: { type: SchemaType.NUMBER, description: "The overall IELTS band score (e.g., 6.5)" },
            breakdown: {
                type: SchemaType.OBJECT,
                properties: {
                    task_response: { type: SchemaType.NUMBER },
                    coherence: { type: SchemaType.NUMBER },
                    lexical: { type: SchemaType.NUMBER },
                    grammar: { type: SchemaType.NUMBER }
                },
                required: ["task_response", "coherence", "lexical", "grammar"]
            },
            feedback: { type: SchemaType.STRING, description: "Detailed feedback and improvement suggestions" },
            confidence: { type: SchemaType.NUMBER, description: "Confidence score of the evaluation (0-1)" }
        },
        required: ["overall_band", "breakdown", "feedback", "confidence"]
    };

    private static REWRITE_SCHEMA = {
        type: SchemaType.OBJECT,
        properties: {
            rewritten_text: { type: SchemaType.STRING, description: "The rewritten version of the input text" },
            improvements: { type: SchemaType.STRING, description: "Brief explanation of key improvements made" }
        },
        required: ["rewritten_text"]
    };

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY!;
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        this.logger = new Logger("AI Service");
    }

    async generateFeedback(type: keyof typeof AIService.PROMPTS, content: string, version: AIPromptVersion = "v1"): Promise<AIFeedbackResponse> {
        const model = this.genAI.getGenerativeModel({
            model: this.modelName,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: AIService.RESPONSE_SCHEMA as any,
            },
        });

        const promptBase = (AIService.PROMPTS[type] as any)[version] || AIService.PROMPTS.writing_task1.v1;
        const prompt = `${promptBase}\n\nCONTENT:\n${content}\n\nReturn the evaluation in the requested JSON format.`;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const parsed = JSON.parse(responseText);

            return {
                ...parsed,
                version
            };
        } catch (error) {
            console.error("AI Evaluation failed:", error);
            // Fallback mock or rethrow
            throw new Error("AI Evaluation failed. Please try again later.");
        }
    }

    async rewriteContent(content: string, version: AIPromptVersion = "v1"): Promise<{ rewritten_text: string, improvements?: string }> {
        const model = this.genAI.getGenerativeModel({
            model: this.modelName,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: AIService.REWRITE_SCHEMA as any,
            },
        });

        const promptBase = (AIService.PROMPTS.rewrite as any)[version];
        const prompt = `${promptBase}\n\nCONTENT:\n${content}\n\nReturn the result in the requested JSON format.`;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            return JSON.parse(responseText);
        } catch (error) {
            console.error("AI Rewrite failed:", error);
            throw new Error("AI Rewrite failed. Please try again later.");
        }
    }

    async generateExerciseContent(type: string, topic?: string, version: AIPromptVersion = "v1"): Promise<{ title: string, prompt: string }> {
        const model = this.genAI.getGenerativeModel({
            model: this.modelName,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: AIService.OPERATION_SCHEMA as any,
            },
        });

        const promptBase = (AIService.PROMPTS.generation as any)[type]?.[version];
        if (!promptBase) {
            throw new Error(`No generation prompt found for type: ${type}`);
        }

        let fullPrompt = `${promptBase}\n\n`;
        if (topic) {
            fullPrompt += `TOPIC / THEME: ${topic}\n\n`;
        }
        fullPrompt += `Return the result in the requested JSON format.`;

        this.logger.debug("Generating exercise content", { prompt: fullPrompt });

        try {
            const result = await model.generateContent(fullPrompt);
            const responseText = result.response.text();

            this.logger.info("Generated exercise content", { type, topic, version });

            return JSON.parse(responseText);
        } catch (error) {
            this.logger.error("AI Generation failed", { error, type, topic });
            throw error; // Let the action handler wrap this with traceId
        }
    }
}
