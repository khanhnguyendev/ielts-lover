import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Logger, withTrace } from "@/lib/logger";

/**
 * AI Service: Orchestrates all AI calls.
 * Prompts are versioned and structured here.
 */

export type AIPromptVersion = "v1" | "v2";

const logger = new Logger("AIService");

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
    private static PROMPTS = {
        writing_task1: {
            v1: "Analyze the following IELTS Writing Task 1 response and provide a score based on Task Achievement, Coherence, Lexical Resource, and Grammatical Range.",
            v2: `Analyze the following IELTS Writing Task 1 response according to official IELTS public band descriptors. 
            
            CRITICAL RULES:
            1. WORD COUNT PENALTY: Task 1 requires 150+ words. If the response is significantly underlength, you MUST penalize the Task Achievement score severely. 
            2. INCOMPLETE RESPONSES: If the response is less than 50 words, completely off-topic, or nonsensical, provide an Overall Band between 1.0 and 3.0. A few sentences or developer notes DO NOT qualify for a Band 7.0 even if grammatically correct.
            3. CEFR ALIGNMENT: To achieve Band 7.0+ (C1), the writer must demonstrate complex sentence structures and a wide range of specialized vocabulary.
            
            Provide a detailed report including: 1. Overall band score and CEFR level. 2. Annotated feedback (original text fragments with corrections). 3. Detailed band score breakdown. 4. Specific mistake cards. 5. CEFR distribution.`
        },
        writing_task2: {
            v1: "Analyze the following IELTS Writing Task 2 essay and provide a detailed band score breakdown and improvement suggestions.",
            v2: `Analyze the following IELTS Writing Task 2 essay according to official IELTS public band descriptors.
            
            CRITICAL RULES:
            1. WORD COUNT PENALTY: Task 2 requires 250+ words. If the response is underlength, penalize the Task Response score. 
            2. INCOMPLETE RESPONSES: If the response is less than 100 words, provide an Overall Band between 1.0 and 4.0. Developer notes or casual chat are NOT Band 7.0/8.0.
            3. CEFR ALIGNMENT: Band 7.0+ (C1) requires sustained logical development and sophisticated language use.
            
            Provide a detailed report including: 1. Overall band score and CEFR level. 2. Annotated feedback. 3. Detailed band score breakdown. 4. Specific mistake cards. 5. CEFR distribution.`
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

    private static REPORT_SCHEMA = {
        type: SchemaType.OBJECT,
        properties: {
            bandScore: { type: SchemaType.NUMBER, description: "The overall IELTS band score (e.g., 6.5)" },
            cefrLevel: { type: SchemaType.STRING, description: "The overall CEFR level (e.g., B2, C1)" },
            feedbackText: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        text: { type: SchemaType.STRING },
                        cefr: { type: SchemaType.STRING, nullable: true },
                        annotationId: { type: SchemaType.NUMBER, nullable: true },
                        isError: { type: SchemaType.BOOLEAN, nullable: true }
                    },
                    required: ["text"]
                }
            },
            criteria: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: { type: SchemaType.STRING },
                        score: { type: SchemaType.NUMBER },
                        details: { type: SchemaType.STRING }
                    },
                    required: ["name", "score", "details"]
                }
            },
            feedbackCards: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: { type: SchemaType.NUMBER },
                        type: { type: SchemaType.STRING, description: "Task Achievement | Coherence | Grammar | Vocabulary" },
                        original: { type: SchemaType.STRING },
                        suggested: { type: SchemaType.STRING },
                        explanation: { type: SchemaType.STRING },
                        category: { type: SchemaType.STRING }
                    },
                    required: ["id", "type", "original", "suggested", "explanation", "category"]
                }
            },
            cefrDistribution: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        level: { type: SchemaType.STRING },
                        percentage: { type: SchemaType.NUMBER }
                    },
                    required: ["level", "percentage"]
                }
            }
        },
        required: ["bandScore", "cefrLevel", "feedbackText", "criteria", "feedbackCards", "cefrDistribution"]
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
    }

    async generateFeedback(type: keyof typeof AIService.PROMPTS, content: string, version: AIPromptVersion = "v1"): Promise<AIFeedbackResponse> {
        return withTrace(async () => {
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

                logger.info("AI Evaluation successful", { type, version });
                return {
                    ...parsed,
                    version
                };
            } catch (error) {
                logger.error("AI Evaluation failed", { error, type, version });
                // Fallback mock or rethrow
                throw new Error("AI Evaluation failed. Please try again later.");
            }
        });
    }

    async rewriteContent(content: string, version: AIPromptVersion = "v1"): Promise<{ rewritten_text: string, improvements?: string }> {
        return withTrace(async () => {
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
                logger.info("AI Rewrite successful", { version });
                return JSON.parse(responseText);
            } catch (error) {
                logger.error("AI Rewrite failed", { error, version });
                throw new Error("AI Rewrite failed. Please try again later.");
            }
        });
    }

    async generateExerciseContent(type: string, topic?: string, version: AIPromptVersion = "v1"): Promise<{ title: string, prompt: string }> {
        return withTrace(async () => {
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

            logger.debug("Generating exercise content", { prompt: fullPrompt });

            try {
                const result = await model.generateContent(fullPrompt);
                const responseText = result.response.text();

                logger.info("Generated exercise content", { type, topic, version });

                return JSON.parse(responseText);
            } catch (error) {
                logger.error("AI Generation failed", { error, type, topic });
                throw error; // Let the action handler wrap this with traceId
            }
        });
    }

    async generateChartData(topic?: string, chartType?: string, version: AIPromptVersion = "v1"): Promise<any> {
        return withTrace(async () => {
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    responseMimeType: "application/json",
                    // We use a loose schema or specific one for charts, but strict schema is better
                },
            });

            const promptBase = "Generate valid JSON data for a Chart.js (v2/v3) chart representing a realistic IELTS Writing Task 1 scenario. Return a title, chart type (bar, line, pie), labels, and datasets.";

            let fullPrompt = `${promptBase}\n`;
            if (topic) {
                fullPrompt += `TOPIC: ${topic}\n`;
            }
            if (chartType && chartType !== "auto") {
                fullPrompt += `REQUIRED CHART TYPE: ${chartType} (Ensure the JSON "type" field matches this exactly)\n`;
            }
            fullPrompt += `
        Required JSON Structure:
        {
            "title": "string",
            "prompt": "string (the full essay question describing the chart)",
            "chart_config": {
                "type": "bar" | "line" | "pie" | "doughnut",
                "data": {
                    "labels": ["string", "string"],
                    "datasets": [
                        { "label": "string", "data": [number, number] }
                    ]
                }
            }
        }
        `;

            logger.debug("Generating chart data", { prompt: fullPrompt });

            try {
                const result = await model.generateContent(fullPrompt);
                const responseText = result.response.text();
                logger.info("Generated chart data", { topic });
                return JSON.parse(responseText);
            } catch (error) {
                logger.error("AI Chart Generation failed", { error, topic });
                throw error;
            }
        });
    }

    async generateWritingReport(type: "writing_task1" | "writing_task2", content: string, version: AIPromptVersion = "v2"): Promise<any> {
        return withTrace(async () => {
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: AIService.REPORT_SCHEMA as any,
                },
            });

            const promptBase = (AIService.PROMPTS[type] as any)[version] || AIService.PROMPTS.writing_task1.v2;
            const prompt = `${promptBase}\n\nCONTENT:\n${content}\n\nReturn the evaluation in the requested JSON format matching the WritingSampleData structure.`;

            try {
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();
                logger.info("Generated detailed writing report", { type, version });
                return JSON.parse(responseText);
            } catch (error) {
                logger.error("Detailed Writing Report generation failed", { error, type });
                throw new Error("Detailed AI Evaluation failed. Please try again later.");
            }
        });
    }
}
