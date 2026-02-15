"use client"

import * as React from "react"
import {
    ChevronLeft,
    Play,
    CheckCircle2,
    ArrowRight,
    MessageSquare,
    Info,
    Trophy,
    ChevronDown,
    AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { AppLoading } from "@/components/global/AppLoading"

import { getLessonById, getLessons, getLessonQuestions } from "@/app/actions";
import { Lesson, LessonQuestion } from "@/types";

export default function LessonPracticePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params)
    const [lesson, setLesson] = React.useState<Lesson | null>(null)
    const [allLessons, setAllLessons] = React.useState<Lesson[]>([])
    const [questions, setQuestions] = React.useState<LessonQuestion[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [step, setStep] = React.useState<"video" | "quiz">("video")

    // Quiz State
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
    const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null)
    const [isCorrect, setIsCorrect] = React.useState<boolean | null>(null)
    const [quizCompleted, setQuizCompleted] = React.useState(false)

    React.useEffect(() => {
        async function loadLesson() {
            setIsLoading(true)
            try {
                const [l, all, q] = await Promise.all([
                    getLessonById(id),
                    getLessons(),
                    getLessonQuestions(id)
                ])
                setLesson(l)
                setAllLessons(all)
                setQuestions(q)
            } catch (error) {
                console.error("Failed to load lesson:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadLesson()
    }, [id])

    const handleCheckAnswer = () => {
        if (selectedAnswer === null) return
        const currentQ = questions[currentQuestionIndex]
        const correct = selectedAnswer === currentQ.correct_answer_index
        setIsCorrect(correct)
    }

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setSelectedAnswer(null)
            setIsCorrect(null)
        } else {
            setQuizCompleted(true)
        }
    }

    if (isLoading) return <AppLoading />
    if (!lesson) return <div className="flex items-center justify-center h-full text-lg font-bold">Lesson not found.</div>

    const currentQuestion = questions[currentQuestionIndex]

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] -m-8 lg:-m-12 bg-white">
            {/* Header */}
            <header className="h-20 border-b flex items-center justify-between px-10 shrink-0">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard/lessons">
                        <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">Lesson Series • Lesson {lesson.order_index}</div>
                        <h1 className="text-lg font-black font-outfit">{lesson.title}</h1>
                    </div>
                </div>
                {/* Progress Bar logic could be improved to be real */}
                <div className="flex items-center gap-4">
                    <div className="h-2 w-32 bg-primary/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-2/3" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">66% Completed</span>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-12 bg-[#F9FAFB]">
                    <div className="max-w-4xl mx-auto space-y-10">
                        {step === "video" ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Video Player Placeholder */}
                                <div className="aspect-video bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden relative group cursor-pointer border-[8px] border-white">
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform">
                                            <Play className="h-10 w-10 text-white fill-white ml-1" />
                                        </div>
                                    </div>
                                    {/* Bottom Bar */}
                                    <div className="absolute bottom-0 inset-x-0 p-8 flex items-center gap-6 bg-gradient-to-t from-black/60 to-transparent">
                                        <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-1/4" />
                                        </div>
                                        <span className="text-white text-xs font-bold font-outfit">Video Tutorial</span>
                                    </div>
                                    {/* Use real video URL if available */}
                                    {lesson.video_url && (
                                        <iframe
                                            src={lesson.video_url.replace("watch?v=", "embed/")}
                                            title={lesson.title}
                                            className="absolute inset-0 w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-2xl font-black font-outfit">About this lesson</h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        {lesson.description}
                                    </p>
                                </div>

                                <div className="bg-white border rounded-[32px] p-10 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5">
                                            <CheckCircle2 className="h-8 w-8 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black font-outfit leading-tight">Video Completed!</h3>
                                            <p className="text-xs text-muted-foreground font-medium mt-1">
                                                {questions.length > 0
                                                    ? `Now test your knowledge with a quick ${questions.length}-question quiz.`
                                                    : "No quiz available for this lesson yet."}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setStep("quiz")}
                                        disabled={questions.length === 0}
                                        className="bg-primary hover:bg-primary/90 text-white h-14 px-8 rounded-2xl font-black text-sm shadow-xl shadow-primary/20"
                                    >
                                        Take the Quiz
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
                                {quizCompleted ? (
                                    <div className="bg-white rounded-[40px] border p-12 shadow-sm space-y-8 text-center">
                                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Trophy className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-3xl font-black font-outfit">Quiz Completed!</h2>
                                        <p className="text-muted-foreground">You have mastered this lesson.</p>
                                        <Button onClick={() => window.location.href = '/dashboard/lessons'} className="bg-primary hover:bg-primary/90 text-white h-14 px-10 rounded-2xl font-black">
                                            Back to Lessons
                                        </Button>
                                    </div>
                                ) : currentQuestion ? (
                                    <div className="bg-white rounded-[40px] border p-12 shadow-sm space-y-8">
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-primary">Question {currentQuestionIndex + 1} of {questions.length}</div>
                                            <h2 className="text-2xl font-black font-outfit leading-tight">
                                                {currentQuestion.question_text}
                                            </h2>
                                        </div>

                                        <div className="space-y-4">
                                            {currentQuestion.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => !isCorrect && setSelectedAnswer(i)}
                                                    disabled={isCorrect !== null}
                                                    className={cn(
                                                        "w-full p-6 text-left rounded-[24px] border-2 transition-all flex items-center justify-between group",
                                                        selectedAnswer === i
                                                            ? "border-primary bg-primary/5"
                                                            : "border-slate-100 hover:border-primary/20 bg-white"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold font-outfit transition-colors",
                                                            selectedAnswer === i ? "bg-primary text-white border-primary" : "text-slate-600 group-hover:text-primary group-hover:border-primary/40"
                                                        )}>
                                                            {String.fromCharCode(65 + i)}
                                                        </div>
                                                        <span className={cn(
                                                            "text-sm font-bold",
                                                            selectedAnswer === i ? "text-primary" : "text-slate-600"
                                                        )}>{opt}</span>
                                                    </div>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
                                                        selectedAnswer === i ? "bg-primary border-primary" : "border-slate-100 group-hover:border-primary/20"
                                                    )}>
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="pt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                <Info className="h-4 w-4" />
                                                <span className="text-xs font-medium">Select an answer to check.</span>
                                            </div>
                                            <Button
                                                disabled={selectedAnswer === null || isCorrect !== null}
                                                onClick={handleCheckAnswer}
                                                className="bg-primary hover:bg-primary/90 text-white h-14 px-10 rounded-2xl font-black text-sm shadow-xl shadow-primary/20"
                                            >
                                                Check Answer
                                            </Button>
                                        </div>

                                        {isCorrect !== null && (
                                            <div className={cn(
                                                "p-8 rounded-[32px] border-2 flex items-center justify-between animate-in zoom-in-95 duration-300",
                                                isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
                                            )}>
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                                                        isCorrect ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                                    )}>
                                                        {isCorrect ? <Trophy className="h-8 w-8" /> : <Info className="h-8 w-8" />}
                                                    </div>
                                                    <div>
                                                        <h4 className={cn("text-lg font-black font-outfit", isCorrect ? "text-emerald-900" : "text-red-900")}>
                                                            {isCorrect ? "Brilliant work!" : "Not quite right"}
                                                        </h4>
                                                        <p className={cn("text-xs font-medium mt-0.5", isCorrect ? "text-emerald-700" : "text-red-700")}>
                                                            {isCorrect
                                                                ? (currentQuestion.feedback_correct || "Correct answer!")
                                                                : (currentQuestion.feedback_incorrect || "Try again or review the video.")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleNextQuestion}
                                                    className={cn(
                                                        "h-12 rounded-xl font-black text-xs px-6 text-white",
                                                        isCorrect ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                                                    )}
                                                >
                                                    {isCorrect ? (currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz") : "Try Again / Next"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center p-12">
                                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                        <p>Error loading question.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* Sidebar Navigation */}
                <aside className="w-[450px] border-l flex flex-col bg-white overflow-hidden shrink-0">
                    <div className="p-8 border-b">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Up Next</h4>
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold font-outfit">Lexical Resource Series</h3>
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {allLessons.map((item, i) => (
                            <Link key={item.id} href={`/dashboard/lessons/${item.id}`} className="block">
                                <div className={cn(
                                    "p-6 rounded-[24px] border transition-all cursor-pointer flex items-center gap-5 group",
                                    item.id === id
                                        ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5"
                                        : "bg-white border-transparent hover:border-slate-100"
                                )}>
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold font-outfit transition-all",
                                        item.id === id
                                            ? "bg-primary text-white scale-110"
                                            : "bg-slate-100 text-slate-600 group-hover:bg-primary/10 group-hover:text-primary"
                                    )}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h5 className={cn(
                                            "text-sm font-bold truncate transition-colors",
                                            item.id === id ? "text-primary" : "text-slate-600 group-hover:text-primary"
                                        )}>{item.title}</h5>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{item.order_index} min</span>
                                            {item.id === id && (
                                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-md">
                                                    <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                                                    Playing
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="p-8 bg-slate-50 border-t space-y-4">
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <span>Ask your Personal Catbot about this lesson</span>
                        </div>
                        <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white hover:bg-white hover:border-primary border-slate-200 transition-all">
                            Open Discussion Forum
                        </Button>
                    </div>
                </aside>
            </div>
        </div>
    )
}
