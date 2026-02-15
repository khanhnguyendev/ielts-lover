"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createLesson } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function CreateLessonPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(e.currentTarget)
        const lesson = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            video_url: formData.get("video_url") as string,
            order_index: parseInt(formData.get("order_index") as string) || 0,
        }

        try {
            await createLesson(lesson)
            router.push("/admin/lessons")
        } catch (err) {
            console.error(err)
            setError("Failed to create lesson")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/lessons">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Create New Lesson</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border space-y-6 shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="title">Lesson Title</Label>
                    <Input id="title" name="title" required placeholder="e.g., Introduction to Task 1" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required placeholder="Brief summary of the lesson content..." />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="video_url">Video URL</Label>
                    <Input id="video_url" name="video_url" type="url" placeholder="https://..." />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="order_index">Order Index</Label>
                    <Input id="order_index" name="order_index" type="number" required defaultValue="1" />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/admin/lessons">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                        {isLoading ? "Creating..." : "Create Lesson"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
