"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
    ChevronLeft,
    Mic2,
    CheckCircle2,
    ChevronRight,
    Sparkles,
    Volume2,
    Play,
    Pause,
    Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SpeakingCalibratePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const testId = searchParams.get("test")
    const [isRecording, setIsRecording] = React.useState(false)
    const [hasRecorded, setHasRecorded] = React.useState(false)
    const [isPlaying, setIsPlaying] = React.useState(false)

    // Simulate recording progress
    React.useEffect(() => {
        let timer: NodeJS.Timeout
        if (isRecording) {
            timer = setTimeout(() => {
                setIsRecording(false)
                setHasRecorded(true)
            }, 3000)
        }
        return () => clearTimeout(timer)
    }, [isRecording])

    return (
        <div className="flex-1 min-h-[calc(100vh-64px)] bg-[#F9FAFB] flex flex-col items-center justify-center p-8 relative overflow-hidden select-none">
            {/* Background blobs for premium feel */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <Link href="/dashboard/speaking" className="absolute top-12 left-12 p-4 bg-white/50 backdrop-blur-md border border-white/20 rounded-[2rem] shadow-xl hover:shadow-primary/10 transition-all group z-20 hover:scale-105 active:scale-95">
                <ChevronLeft className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
            </Link>

            <div className="max-w-2xl w-full space-y-12 text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Horsebot Bubble Redesign */}
                <div className="flex items-center justify-center gap-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-primary/20 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="w-16 h-16 bg-white border border-white/40 rounded-2xl flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                            <span className="text-3xl">🐴</span>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] rounded-bl-none shadow-2xl relative">
                            <p className="text-base font-black font-outfit tracking-wide">Sync your neural interface below</p>
                        </div>
                        <div className="absolute top-0 left-0 -translate-x-1/2 translate-y-5 border-[12px] border-transparent border-r-slate-900" />
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-3xl rounded-[4rem] border border-white/50 p-12 lg:p-16 space-y-12 shadow-2xl shadow-slate-200/20 relative overflow-hidden">
                    {/* Glossy inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />

                    {/* Instructions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { text: "Enable Clear Mic Input", icon: Volume2, color: "text-blue-500", bg: "bg-blue-50" },
                            { text: "Part 1 Academic Inquiry", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50" },
                            { text: "4-5 Minute Duration", icon: Clock, color: "text-purple-500", bg: "bg-purple-50" },
                            { text: "Band 8.0 Logic Check", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-5 p-4 rounded-3xl bg-white/40 border border-white/50 group hover:bg-white/80 transition-all duration-300">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300", item.bg, item.color)}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <p className="text-xs font-black text-slate-500 group-hover:text-slate-900 uppercase tracking-widest text-left leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Mic Check Area - High Density Design */}
                    <div className={cn(
                        "rounded-[3rem] p-12 space-y-10 border transition-all duration-700 relative overflow-hidden group",
                        isRecording
                            ? "bg-rose-50/50 border-rose-200 shadow-2xl shadow-rose-200/20"
                            : hasRecorded
                                ? "bg-emerald-50/50 border-emerald-200 shadow-2xl shadow-emerald-200/20"
                                : "bg-white/40 border-white/60 shadow-xl"
                    )}>
                        <div className="flex flex-col items-center gap-6 relative z-10">
                            <div className={cn(
                                "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-700",
                                isRecording ? "bg-rose-500 text-white scale-110" : hasRecorded ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"
                            )}>
                                {isRecording ? <Mic2 className="h-8 w-8 animate-pulse" /> : hasRecorded ? <CheckCircle2 className="h-8 w-8" /> : <Mic2 className="h-8 w-8" />}
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="text-2xl font-black font-outfit text-slate-900">Audio Calibration</h3>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                                    {isRecording ? "Neural sync in progress..." : hasRecorded ? "Audio verify complete" : "Record a sample to initialize AI"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-8 relative z-10 w-full px-4">
                            {!hasRecorded ? (
                                <Button
                                    onClick={() => setIsRecording(true)}
                                    disabled={isRecording}
                                    className={cn(
                                        "h-20 w-full rounded-[2.5rem] font-black text-base shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4",
                                        isRecording
                                            ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
                                            : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
                                    )}
                                >
                                    <Mic2 className={cn("h-6 w-6", isRecording && "animate-pulse")} />
                                    {isRecording ? "SAMPLING AUDIO..." : "START CALIBRATION"}
                                </Button>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <Button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        variant="white"
                                        className="h-16 flex-1 rounded-[2rem] bg-white/80 border border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-black text-sm shadow-xl flex items-center justify-center gap-3 transition-all"
                                    >
                                        {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                                        {isPlaying ? "VERIFYING..." : "PLAYBACK"}
                                    </Button>
                                    <Button
                                        onClick={() => { setHasRecorded(false); setIsRecording(false); }}
                                        variant="ghost"
                                        className="h-16 px-8 rounded-[2rem] text-slate-400 hover:text-slate-600 font-black text-[10px] uppercase tracking-widest"
                                    >
                                        RE-SAMPLE
                                    </Button>
                                </div>
                            )}

                            {isRecording && (
                                <div className="flex items-center gap-3 h-16 w-full justify-center px-6">
                                    {Array.from({ length: 32 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1.5 bg-rose-500/60 rounded-full animate-wave"
                                            style={{
                                                height: `${40 + Math.random() * 60}%`,
                                                animationDelay: `${i * 0.05}s`
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={() => router.push(`/dashboard/speaking/${testId || 'part-1'}`)}
                        className={cn(
                            "w-full h-20 rounded-[2.5rem] font-black text-base transition-all duration-700 shadow-2xl flex items-center justify-center gap-4 group/continue",
                            hasRecorded
                                ? "bg-primary hover:bg-primary/95 text-white shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                                : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200"
                        )}
                        disabled={!hasRecorded}
                    >
                        INITIALIZE PRACTICE
                        <ChevronRight className="h-6 w-6 group-hover/continue:translate-x-2 transition-transform" />
                    </Button>
                </div>
            </div>
        </div >
    )
}

