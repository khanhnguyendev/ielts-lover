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
    overall_score: number
    cefrLevel: string
    originalText: string
    feedbackText: Array<{
        text: string
        cefr?: string
        annotationId?: number
        isError?: boolean
    }>
    detailed_scores: {
        TA: { score: number; feedback: string; evidence: string[]; improvement_tips: string[] };
        CC: { score: number; feedback: string; evidence: string[]; improvement_tips: string[] };
        LR: { score: number; feedback: string; evidence: string[]; improvement_tips: string[] };
        GRA: { score: number; feedback: string; evidence: string[]; improvement_tips: string[] };
    };
    feedbackCards: FeedbackCard[]
    cefrDistribution: Array<{ level: string, percentage: number }>
    task_type?: string
    general_comment?: string
    prompt?: string
    imageUrl?: string
    exampleEssay?: string
}

export interface SpeakingSampleData {
    id: number
    type: "Speaking"
    title: string
    overall_score: number
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
    overall_score: number
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
        overall_score: 8.5,
        cefrLevel: "C2",
        task_type: "Academic",
        general_comment: "This is an exceptionally strong response that demonstrates a near-perfect grasp of Academic Task 1 requirements. The data is synthesized effectively with high precision and sophisticated lexical choices.",
        originalText: "The chart displays the amount of milk consumed in four different countries over a ten-year period. Milk Consumption fluctuated significantly during this timeframe.",
        feedbackText: [
            { text: "The chart " },
            { text: "illustrates", cefr: "B2", annotationId: 1 },
            { text: " the " },
            { text: "quantity of milk consumed", cefr: "B2", annotationId: 2 },
            { text: " across " },
            { text: "a quartet of diverse nations", cefr: "C1", annotationId: 3 },
            { text: " over a " },
            { text: "ten-year duration", cefr: "B1", annotationId: 4 },
            { text: ". " },
            { text: "Milk Consumption", cefr: "C1", annotationId: 5 },
            { text: " fluctuated significantly during this timeframe." }
        ],
        detailed_scores: {
            TA: {
                score: 9.0,
                feedback: "The response fully satisfies all the requirements of the task.",
                evidence: ["The overview clearly states the main trends.", "Data for all four countries is accurately reported."],
                improvement_tips: ["Maintain this level of detail in future reports."]
            },
            CC: {
                score: 8.5,
                feedback: "Information and ideas are logically organized.",
                evidence: ["Paragraphs are well-structured based on country comparisons.", "Effective use of cohesive devices like 'Meanwhile' and 'Conversely'."],
                improvement_tips: ["Ensure transition words are always varied."]
            },
            LR: {
                score: 8.5,
                feedback: "Uses a wide range of vocabulary with very natural features.",
                evidence: ["Terminologies like 'varying patterns' and 'distinct nations' are used effectively.", "Precise verbs such as 'illustrates' and 'fluctuated'."],
                improvement_tips: ["Try to incorporate more academic collocations."]
            },
            GRA: {
                score: 8.5,
                feedback: "Uses a wide range of structures with full flexibility.",
                evidence: ["Complex sentences are used throughout with no errors.", "Accurate use of past perfect and comparative structures."],
                improvement_tips: ["Ensure subject-verb agreement in more complex data sets."]
            }
        },
        feedbackCards: [
            {
                id: 1,
                type: "Vocabulary",
                original: "displays",
                suggested: "illustrates",
                explanation: "'Illustrates' is more appropriate for describing visual data in Academic Task 1.",
                category: "Word Choice"
            },
            {
                id: 2,
                type: "Grammar",
                original: "amount of milk consumed",
                suggested: "quantity of milk consumed",
                explanation: "While 'amount' is acceptable for uncountable nouns, 'quantity' is often preferred in formal reports dealing with measured volume.",
                category: "Precision"
            },
            {
                id: 3,
                type: "Coherence",
                original: "four different countries",
                suggested: "a quartet of diverse nations",
                explanation: "Using more sophisticated terminology like 'quartet' and 'diverse nations' can elevate the lexical variety and coherence of the introduction.",
                category: "Lexical Variety"
            },
            {
                id: 4,
                type: "Grammar",
                original: "ten-year period",
                suggested: "ten-year duration",
                explanation: "Varying temporal descriptions helps avoid repetition within the report's introduction and summary paragraphs.",
                category: "Academic Style"
            },
            {
                id: 5,
                type: "Vocabulary",
                original: "Milk Consumption",
                suggested: "Dairy Intake",
                explanation: "Using synonyms like 'Dairy Intake' demonstrates a broader lexical resource, which is key for a higher band score.",
                category: "Paraphrasing"
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
        prompt: "The chart below shows the amount of milk consumed in four different countries over a ten-year period. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
        exampleEssay: "The provided bar chart compares the quantity of milk consumed in four distinct nations—Country A, Country B, Country C, and Country D—over a ten-year duration starting from 2010.\n\nOverall, it is clear that milk consumption fluctuated significantly during this timeframe across all countries. Country A and Country C witnessed a noticeable increase in consumption, whereas Country B and Country D experienced a moderate decline by the end of the period.\n\nIn 2010, Country B led the group with approximately 150 liters per capita, followed closely by Country A at 140 liters. Over the next five years, Country A's consumption surged to a peak of 170 liters before stabilizing. Conversely, Country B's intake saw a gradual decrease, falling to 130 liters by 2020.\n\nCountry C and Country D started at lower levels of 100 and 110 liters respectively. Country C showed a steady upward trend, reaching 125 liters by 2020. In contrast, Country D's consumption dropped to 95 liters by 2015 but recovered slightly to 105 liters by the end of the decade."
    }
}
