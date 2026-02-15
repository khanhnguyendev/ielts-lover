"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createExercise } from "@/app/admin/actions";

export default function CreateSpeakingExercisePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [type, setType] = useState<"speaking_part1" | "speaking_part2" | "speaking_part3">("speaking_part1");

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);

        const title = formData.get("title") as string;
        const prompt = formData.get("prompt") as string;
        // In the future, we might add audio file uploads here

        try {
            await createExercise({
                title,
                type,
                prompt,
                is_published: true,
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
                <h1 className="text-2xl font-bold">Create Speaking Exercise</h1>
                <p className="text-gray-500">Add a new Speaking Part 1, 2, or 3 exercise.</p>
            </div>

            <form action={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
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
                    <Input id="title" name="title" placeholder="e.g., Hometown & Childhood" required />
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
        </div>
    );
}
