"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getLessonById } from "@/app/actions"
import { updateLesson, deleteLesson, createLessonQuestion, deleteLessonQuestion, getLessonQuestions } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Plus, Trash2, GripVertical } from "lucide-react"
import Link from "next/link"
import { Lesson, LessonQuestion } from "@/types"
import { use } from "react"
import { useNotification } from "@/lib/contexts/notification-context"

export default function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()

    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [questions, setQuestions] = useState<LessonQuestion[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const { notifySuccess, notifyError, notifyWarning } = useNotification()

    // New Question State
    const [newQuestionText, setNewQuestionText] = useState("")
    const [newOptions, setNewOptions] = useState(["", "", "", ""])
    const [correctIndex, setCorrectIndex] = useState(0)
    const [isAddingQuestion, setIsAddingQuestion] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                const [l, q] = await Promise.all([
                    getLessonById(id),
                    getLessonQuestions(id)
                ])
                if (!l) {
                    notifyError("Not Found", "The requested lesson could not be located.", "Close")
                    return
                }
                setLesson(l)
                setQuestions(q)
            } catch (err) {
                console.error(err)
                notifyError("Load Failed", "We couldn't retrieve the lesson data. Please check your connection.", "Retry")
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [id])

    const handleUpdateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!lesson) return
        setIsSaving(true)

        const formData = new FormData(e.currentTarget)
        const updates = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            video_url: formData.get("video_url") as string,
            order_index: parseInt(formData.get("order_index") as string) || 0,
        }

        try {
            await updateLesson(lesson.id, updates)
            router.refresh()
            notifySuccess("Lesson Updated", "Your changes have been saved successfully.", "Close")
        } catch (err) {
            console.error(err)
            notifyError("Update Failed", "We couldn't save your changes. Please try again.", "Close")
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteLesson = async () => {
        if (!lesson) return

        notifyWarning(
            "Delete Lesson?",
            "This will permanently remove the lesson and all associated quiz questions. This action cannot be undone.",
            "Delete Permanently",
            async () => {
                try {
                    await deleteLesson(lesson.id)
                    router.push("/admin/lessons")
                } catch (err) {
                    console.error(err)
                    notifyError("Delete Failed", "We couldn't remove the lesson. Please try again.", "Close")
                }
            }
        )
    }

    const handleAddQuestion = async () => {
        if (!lesson || !newQuestionText) return

        try {
            await createLessonQuestion({
                lesson_id: lesson.id,
                question_text: newQuestionText,
                options: newOptions,
                correct_answer_index: correctIndex,
                order_index: questions.length + 1
            })
            // Reset form
            setNewQuestionText("")
            setNewOptions(["", "", "", ""])
            setIsAddingQuestion(false)
            // Reload questions
            const q = await getLessonQuestions(lesson.id)
            setQuestions(q)
            notifySuccess("Question Added", "The new quiz question has been saved.", "Close")
        } catch (err) {
            console.error(err)
            notifyError("Task Failed", "We couldn't add the question. Please check all fields.", "Close")
        }
    }

    const handleDeleteQuestion = async (qId: string) => {
        if (!lesson) return

        notifyWarning(
            "Delete Question?",
            "Are you sure you want to remove this question from the quiz?",
            "Delete",
            async () => {
                try {
                    await deleteLessonQuestion(qId, lesson.id)
                    const q = await getLessonQuestions(lesson.id)
                    setQuestions(q)
                    notifySuccess("Question Removed", "The question has been deleted successfully.", "Close")
                } catch (err) {
                    console.error(err)
                    notifyError("Operation Failed", "We couldn't delete the question.", "Close")
                }
            }
        )
    }

    if (isLoading) return <div className="p-8">Loading...</div>
    if (!lesson) return <div className="p-8">Lesson not found</div>

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div className="flex items-center justify-between">
                <Link href="/admin/lessons">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={handleDeleteLesson}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Lesson
                </Button>
            </div>

            {/* Lesson Details Form */}
            <form onSubmit={handleUpdateLesson} className="bg-white p-8 rounded-xl border space-y-6 shadow-sm">
                <h2 className="text-lg font-semibold border-b pb-4">Lesson Details</h2>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2">
                        <Label>Title</Label>
                        <Input name="title" defaultValue={lesson.title} required />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <Label>Description</Label>
                        <Textarea name="description" defaultValue={lesson.description} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Video URL</Label>
                        <Input name="video_url" defaultValue={lesson.video_url} />
                    </div>
                    <div className="space-y-2">
                        <Label>Order Index</Label>
                        <Input name="order_index" type="number" defaultValue={lesson.order_index} required />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>

            {/* Questions Management */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Quiz Questions ({questions.length})</h2>
                    <Button onClick={() => setIsAddingQuestion(!isAddingQuestion)} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                    </Button>
                </div>

                {isAddingQuestion && (
                    <div className="bg-gray-50 p-6 rounded-xl border space-y-4 animate-in slide-in-from-top-4">
                        <h3 className="font-semibold">New Question</h3>
                        <div className="space-y-2">
                            <Label>Question Text</Label>
                            <Input
                                value={newQuestionText}
                                onChange={(e) => setNewQuestionText(e.target.value)}
                                placeholder="e.g., What does 'illustrate' mean?"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label>Options (Select the radio button for the correct answer)</Label>
                            {newOptions.map((opt, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="correct"
                                        checked={correctIndex === i}
                                        onChange={() => setCorrectIndex(i)}
                                        className="w-4 h-4"
                                    />
                                    <Input
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...newOptions]
                                            newOpts[i] = e.target.value
                                            setNewOptions(newOpts)
                                        }}
                                        placeholder={`Option ${i + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsAddingQuestion(false)}>Cancel</Button>
                            <Button onClick={handleAddQuestion}>Save Question</Button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {questions.map((q, i) => (
                        <div key={q.id} className="bg-white p-6 rounded-xl border flex items-start gap-4 shadow-sm group">
                            <div className="mt-1 text-gray-400">
                                <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="font-semibold text-gray-900">
                                    <span className="text-gray-500 mr-2">Q{i + 1}.</span>
                                    {q.question_text}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {q.options.map((opt, j) => (
                                        <div key={j} className={`text-sm p-2 rounded border ${j === q.correct_answer_index ? "bg-green-50 border-green-200 text-green-800 font-medium" : "bg-gray-50 border-gray-100 text-gray-500"}`}>
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteQuestion(q.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    {questions.length === 0 && !isAddingQuestion && (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed">
                            <p className="text-gray-500">No questions yet. Add one to create a quiz!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
