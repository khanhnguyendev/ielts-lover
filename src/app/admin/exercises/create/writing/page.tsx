"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createExercise, generateAIExercise, uploadImage } from "@/app/admin/actions";
import { Sparkles, Loader2 } from "lucide-react";
import { useNotification } from "@/lib/contexts/notification-context";
import { ErrorDetailsDialog } from "@/components/admin/error-details-dialog";

export default function CreateWritingExercisePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [type, setType] = useState<"writing_task1" | "writing_task2">("writing_task1");

    // Controlled inputs for AI generation population
    const [title, setTitle] = useState("");
    const [prompt, setPrompt] = useState("");
    const [topic, setTopic] = useState("");
    const [chartType, setChartType] = useState("auto");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

    // Error Modal State
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const { notifySuccess, notifyError } = useNotification();

    async function handleGenerate() {
        setIsGenerating(true);
        setErrorDetails(null);
        try {
            const result = await generateAIExercise(type, topic || undefined, chartType);
            if (result) {
                setTitle(result.title);
                setPrompt(result.prompt);
                if ('image_url' in result && result.image_url) {
                    setGeneratedImageUrl(result.image_url as string);
                    setImageFile(null);
                }
                notifySuccess(
                    "Content Generated",
                    "AI has successfully generated a title, prompt, and chart for your new exercise. You can now review and publish it.",
                    "Review Content"
                );
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
            let imageUrl = generatedImageUrl || undefined;

            if (type === "writing_task1" && imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", imageFile);
                imageUrl = await uploadImage(uploadFormData);
            }

            await createExercise({
                title: formTitle,
                type,
                prompt: formPrompt,
                image_url: type === "writing_task1" ? imageUrl : undefined,
                is_published: true,
            });
            notifySuccess(
                "Exercise Published",
                "The exercise has been created and is now available for students in the Writing Hub.",
                "Back to List"
            );
            router.push("/admin/exercises");
        } catch (error) {
            console.error("Failed to create exercise:", error);
            notifyError(
                "Creation Failed",
                "We couldn't save the exercise. Please ensure all fields are filled correctly and try again.",
                "Close"
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="select-none">
                <h1 className="text-2xl font-bold">Create Writing Exercise</h1>
                <p className="text-gray-500">Add a new Task 1 or Task 2 exercise.</p>
            </div>

            <form action={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
                <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            AI Content Assistant
                        </h3>
                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Auto-Generate</span>
                    </div>

                    <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="topic" className="text-purple-900">Topic / Theme (Optional)</Label>
                            <Input
                                id="topic"
                                className="bg-white border-purple-200 focus-visible:ring-purple-500"
                                placeholder="e.g., Environment, Education, Coffee Production..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>
                        {type === "writing_task1" && (
                            <div className="space-y-2 w-[180px]">
                                <Label htmlFor="chartType" className="text-purple-900">Chart Type</Label>
                                <select
                                    id="chartType"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-purple-200 bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-background"
                                    value={chartType}
                                    onChange={(e) => setChartType(e.target.value)}
                                >
                                    <option value="auto">Auto (AI Decision)</option>
                                    <option value="bar">Bar Chart</option>
                                    <option value="line">Line Graph</option>
                                    <option value="pie">Pie Chart</option>
                                    <option value="doughnut">Doughnut Chart</option>
                                </select>
                            </div>
                        )}
                        <Button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-purple-600 hover:bg-purple-700 text-white min-w-[140px] shadow-sm"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Exercise Type</Label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setType("writing_task1")}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium ${type === "writing_task1"
                                ? "bg-purple-50 border-purple-200 text-purple-700"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            Writing Task 1
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("writing_task2")}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium ${type === "writing_task2"
                                ? "bg-purple-50 border-purple-200 text-purple-700"
                                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            Writing Task 2
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        placeholder="e.g., Bar Chart: Coffee Production"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {type === "writing_task1" && (
                    <div className="space-y-2">
                        <Label htmlFor="image_file">Chart/Graph Image</Label>
                        {generatedImageUrl && !imageFile && (
                            <div className="mb-4 p-2 border rounded-lg bg-gray-50">
                                <img
                                    src={generatedImageUrl}
                                    alt="Generated Chart"
                                    className="max-h-64 object-contain rounded-md border"
                                />
                            </div>
                        )}
                        <Input
                            id="image_file"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setImageFile(file);
                            }}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt / Question</Label>
                    <Textarea
                        id="prompt"
                        name="prompt"
                        placeholder="Enter the full question prompt here..."
                        className="h-32"
                        required
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
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
