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
    Pause
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
        <div className="min-h-[calc(100vh-64px)] bg-[#F9FAFB] flex flex-col items-center justify-center p-8 -m-8 lg:-m-12 relative overflow-hidden">
            {/* Background blobs for premium feel */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <Link href="/dashboard/speaking" className="absolute top-12 left-12 p-3 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all group z-20">
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>

            <div className="max-w-2xl w-full space-y-10 text-center relative z-10">
                {/* Horsebot Bubble */}
                <div className="flex items-center justify-center gap-4">
                    <div className="w-14 h-14 bg-white border-2 border-primary/10 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/5 transition-transform hover:scale-110">
                        <span className="text-3xl">🐴</span>
                    </div>
                    <div className="bg-[#7C3AED] text-white px-8 py-4 rounded-[28px] rounded-bl-none shadow-2xl shadow-primary/20 relative animate-in fade-in slide-in-from-left-4 duration-500">
                        <p className="text-sm font-black font-outfit tracking-wide">Please read the instructions before you continue</p>
                        <div className="absolute top-0 left-0 -translate-x-1/2 translate-y-4 border-[10px] border-transparent border-r-[#7C3AED]" />
                    </div>
                </div>

                <div className="bg-white rounded-[48px] border p-12 space-y-10 shadow-2xl shadow-primary/5 border-primary/5">
                    {/* Instructions */}
                    <div className="space-y-6 max-w-md mx-auto">
                        {[
                            { text: "Ensure your microphone is enabled", icon: Volume2 },
                            { text: "You will be asked questions about familiar topics", icon: Sparkles },
                            { text: "It will take about 4-5 minutes to complete", icon: ChevronRight }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-6 group">
                                <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] border flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <p className="text-sm font-bold text-muted-foreground group-hover:text-slate-900 transition-colors text-left flex-1">{item.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Mic Check Area */}
                    <div className={cn(
                        "rounded-[40px] p-10 space-y-8 border-2 transition-all duration-500 relative overflow-hidden group",
                        isRecording ? "bg-rose-50 border-rose-100" : hasRecorded ? "bg-emerald-50 border-emerald-100" : "bg-[#F9FAFB] border-slate-100"
                    )}>
                        <div className="flex items-start gap-6 relative z-10">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl text-lg font-black transition-all duration-500",
                                isRecording ? "bg-rose-500 text-white" : hasRecorded ? "bg-emerald-500 text-white" : "bg-white text-slate-500 border border-slate-100"
                            )}>
                                {hasRecorded ? <CheckCircle2 className="h-6 w-6" /> : "1"}
                            </div>
                            <div className="space-y-1 text-left">
                                <h3 className="text-xl font-black font-outfit text-slate-900">Quick Mic Check!</h3>
                                <p className="text-sm text-slate-500 font-bold">Record a short message to ensure your audio is clear.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 relative z-10">
                            {!hasRecorded ? (
                                <Button
                                    onClick={() => setIsRecording(true)}
                                    disabled={isRecording}
                                    className={cn(
                                        "h-16 px-10 rounded-[20px] font-black text-sm shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3",
                                        isRecording
                                            ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
                                            : "bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-blue-500/30"
                                    )}
                                >
                                    <Mic2 className={cn("h-5 w-5", isRecording && "animate-pulse")} />
                                    {isRecording ? "Recording..." : "Test Mic"}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    variant="outline"
                                    className="h-16 px-10 rounded-[24px] bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 font-black text-sm shadow-xl shadow-emerald-500/5 flex items-center gap-3 transition-all"
                                >
                                    {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                                    {isPlaying ? "Playing..." : "Play Recording"}
                                </Button>
                            )}

                            {isRecording && (
                                <div className="flex-1 flex items-center gap-2 h-10">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 bg-rose-500/40 rounded-full animate-wave"
                                            style={{
                                                height: `${30 + Math.random() * 70}%`,
                                                animationDelay: `${i * 0.1}s`
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {hasRecorded && !isRecording && !isPlaying && (
                                <div className="flex-1 text-left flex items-center gap-3 animate-in fade-in zoom-in duration-500">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Volume2 className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Audio capture sound good!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        onClick={() => router.push(`/dashboard/speaking/${testId || 'part-1'}`)}
                        className={cn(
                            "w-full h-18 rounded-[32px] font-black text-sm transition-all shadow-2xl flex items-center justify-center gap-3",
                            hasRecorded
                                ? "bg-indigo-900 hover:bg-indigo-950 text-white shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98]"
                                : "bg-slate-100 text-slate-600 cursor-not-allowed"
                        )}
                        disabled={!hasRecorded}
                    >
                        Continue
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

