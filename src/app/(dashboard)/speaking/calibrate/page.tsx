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
    Volume2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SpeakingCalibratePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const testId = searchParams.get("test")
    const [step, setStep] = React.useState(1)
    const [isRecording, setIsRecording] = React.useState(false)

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#F9FAFB] flex flex-col items-center justify-center p-8 -m-8 lg:-m-12">
            <Link href="/dashboard/speaking" className="absolute top-12 left-12 p-3 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all">
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </Link>

            <div className="max-w-2xl w-full space-y-8 text-center">
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm relative overflow-hidden">
                            <span className="text-2xl z-10">🐱</span>
                            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                        </div>
                        <div className="bg-[#7C3AED] text-white px-6 py-3 rounded-2xl rounded-bl-none shadow-xl shadow-primary/20 relative">
                            <p className="text-sm font-bold">Please read the instructions before you continue</p>
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#7C3AED] rotate-45" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border p-12 space-y-10 shadow-sm transition-all duration-500">
                    <div className="space-y-6 text-left">
                        {[
                            "Ensure your microphone is enabled",
                            "You will be asked questions about familiar topics",
                            "It will take about 4-5 minutes to complete"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                                <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">{text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-primary/5 rounded-[32px] p-10 space-y-8 border border-primary/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                            <Mic2 className="h-20 w-20 text-primary" />
                        </div>

                        <div className="flex items-start gap-6 relative z-10">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-muted-foreground/5 text-sm font-black text-muted-foreground/20">
                                1
                            </div>
                            <div className="space-y-1 text-left">
                                <h3 className="text-lg font-black font-outfit">Quick Mic Check!</h3>
                                <p className="text-sm text-muted-foreground font-medium">Record a short message to ensure your audio is clear.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                            <Button
                                onClick={() => setIsRecording(!isRecording)}
                                className={cn(
                                    "h-14 px-8 rounded-2xl font-black text-sm shadow-xl transition-all",
                                    isRecording
                                        ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 animate-pulse"
                                        : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                                )}
                            >
                                <Mic2 className="mr-2 h-5 w-5" />
                                {isRecording ? "Stop Recording" : "Test Mic"}
                            </Button>

                            {isRecording && (
                                <div className="flex-1 flex items-center gap-1.5 h-8">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 bg-primary/20 rounded-full"
                                            style={{
                                                height: `${Math.random() * 100}%`,
                                                transition: 'height 0.1s ease-in-out'
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        disabled={isRecording}
                        onClick={() => router.push(`/dashboard/speaking/${testId || 'part-1'}`)}
                        className="w-full h-16 rounded-[24px] bg-[#E5E7EB] hover:bg-primary hover:text-white text-muted-foreground/60 font-black text-sm transition-all shadow-lg hover:shadow-primary/20"
                    >
                        Continue
                        <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
