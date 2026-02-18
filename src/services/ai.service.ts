import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { EXERCISE_TYPES } from "@/lib/constants";

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
    private static PROMPTS = {
        [EXERCISE_TYPES.WRITING_TASK1]: {
            v1: "Analyze the following IELTS Writing Task 1 response and provide a score based on Task Achievement, Coherence, Lexical Resource, and Grammatical Range.",
            v2: `Analyze the following IELTS Writing Task 1 response according to official IELTS public band descriptors. 
            
            CRITICAL RULES:
            1. WORD COUNT PENALTY: Task 1 requires 150+ words. If the response is significantly underlength, you MUST penalize the Task Achievement score severely. 
            2. INCOMPLETE RESPONSES: If the response is less than 50 words, completely off-topic, or nonsensical, provide an Overall Band between 1.0 and 3.0. A few sentences or developer notes DO NOT qualify for a Band 7.0 even if grammatically correct.
            3. CEFR ALIGNMENT: To achieve Band 7.0+ (C1), the writer must demonstrate complex sentence structures and a wide range of specialized vocabulary.
            
            Provide a detailed report including: 1. Overall band score and CEFR level. 2. Annotated feedback (original text fragments with corrections). 3. Detailed band score breakdown. 4. Specific mistake cards. 5. CEFR distribution.`
        },
        [EXERCISE_TYPES.WRITING_TASK2]: {
            v1: "Analyze the following IELTS Writing Task 2 essay and provide a detailed band score breakdown and improvement suggestions.",
            v2: `Analyze the following IELTS Writing Task 2 essay according to official IELTS public band descriptors.
            
            CRITICAL RULES:
            1. WORD COUNT PENALTY: Task 2 requires 250+ words. If the response is underlength, penalize the Task Response score. 
            2. INCOMPLETE RESPONSES: If the response is less than 100 words, provide an Overall Band between 1.0 and 4.0. Developer notes or casual chat are NOT Band 7.0/8.0.
            3. CEFR ALIGNMENT: Band 7.0+ (C1) requires sustained logical development and sophisticated language use.
            4. BAND DESCRIPTORS: Provide detailed feedback for each of the 4 criteria: Task Response (TA), Coherence and Cohesion (CC), Lexical Resource (LR), and Grammatical Range and Accuracy (GRA).
            
            Return a JSON object matching this structure:
            {
              "overall_score": number,
              "task_type": "academic", 
              "general_comment": "string summarising the work",
              "detailed_scores": {
                "TA": { "score": number, "feedback": "string", "evidence": ["string"], "improvement_tips": ["string"] },
                "CC": { "score": number, "feedback": "string", "evidence": ["string"], "improvement_tips": ["string"] },
                "LR": { "score": number, "feedback": "string", "evidence": ["string"], "improvement_tips": ["string"] },
                "GRA": { "score": number, "feedback": "string", "evidence": ["string"], "improvement_tips": ["string"] }
              }
            }`
        },
        [EXERCISE_TYPES.SPEAKING_PART1]: {
            v1: "Analyze the following IELTS Speaking Part 1 transcript and provide a score based on Fluency, Lexical Resource, Grammatical Range, and Pronunciation.",
        },
        [EXERCISE_TYPES.SPEAKING_PART2]: {
            v1: "Analyze the following IELTS Speaking Part 2 transcript and provide a score based on Fluency, Lexical Resource, Grammatical Range, and Pronunciation.",
        },
        [EXERCISE_TYPES.SPEAKING_PART3]: {
            v1: "Analyze the following IELTS Speaking Part 3 transcript and provide a score based on Fluency, Lexical Resource, Grammatical Range, and Pronunciation.",
        },
        rewrite: {
            v1: "Rewrite the following text to be more academic and professional, suitable for IELTS Writing Band 8.0+. Improve vocabulary and sentence structure while retaining the original meaning.",
        },
        generation: {
            [EXERCISE_TYPES.WRITING_TASK1]: {
                v1: "Generate a realistic IELTS Writing Task 1 prompt. Include a title describing the chart/graph/process, and the full question prompt. NOTE: Since you cannot generate images, strictly describe what the visual data would be in the prompt text so the user knows what image to find/create.",
            },
            [EXERCISE_TYPES.WRITING_TASK2]: {
                v1: "Generate a challenging IELTS Writing Task 2 essay prompt on a common topic (e.g., Education, Environment, Technology). Include a catchy title and the full essay question.",
            },
            [EXERCISE_TYPES.SPEAKING_PART1]: {
                v1: "Generate a set of 3-4 IELTS Speaking Part 1 questions on a specific manufacturing topic. Return a title (e.g., 'Hometown', 'Work') and the list of questions.",
            },
            [EXERCISE_TYPES.SPEAKING_PART2]: {
                v1: "Generate an IELTS Speaking Part 2 Cue Card topic. Include the main topic title and the bullet points the candidate should cover.",
            },
            [EXERCISE_TYPES.SPEAKING_PART3]: {
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
            overall_score: { type: SchemaType.NUMBER },
            task_type: { type: SchemaType.STRING },
            general_comment: { type: SchemaType.STRING },
            detailed_scores: {
                type: SchemaType.OBJECT,
                properties: {
                    TA: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: { type: SchemaType.NUMBER },
                            feedback: { type: SchemaType.STRING },
                            evidence: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            improvement_tips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        },
                        required: ["score", "feedback", "evidence", "improvement_tips"]
                    },
                    CC: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: { type: SchemaType.NUMBER },
                            feedback: { type: SchemaType.STRING },
                            evidence: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            improvement_tips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        },
                        required: ["score", "feedback", "evidence", "improvement_tips"]
                    },
                    LR: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: { type: SchemaType.NUMBER },
                            feedback: { type: SchemaType.STRING },
                            evidence: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            improvement_tips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        },
                        required: ["score", "feedback", "evidence", "improvement_tips"]
                    },
                    GRA: {
                        type: SchemaType.OBJECT,
                        properties: {
                            score: { type: SchemaType.NUMBER },
                            feedback: { type: SchemaType.STRING },
                            evidence: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                            improvement_tips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                        },
                        required: ["score", "feedback", "evidence", "improvement_tips"]
                    }
                },
                required: ["TA", "CC", "LR", "GRA"]
            }
        },
        required: ["overall_score", "task_type", "general_comment", "detailed_scores"]
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

    async generateFeedback(type: string, content: string, version: AIPromptVersion = "v1"): Promise<AIFeedbackResponse> {
        const model = this.genAI.getGenerativeModel({
            model: this.modelName,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: AIService.RESPONSE_SCHEMA as any,
            },
        });

        const promptBase = (AIService.PROMPTS as any)[type]?.[version] || AIService.PROMPTS[EXERCISE_TYPES.WRITING_TASK1].v1;
        const prompt = `${promptBase}\n\nCONTENT:\n${content}\n\nReturn the evaluation in the requested JSON format.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        return {
            ...parsed,
            version
        };
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

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return JSON.parse(responseText);
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

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();

        return JSON.parse(responseText);
    }

    async generateChartData(topic?: string, chartType?: string, version: AIPromptVersion = "v1"): Promise<any> {
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

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();
        return JSON.parse(responseText);
    }

    async generateWritingReport(type: typeof EXERCISE_TYPES.WRITING_TASK1 | typeof EXERCISE_TYPES.WRITING_TASK2, content: string, version: AIPromptVersion = "v2"): Promise<any> {
        const model = this.genAI.getGenerativeModel({
            model: this.modelName,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: AIService.REPORT_SCHEMA as any,
            },
        });

        const promptBase = (AIService.PROMPTS[type] as any)[version] || AIService.PROMPTS[EXERCISE_TYPES.WRITING_TASK1].v2;
        const prompt = `${promptBase}\n\nCONTENT:\n${content}\n\nReturn the evaluation in the requested JSON format matching the WritingSampleData structure.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        return JSON.parse(responseText);
    }
}
