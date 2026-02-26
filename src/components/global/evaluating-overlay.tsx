import * as React from "react"
import { Brain, CheckCircle2, Loader2, FileCheck, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface EvaluatingOverlayProps {
    isVisible: boolean;
    step?: number;
}

export function EvaluatingOverlay({ isVisible, step = 1 }: EvaluatingOverlayProps) {
    const [showSlowMessage, setShowSlowMessage] = React.useState(false);

    React.useEffect(() => {
        if (!isVisible) {
            setShowSlowMessage(false);
            return;
        }

        const timer = setTimeout(() => {
            setShowSlowMessage(true);
        }, 10000);

        return () => clearTimeout(timer);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-8 max-w-sm text-center w-full px-4">
                {/* Animated icon */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center">
                        <Brain className="w-12 h-12 text-indigo-600 animate-pulse" />
                    </div>
                    <div className="absolute -inset-2 rounded-[2.5rem] border-2 border-indigo-100 animate-ping" style={{ animationDuration: "2s" }} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-black font-outfit text-slate-900">AI Evaluating...</h3>
                    <p className="text-sm text-slate-400 font-medium">
                        Analyzing your response across all IELTS criteria
                    </p>
                </div>

                {/* Progress steps */}
                <div className="w-full space-y-3">
                    {[
                        { icon: FileCheck, label: "Submitting your response", step: 1 },
                        { icon: Brain, label: "Analyzing content & structure", step: 2 },
                        { icon: BarChart3, label: "Scoring band descriptors", step: 3 },
                    ].map(({ icon: StepIcon, label, step: itemStep }) => (
                        <div
                            key={itemStep}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-500",
                                step >= itemStep
                                    ? "bg-indigo-50 text-slate-900"
                                    : "text-slate-300"
                            )}
                        >
                            {step > itemStep ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            ) : step === itemStep ? (
                                <Loader2 className="h-5 w-5 text-indigo-600 animate-spin shrink-0" />
                            ) : (
                                <StepIcon className="h-5 w-5 shrink-0" />
                            )}
                            <span className="text-sm font-bold">{label}</span>
                        </div>
                    ))}
                </div>

                {showSlowMessage && (
                    <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <p className="text-[12px] text-slate-500 font-medium italic bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm inline-flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                            AI is taking a bit longer than usual. Please hold on...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
