"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createExercise, generateAIExercise, uploadImage, analyzeChartImage } from "@/app/admin/actions";
import { getFeaturePrice, getExerciseById } from "@/app/actions";
import { Sparkles, Loader2, CheckCircle2, XCircle, ImageIcon } from "lucide-react";
import { useNotification } from "@/lib/contexts/notification-context";
import { ErrorDetailsDialog } from "@/components/admin/error-details-dialog";
import { CHART_TYPES, FEATURE_KEYS } from "@/lib/constants";
import { CreditBadge } from "@/components/ui/credit-badge";

export default function CreateWritingExercisePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="animate-spin" /></div>}>
            <CreateWritingExerciseContent />
        </Suspense>
    );
}

function CreateWritingExerciseContent() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [type, setType] = useState<"writing_task1" | "writing_task2">("writing_task1");
    const searchParams = useSearchParams();

    // Controlled inputs for AI generation population
    const [title, setTitle] = useState("");
    const [prompt, setPrompt] = useState("");
    const [topic, setTopic] = useState("");
    const [chartType, setChartType] = useState("auto");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [chartData, setChartData] = useState<any>(null);
    const [chartDescription, setChartDescription] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [imageAnalysis, setImageAnalysis] = useState<{
        is_valid: boolean;
        chart_type: string;
        title: string;
        description: string;
        data_points: any;
        validation_errors: string[];
    } | null>(null);

    // Error Modal State
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const { notifySuccess, notifyError } = useNotification();

    const CHART_TYPE_LABELS: Record<string, string> = {
        [CHART_TYPES.LINE_GRAPH]: "📈 Line Graph",
        [CHART_TYPES.BAR_CHART]: "📊 Bar Chart",
        [CHART_TYPES.PIE_CHART]: "🥧 Pie Chart",
        [CHART_TYPES.TABLE]: "📋 Table",
        [CHART_TYPES.PROCESS_DIAGRAM]: "🔄 Process Diagram",
        [CHART_TYPES.MAP]: "🗺️ Map",
        [CHART_TYPES.MIXED_CHART]: "📉 Mixed Chart",
    };

    const [analysisCost, setAnalysisCost] = useState(5);

    // Load defaults and handle duplication
    useEffect(() => {
        getFeaturePrice(FEATURE_KEYS.CHART_IMAGE_ANALYSIS).then(setAnalysisCost);

        const duplicateId = searchParams.get("duplicate");
        if (duplicateId) {
            getExerciseById(duplicateId).then(ex => {
                if (ex) {
                    setTitle(ex.title);
                    setPrompt(ex.prompt);
                    setType(ex.type as "writing_task1" | "writing_task2");
                    if (ex.image_url) setGeneratedImageUrl(ex.image_url);
                    if (ex.chart_data) setChartData(ex.chart_data);
                    notifySuccess("Exercise Data Loaded", "You are creating a new version of an existing exercise.", "Continue");
                }
            });
        }
    }, [searchParams]);

    async function handleAnalyzeImage() {
        if (!imageFile) return;
        setIsAnalyzing(true);
        setImageAnalysis(null);
        try {
            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(",")[1]);
                };
                reader.readAsDataURL(imageFile);
            });
            const analysis = await analyzeChartImage(base64, imageFile.type);
            if (analysis.success && analysis.data) {
                setImageAnalysis(analysis.data);
                window.dispatchEvent(new CustomEvent('credit-change', { detail: { amount: -analysisCost } }));
                if (analysis.data.is_valid && analysis.data.title && !title) {
                    setTitle(analysis.data.title);
                }
            } else if (analysis.error === "INSUFFICIENT_CREDITS") {
                notifyError("Insufficient Credits", "You need more StarCredits to analyze this image. Please top up to continue.", "Close");
            }
        } catch (err) {
            console.error("Image analysis failed:", err);
            notifyError("Analysis Failed", "Could not analyze the uploaded image. Please try again.", "Close");
        } finally {
            setIsAnalyzing(false);
        }
    }

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
                if ('chart_data' in result && result.chart_data) {
                    setChartData(result.chart_data);
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
            // Block save if image analysis failed validation
            if (type === "writing_task1" && imageFile && imageAnalysis && !imageAnalysis.is_valid) {
                notifyError("Invalid Chart Image", "The uploaded image failed validation. Please upload a valid IELTS chart/graph.", "Close");
                setIsLoading(false);
                return;
            }

            let imageUrl = generatedImageUrl || undefined;

            if (type === "writing_task1" && imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append("file", imageFile);
                imageUrl = await uploadImage(uploadFormData);
            }

            // Use analysis data for uploaded images, chartData for AI-generated
            const finalChartData = type === "writing_task1"
                ? (chartData || (imageAnalysis?.is_valid ? imageAnalysis.data_points : null) || (chartDescription ? { description: chartDescription } : undefined))
                : undefined;

            await createExercise({
                title: formTitle,
                type,
                prompt: formPrompt,
                image_url: type === "writing_task1" ? imageUrl : undefined,
                chart_data: finalChartData,
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
                                    {Object.values(CHART_TYPES).map((ct) => (
                                        <option key={ct} value={ct}>
                                            {CHART_TYPE_LABELS[ct] || ct}
                                        </option>
                                    ))}
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
                                if (file) {
                                    setImageFile(file);
                                    setImageAnalysis(null);
                                    setChartData(null);
                                    setGeneratedImageUrl(null);
                                }
                            }}
                        />
                        {imageFile && !imageAnalysis && !isAnalyzing && (
                            <Button
                                type="button"
                                onClick={handleAnalyzeImage}
                                disabled={isAnalyzing}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            >
                                <ImageIcon className="h-4 w-4" />
                                Analyze Image
                                <CreditBadge amount={-analysisCost} size="sm" />
                            </Button>
                        )}
                        {isAnalyzing && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-700 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="font-medium">Analyzing image with AI Vision...</span>
                            </div>
                        )}
                        {imageAnalysis && (
                            <div className={`p-4 rounded-lg border space-y-3 ${imageAnalysis.is_valid
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-rose-50 border-rose-200"
                                }`}>
                                <div className="flex items-center gap-2">
                                    {imageAnalysis.is_valid ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-rose-600" />
                                    )}
                                    <span className={`font-bold text-sm ${imageAnalysis.is_valid ? "text-emerald-800" : "text-rose-800"}`}>
                                        {imageAnalysis.is_valid ? "Valid IELTS Chart Detected" : "Invalid Image"}
                                    </span>
                                    {imageAnalysis.is_valid && (
                                        <span className="ml-auto text-xs font-medium bg-white px-2 py-0.5 rounded-full border">
                                            {CHART_TYPE_LABELS[imageAnalysis.chart_type] || imageAnalysis.chart_type}
                                        </span>
                                    )}
                                </div>
                                {imageAnalysis.is_valid ? (
                                    <>
                                        <p className="text-xs text-emerald-700">{imageAnalysis.description}</p>
                                        <pre className="text-[11px] bg-white/80 p-3 rounded-lg border border-emerald-100 overflow-x-auto max-h-32 text-slate-600">
                                            {JSON.stringify(imageAnalysis.data_points, null, 2)}
                                        </pre>
                                    </>
                                ) : (
                                    <div className="space-y-1">
                                        {imageAnalysis.validation_errors.map((err, i) => (
                                            <p key={i} className="text-xs text-rose-700">• {err}</p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {type === "writing_task1" && (
                    <div className="space-y-2">
                        <Label htmlFor="chart_description">Chart Data Description</Label>
                        <p className="text-xs text-muted-foreground">
                            {chartData
                                ? "✅ Chart data auto-captured from AI generation. You can override below."
                                : "Describe the key data points in the chart/graph (e.g., values, categories, trends). This helps AI evaluate student responses accurately."
                            }
                        </p>
                        {chartData && (
                            <pre className="text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto max-h-32 text-slate-600">
                                {JSON.stringify(chartData, null, 2)}
                            </pre>
                        )}
                        {!chartData && (
                            <Textarea
                                id="chart_description"
                                placeholder="e.g., Bar chart: Coffee production (tonnes) — Brazil: 2.5M, Vietnam: 1.8M, Colombia: 0.8M (2010-2020)"
                                className="h-24"
                                value={chartDescription}
                                onChange={(e) => setChartDescription(e.target.value)}
                            />
                        )}
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
                    <Button
                        type="submit"
                        disabled={isLoading || (type === "writing_task1" && !!imageFile && (!imageAnalysis || !imageAnalysis.is_valid))}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
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
