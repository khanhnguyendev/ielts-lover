"use client";

import * as React from "react";
import { Lock, Zap, Sparkles, ChevronRight, Loader2, CheckCircle2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PulseLoader } from "@/components/global/pulse-loader";

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

    // Progress through steps on timers when unlocking
    React.useEffect(() => {
        if (!isUnlocking || !unlockingSteps?.length) {
            setCurrentStep(0);
            return;
        }

        setCurrentStep(1);
        const timers: NodeJS.Timeout[] = [];
        for (let i = 2; i <= unlockingSteps.length; i++) {
            timers.push(setTimeout(() => setCurrentStep(i), (i - 1) * 2000));
        }
        return () => timers.forEach(clearTimeout);
    }, [isUnlocking, unlockingSteps?.length]);

    return (
        <div className={cn(
            "relative group overflow-hidden rounded-[32px] border-2 border-slate-100 min-h-[300px] transition-all duration-500",
            v.bg,
            v.glow
        )}>
            {/* Blurry Preview */}
            <div className="p-8 lg:p-10 opacity-20 blur-[5px] select-none pointer-events-none grayscale transition-all duration-700 group-hover:opacity-10 group-hover:blur-[8px]">
                {children}
            </div>

            {/* Unlock CTA Overlay / Progress Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center bg-white/60 backdrop-blur-[2px]">
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

                        <Button
                            onClick={onUnlock}
                            disabled={isUnlocking}
                            className={cn(
                                "h-14 px-8 rounded-2xl text-white font-black text-sm group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg",
                                v.button
                            )}
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Zap className="w-4 h-4 mr-2 fill-white animate-pulse" />

                            {isUnlocking ? (
                                <div className="flex items-center gap-2">
                                    <PulseLoader size="sm" color="white" />
                                    <span>Unlocking...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span>Unlock Now</span>
                                    <div className="flex items-center gap-1.5 bg-white/20 ring-1 ring-white/30 px-2.5 py-1 rounded-full shadow-sm">
                                        <span className="text-[10px] leading-none">⭐</span>
                                        <span className="text-[10px] font-black tracking-tight">{cost}</span>
                                    </div>
                                </div>
                            )}

                            {!isUnlocking && <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform opacity-80" />}
                        </Button>

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
