"use client";

import * as React from "react";
import { Lock, Zap, Sparkles, ChevronRight, Loader2, CheckCircle2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PulseLoader } from "@/components/global/pulse-loader";
import { AIActionButton } from "@/components/global/ai-action-button";

export interface UnlockingStep {
    icon: LucideIcon;
    label: string;
}

interface PremiumFeatureCardProps {
    title: string;
    description: string;
    cost: number;
    onUnlock: () => void;
    isUnlocking?: boolean;
    variant?: "primary" | "amber" | "indigo";
    footerText?: string;
    children: React.ReactNode;
    unlockingTitle?: string;
    unlockingDescription?: string;
    unlockingSteps?: UnlockingStep[];
}

const VARIANTS = {
    primary: {
        bg: "bg-white",
        iconBg: "bg-white",
        iconBorder: "border-slate-100",
        iconColor: "text-slate-300",
        button: "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-primary/30",
        glow: "shadow-xl shadow-slate-200/50",
    },
    amber: {
        bg: "bg-white",
        iconBg: "bg-amber-50",
        iconBorder: "border-amber-100",
        iconColor: "text-amber-600",
        button: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
        glow: "shadow-xl shadow-amber-100/30",
    },
    indigo: {
        bg: "bg-white",
        iconBg: "bg-indigo-50",
        iconBorder: "border-indigo-100",
        iconColor: "text-indigo-600",
        button: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20",
        glow: "shadow-xl shadow-indigo-100/30",
    },
};

export function PremiumFeatureCard({
    title,
    description,
    cost,
    onUnlock,
    isUnlocking = false,
    variant = "primary",
    footerText = "AI-Powered Analysis",
    children,
    unlockingTitle = "AI Processing...",
    unlockingDescription = "Generating your personalized content",
    unlockingSteps,
}: PremiumFeatureCardProps) {
    const v = VARIANTS[variant];
    const [currentStep, setCurrentStep] = React.useState(0);
    const [showSlowMessage, setShowSlowMessage] = React.useState(false);

    // Progress through steps on timers when unlocking
    React.useEffect(() => {
        if (!isUnlocking || !unlockingSteps?.length) {
            setCurrentStep(0);
            setShowSlowMessage(false);
            return;
        }

        setCurrentStep(1);
        const timers: NodeJS.Timeout[] = [];
        for (let i = 2; i <= unlockingSteps.length; i++) {
            timers.push(setTimeout(() => setCurrentStep(i), (i - 1) * 2000));
        }

        // Show slow message after 10 seconds
        timers.push(setTimeout(() => setShowSlowMessage(true), 10000));

        return () => timers.forEach(clearTimeout);
    }, [isUnlocking, unlockingSteps?.length]);

    return (
        <div className={cn(
            "relative group overflow-hidden rounded-[32px] border-2 border-slate-100 min-h-[400px] transition-all duration-500 flex flex-col justify-center",
            v.bg,
            v.glow
        )}>
            {/* Blurry Preview */}
            <div className="p-8 lg:p-10 opacity-20 blur-[5px] select-none pointer-events-none grayscale transition-all duration-700 group-hover:opacity-10 group-hover:blur-[8px]">
                {children}
            </div>

            {/* Unlock CTA Overlay / Progress Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center py-12 px-8 text-center bg-white/60 backdrop-blur-[2px]">
                {isUnlocking && unlockingSteps?.length ? (
                    /* Progress Steps Overlay */
                    <div className="flex flex-col items-center gap-6 max-w-xs animate-in fade-in duration-300">
                        <div className="relative">
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center",
                                variant === "amber" ? "bg-amber-50" : variant === "indigo" ? "bg-indigo-50" : "bg-primary/5"
                            )}>
                                <Sparkles className={cn(
                                    "w-8 h-8 animate-pulse",
                                    variant === "amber" ? "text-amber-500" : variant === "indigo" ? "text-indigo-500" : "text-primary"
                                )} />
                            </div>
                            <div className={cn(
                                "absolute -inset-1.5 rounded-[1.25rem] border-2 animate-ping",
                                variant === "amber" ? "border-amber-200/50" : variant === "indigo" ? "border-indigo-200/50" : "border-primary/10"
                            )} style={{ animationDuration: "2s" }} />
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-base font-black text-slate-900 font-outfit">{unlockingTitle}</h4>
                            <p className="text-[11px] text-slate-400 font-medium">{unlockingDescription}</p>
                        </div>

                        <div className="w-full space-y-2">
                            {unlockingSteps.map(({ icon: StepIcon, label }, idx) => {
                                const step = idx + 1;
                                return (
                                    <div
                                        key={step}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500",
                                            currentStep >= step
                                                ? "bg-slate-50 text-slate-900"
                                                : "text-slate-300"
                                        )}
                                    >
                                        {currentStep > step ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                        ) : currentStep === step ? (
                                            <Loader2 className={cn(
                                                "h-4 w-4 animate-spin shrink-0",
                                                variant === "amber" ? "text-amber-500" : variant === "indigo" ? "text-indigo-500" : "text-primary"
                                            )} />
                                        ) : (
                                            <StepIcon className="h-4 w-4 shrink-0" />
                                        )}
                                        <span className="text-xs font-bold">{label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {showSlowMessage && (
                            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <p className="text-[10px] text-slate-500 font-medium italic bg-white/80 px-4 py-2 rounded-full border border-slate-100 shadow-sm inline-flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                                    AI is taking a bit longer than usual. Please hold on...
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Default Unlock CTA */
                    <>
                        <div className={cn(
                            "w-14 h-14 rounded-2xl border-2 shadow-lg flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                            v.iconBg,
                            v.iconBorder
                        )}>
                            <Lock className={cn("w-6 h-6", v.iconColor)} />
                        </div>

                        <h4 className="text-lg font-black text-slate-900 font-outfit mb-2 leading-tight tracking-tight">
                            {title}
                        </h4>

                        <p className="text-[12px] text-slate-500 font-medium max-w-[280px] mb-8 leading-relaxed">
                            {description}
                        </p>

                        <AIActionButton
                            label={isUnlocking ? "Unlocking..." : "Unlock Now"}
                            icon={Zap}
                            onClick={onUnlock}
                            isLoading={isUnlocking}
                            badge={cost.toString()}
                            showChevron={!isUnlocking}
                            className="h-14 w-full px-8 rounded-2xl"
                        />

                        <p className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Sparkles className="w-3 h-3" />
                            {footerText}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
