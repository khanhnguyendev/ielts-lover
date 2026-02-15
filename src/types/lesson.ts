export type LessonQuestion = {
    id: string;
    lesson_id: string;
    question_text: string;
    options: string[];
    correct_answer_index: number;
    feedback_correct?: string;
    feedback_incorrect?: string;
    order_index: number;
    created_at: string;
};

export type Lesson = {
    id: string;
    title: string;
    description: string;
    video_url: string;
    order_index: number;
    created_at: string;
    questions?: LessonQuestion[];
};
