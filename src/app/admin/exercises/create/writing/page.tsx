"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createExercise } from "@/app/admin/actions";
// import { ExerciseType } from "@/types"; // Might need to import this if used directly

export default function CreateWritingExercisePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [type, setType] = useState<"writing_task1" | "writing_task2">("writing_task1");

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);

        const title = formData.get("title") as string;
        const prompt = formData.get("prompt") as string;
        const imageUrl = formData.get("image_url") as string;

        try {
            await createExercise({
                title,
                type,
                prompt,
                image_url: type === "writing_task1" ? imageUrl : undefined,
                is_published: true, // Default to published for now, or add checkbox
            });
            router.push("/admin/exercises");
        } catch (error) {
            console.error("Failed to create exercise:", error);
            alert("Failed to create exercise");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Create Writing Exercise</h1>
                <p className="text-gray-500">Add a new Task 1 or Task 2 exercise.</p>
            </div>

            <form action={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
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
                    <Input id="title" name="title" placeholder="e.g., Bar Chart: Coffee Production" required />
                </div>

                {type === "writing_task1" && (
                    <div className="space-y-2">
                        <Label htmlFor="image_url">Chart/Graph Image URL</Label>
                        <Input id="image_url" name="image_url" placeholder="https://..." required />
                        <p className="text-xs text-gray-500">Provide a direct link to the image.</p>
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
        </div>
    );
}
