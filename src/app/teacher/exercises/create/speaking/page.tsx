"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createTeacherExercise, generateTeacherAIExercise } from "@/app/teacher/actions";
import { Sparkles, Loader2 } from "lucide-react";
import { useNotification } from "@/lib/contexts/notification-context"
import { ErrorDetailsDialog } from "@/components/admin/error-details-dialog";

export default function TeacherCreateSpeakingExercisePage() {
    const { notifySuccess, notifyError } = useNotification();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [type, setType] = useState<"speaking_part1" | "speaking_part2" | "speaking_part3">("speaking_part1");

    const [title, setTitle] = useState("");
    const [prompt, setPrompt] = useState("");
    const [topic, setTopic] = useState("");

    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [isErrorOpen, setIsErrorOpen] = useState(false);

    async function handleGenerate() {
        setIsGenerating(true);
        setErrorDetails(null);
        try {
            const result = await generateTeacherAIExercise(type, topic || undefined);
            if (result) {
                setTitle(result.title as string);
                setPrompt(result.prompt as string);
                notifySuccess("Generated", "Content generated successfully!");
            }
        } catch (error) {
            console.error("Failed to generate exercise:", error);
            const message = error instanceof Error ? error.message : "Unknown error occurred";
            setErrorDetails(message);
            setIsErrorOpen(true);
        } finally {
            setIsGenerating(false);
        }
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);

        const formTitle = formData.get("title") as string;
        const formPrompt = formData.get("prompt") as string;

        try {
            await createTeacherExercise({
                title: formTitle,
                type,
                prompt: formPrompt,
                is_published: true,
            });
            notifySuccess("Created", "Exercise created successfully!");
            router.push("/teacher/exercises");
        } catch (error) {
            console.error("Failed to create exercise:", error);
            notifyError("Failed", "Failed to create exercise");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Create Speaking Exercise</h1>
                <p className="text-gray-500">Add a new Speaking Part 1, 2, or 3 exercise.</p>
            </div>

            <form action={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="topic">Topic / Theme (Optional)</Label>
                            <Input
                                id="topic"
                                placeholder="e.g., Hometown, Work, Travel..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate AI
                                </>
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                        Use AI to generate a realistic title and prompt based on the selected type and optional topic.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Exercise Type</Label>
                    <div className="flex gap-2">
                        {(["speaking_part1", "speaking_part2", "speaking_part3"] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${type === t
                                    ? "bg-blue-50 border-blue-200 text-blue-700"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {t.replace("speaking_", "").replace("part", "Part ")}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        placeholder="e.g., Hometown & Childhood"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="prompt">
                        {type === "speaking_part2" ? "Cue Card Topic" : "Questions"}
                    </Label>
                    <Textarea
                        id="prompt"
                        name="prompt"
                        placeholder={type === "speaking_part2"
                            ? "Describe a place you visited..."
                            : "Do you like your hometown?\nHow often do you visit your hometown?"}
                        className="h-48"
                        required
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                        {type === "speaking_part2"
                            ? "Enter the full Cue Card topic and bullet points."
                            : "Enter the list of questions the examiner would ask."}
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading ? "Creating..." : "Create Exercise"}
                    </Button>
                </div>
            </form>

            <ErrorDetailsDialog
                open={isErrorOpen}
                onOpenChange={setIsErrorOpen}
                error={errorDetails}
            />
        </div>
    );
}
