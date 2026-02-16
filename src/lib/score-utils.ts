export interface BandScoreConfig {
    score: number;
    cefr: string;
    color: string;
    bg: string;
    border: string;
    description: string;
}

export const getBandScoreConfig = (score: number | string | undefined): BandScoreConfig => {
    const numericScore = typeof score === 'string' ? parseFloat(score) : score || 0;

    if (numericScore >= 8.5) {
        return {
            score: numericScore,
            cefr: "C2",
            color: "text-purple-700",
            bg: "bg-purple-50",
            border: "border-purple-100",
            description: "Expert User"
        };
    }
    if (numericScore >= 7.0) {
        return {
            score: numericScore,
            cefr: "C1",
            color: "text-indigo-700",
            bg: "bg-indigo-50",
            border: "border-indigo-100",
            description: "Good User"
        };
    }
    if (numericScore >= 5.5) {
        return {
            score: numericScore,
            cefr: "B2",
            color: "text-emerald-700",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            description: "Competent User"
        };
    }
    if (numericScore >= 4.0) {
        return {
            score: numericScore,
            cefr: "B1",
            color: "text-amber-700",
            bg: "bg-amber-50",
            border: "border-amber-100",
            description: "Modest User"
        };
    }
    return {
        score: numericScore,
        cefr: "A2",
        color: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-100",
        description: "Limited User"
    };
};
