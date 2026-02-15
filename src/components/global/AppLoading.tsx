"use client"

import React from "react"
import { BookOpen } from "lucide-react"

export function AppLoading() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-heart-pulse" />

                {/* Heart/Book Icon Container */}
                <div className="relative bg-white p-6 rounded-[2rem] shadow-2xl shadow-primary/10 border border-primary/5 animate-heart-pulse">
                    <div className="relative">
                        <BookOpen className="h-12 w-12 text-primary stroke-[2.5]" />
                        {/* Subtle heart accent */}
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                            <span className="text-[8px] text-white">❤️</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Branding */}
            <div className="mt-8 flex flex-col items-center animate-logo-fade">
                <span className="text-2xl font-black font-outfit text-slate-900 tracking-tight uppercase">
                    IELTS <span className="text-primary">Lover</span>
                </span>
                <div className="flex items-center gap-2 mt-1">
                    <div className="h-[2px] w-4 bg-primary/30 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase">
                        The Beat of Learning
                    </span>
                    <div className="h-[2px] w-4 bg-primary/30 rounded-full" />
                </div>
            </div>

            {/* Loading dots */}
            <div className="mt-6 flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
            </div>
        </div>
    )
}
