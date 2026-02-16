"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createExercise, generateAIExercise, uploadImage } from "@/app/admin/actions";
import { Sparkles, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ErrorDetailsDialog } from "@/components/admin/error-details-dialog";
// import { ExerciseType } from "@/types"; // Might need to import this if used directly

export default function CreateWritingExercisePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [type, setType] = useState<"writing_task1" | "writing_task2">("writing_task1");

    // Controlled inputs for AI generation population
    const [title, setTitle] = useState("");
    const [prompt, setPrompt] = useState("");
    const [topic, setTopic] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

    // Error Modal State
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [isErrorOpen, setIsErrorOpen] = useState(false);

    async function handleGenerate() {
        setIsGenerating(true);
        setErrorDetails(null);
        try {
            // If topic is empty, standard generation
            const result = await generateAIExercise(type, topic || undefined);
            if (result) {
                setTitle(result.title);
                setPrompt(result.prompt);
                // @ts-ignore - refined return type needed
                if (result.image_url) {
                    // @ts-ignore
                    setGeneratedImageUrl(result.image_url);
                    setImageFile(null); // Clear manual file if new AI generation
                }
                toast.success("Content generated successfully!");
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

        // We use state for title/prompt if they were generated, or fallback to formData if user typed manually (but need to ensure sync)
        // Actually, better to rely on formData which pulls from the inputs, and the inputs are controlled by state or default value.
        // If we make them controlled, we must update state on change.

        // Let's rely on the form data, but since inputs are controlled, we need to ensure they have name attributes.
        const formTitle = formData.get("title") as string;
        const formPrompt = formData.get("prompt") as string;
        // const imageUrl = formData.get("image_url") as string; // Replaced by file upload

        try {
            let imageUrl = generatedImageUrl || undefined;

            // If user uploaded a file, it overrides the generated one
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
                is_published: true, // Default to published for now, or add checkbox
            });
            toast.success("Exercise created successfully!");
            router.push("/admin/exercises");
        } catch (error) {
            console.error("Failed to create exercise:", error);
            toast.error("Failed to create exercise");
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
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-end gap-3">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="topic">Topic / Theme (Optional)</Label>
                            <Input
                                id="topic"
                                placeholder="e.g., Environment, Education, Coffee Production..."
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
                    <p className="text-xs text-gray-500 select-none">
                        Use AI to generate a realistic title and prompt based on the selected type and optional topic.
                    </p>
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
                                <p className="text-xs font-medium text-purple-600 mb-2">AI Generated Chart:</p>
                                <img
                                    src={generatedImageUrl}
                                    alt="Generated Chart"
                                    className="max-h-64 object-contain rounded-md border"
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Input
                                id="image_file"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setImageFile(file);
                                }}
                                className="cursor-pointer"
                            />
                        </div>
                        <p className="text-xs text-gray-500 select-none">
                            {generatedImageUrl ? "Upload to replace the AI chart, or leave empty to use it." : "Upload the chart/graph image for Task 1."}
                        </p>
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
