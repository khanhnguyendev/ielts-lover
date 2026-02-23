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

export interface TextEdit {
    original_substring: string; // The EXACT snippet from the user's text that has an issue (e.g., "The graph show")
    suggested_fix: string;      // The corrected version (e.g., "The graph shows")
    better_version?: string;    // Optional: A Band 8.0+ paraphrase
    error_type: 'grammar' | 'spelling' | 'vocabulary' | 'style';
    error_label?: string;
    explanation: string;
}

export interface CorrectionResponse {
    edits: TextEdit[];
}

export interface ExampleEssayResult {
    essay_text: string;
    band_score: number;
    key_techniques: string[];
}

// Deprecated: Moving to TextEdit
export interface CorrectionItem {
    idx: number
    error: boolean
    original_segment: string
    fix: string
    better_version: string
    explanation: string
}
