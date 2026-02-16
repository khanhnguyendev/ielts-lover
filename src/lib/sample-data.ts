import { LucideIcon } from "lucide-react"

export interface CEFRLevel {
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
    color: string
    bg: string
}

export const CEFR_COLORS: Record<string, CEFRLevel> = {
    A1: { level: "A1", color: "text-slate-500", bg: "bg-slate-100" },
    A2: { level: "A2", color: "text-emerald-600", bg: "bg-emerald-100" },
    B1: { level: "B1", color: "text-blue-600", bg: "bg-blue-100" },
    B2: { level: "B2", color: "text-purple-600", bg: "bg-purple-100" },
    C1: { level: "C1", color: "text-orange-600", bg: "bg-orange-100" },
    C2: { level: "C2", color: "text-red-600", bg: "bg-red-100" },
}

export interface FeedbackCard {
    id: number
    type: "Task Achievement" | "Coherence" | "Grammar" | "Vocabulary"
    original: string
    suggested: string
    explanation: string
    category: string
}

export interface WritingSampleData {
    id: number
    type: "Writing"
    taskType: "Academic Task 1" | "General Task 1" | "Task 2"
    title: string
    bandScore: number
    cefrLevel: string
    originalText: string
    feedbackText: Array<{
        text: string
        cefr?: string
        annotationId?: number
        isError?: boolean
    }>
    criteria: Array<{
        name: string
        score: number
        details: string
    }>
    feedbackCards: FeedbackCard[]
    cefrDistribution: Array<{ level: string, percentage: number }>
    prompt?: string
    imageUrl?: string
}

export interface SpeakingSampleData {
    id: number
    type: "Speaking"
    title: string
    bandScore: number
    cefrLevel: string
    audioUrl: string
    transcript: Array<{
        startTime: string
        endTime: string
        text: Array<{
            word: string
            cefr?: string
            pronunciation?: "Good" | "Fair" | "Needs Improvement"
            annotationId?: number
        }>
    }>
    criteria: Array<{
        name: string
        score: number
        details: string
        paraphrasingTips?: Array<{ original: string, suggested: string[] }>
        mistakes?: Array<{ word: string, error: string, correction: string, explanation: string }>
        pronunciationMistakes?: Array<{
            word: string
            frequency: number
            accuracy: number
            ukPhonetic: string
            usPhonetic: string
        }>
    }>
    prompt?: string
    imageUrl?: string
}

export interface RewriterSampleData {
    id: number
    type: "Rewriter"
    title: string
    originalText: string
    rewrittenText: string
    improvements: Array<{
        category: string
        description: string
    }>
    bandScore: number
    cefrLevel: string
    prompt?: string
    imageUrl?: string
}

export const SAMPLE_REPORTS: Record<number, WritingSampleData | SpeakingSampleData | RewriterSampleData> = {
    1: {
        id: 1,
        type: "Writing",
        taskType: "Academic Task 1",
        title: "Milk Consumption - Academic Task 1",
        bandScore: 8.5,
        cefrLevel: "C2",
        originalText: "The chart displays the amount of milk consumed in four different countries...",
        feedbackText: [
            { text: "The chart " },
            { text: "illustrates", cefr: "B2", annotationId: 1 },
            { text: " the " },
            { text: "varying patterns", cefr: "C1" },
            { text: " of milk consumption across four " },
            { text: "distinct nations", cefr: "C1" },
            { text: " over a " },
            { text: "ten-year period", cefr: "B1" },
            { text: "." }
        ],
        criteria: [
            { name: "Task Achievement", score: 9.0, details: "The response fully satisfies all the requirements of the task." },
            { name: "Coherence and Cohesion", score: 8.5, details: "Information and ideas are logically organized." },
            { name: "Lexical Resource", score: 8.5, details: "Uses a wide range of vocabulary with very natural features." },
            { name: "Grammatical Range", score: 8.5, details: "Uses a wide range of structures with full flexibility." }
        ],
        feedbackCards: [
            {
                id: 1,
                type: "Vocabulary",
                original: "displays",
                suggested: "illustrates",
                explanation: "'Illustrates' is more appropriate for describing visual data in Academic Task 1.",
                category: "Word Choice"
            }
        ],
        cefrDistribution: [
            { level: "A1", percentage: 40 },
            { level: "A2", percentage: 20 },
            { level: "B1", percentage: 15 },
            { level: "B2", percentage: 10 },
            { level: "C1", percentage: 10 },
            { level: "C2", percentage: 5 }
        ],
        prompt: "The chart below shows the amount of milk consumed in four different countries over a ten-year period. Summarize the information by selecting and reporting the main features, and make comparisons where relevant."
    },
    2: {
        id: 2,
        type: "Speaking",
        title: "Describe a beautiful place",
        bandScore: 9.0,
        cefrLevel: "C2",
        audioUrl: "/samples/speaking-1.mp3",
        transcript: [
            {
                startTime: "0:00",
                endTime: "0:15",
                text: [
                    { word: "Well,", cefr: "A1" },
                    { word: "I'd", cefr: "B1" },
                    { word: "like", cefr: "A1" },
                    { word: "to", cefr: "A1" },
                    { word: "talk", cefr: "A1" },
                    { word: "about", cefr: "A1" },
                    { word: "a", cefr: "A1" },
                    { word: "truly", cefr: "B2" },
                    { word: "breathtaking", cefr: "C1" },
                    { word: "location", cefr: "B2" },
                    { word: "in", cefr: "A1" },
                    { word: "the", cefr: "A1" },
                    { word: "heart", cefr: "B1" },
                    { word: "of", cefr: "A1" },
                    { word: "Switzerland.", cefr: "A1" }
                ]
            }
        ],
        criteria: [
            { name: "Fluency", score: 9.0, details: "Excellent flow with no hesitation." },
            { name: "Vocabulary", score: 9.0, details: "Sophisticated usage of idiomatic language." }
        ]
    },
    7: {
        id: 7,
        type: "Rewriter",
        title: "Academic Essay Refinement",
        originalText: "I think that technology is making people more lazy nowadays because they use phones for everything.",
        rewrittenText: "There is a growing concern that contemporary technological advancements are engendering a sense of lethargy among the populace, as individuals increasingly rely on digital devices for even the most mundane tasks.",
        improvements: [
            { category: "Vocabulary", description: "Replaced 'more lazy' with 'lethargy among the populace' for a more academic tone." },
            { category: "Cohesion", description: "Used 'as' to create a logical causal link between dependency and behavior." },
            { category: "Precision", description: "Substituted 'phones' with 'digital devices' to encompass a wider range of technology." }
        ],
        bandScore: 9.0,
        cefrLevel: "C2"
    }
}
