export type CriteriaType = 'TA' | 'CC' | 'LR' | 'GRA';

export interface BandDescriptor {
    score: number;
    feedback: string; // The specific reason derived from the rubric (e.g., "Uses a limited range of vocabulary")
    evidence: string[]; // Quotes from the user's essay proving the feedback
    improvement_tips: string[]; // Actionable advice to reach the next band
}

export interface WritingFeedbackResult {
    overall_score: number;
    task_type: 'academic' | 'general';
    detailed_scores: Record<CriteriaType, BandDescriptor>;
    general_comment: string;
}

export interface CorrectionItem {
    idx: number
    error: boolean
    original_segment: string
    fix: string
    better_version: string
    explanation: string
}
