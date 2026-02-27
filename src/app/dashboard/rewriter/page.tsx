"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Sparkles,
    RefreshCw,
    Languages,
    FileText,
    Zap,
    Cpu,
    ArrowRight,
    Clipboard,
    Flame,
    Ghost,
    Target,
    Eraser,
    Mic2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { AIActionButton } from "@/components/global/ai-action-button"

export default function RewriterPage() {
    const [input, setInput] = React.useState("")
    const [output, setOutput] = React.useState("")
    const [isProcessing, setIsProcessing] = React.useState(false)
    const [style, setStyle] = React.useState("Formal")

    const handleRewrite = () => {
        if (!input.trim()) return
        setIsProcessing(true)
        // Simulate AI Processing
        setTimeout(() => {
            const simulatedOutput = `[${style} Version]: \n\n${input.split(' ').reverse().join(' ')}... (Neural Synthesis Incomplete - Laboratory Mode Only)`
            setOutput(simulatedOutput)
            setIsProcessing(false)
        }, 2000)
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20 dark:bg-slate-950/20">
            <div className="p-6 lg:p-12 space-y-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-4">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <div className="p-4 bg-primary rounded-[1.5rem] text-white shadow-2xl relative">
                                <Languages size={28} />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-slate-900 rounded-full animate-ping" />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">IELTS Rewriter</h1>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1">Vocabulary Enhancement & Paraphrasing Lab</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-3 bg-amber-500/10 dark:bg-amber-400/5 backdrop-blur-xl rounded-2xl border border-amber-500/20 shadow-xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center">
                            <Zap size={20} className="fill-current" />
                        </div>
                        <div className="text-left">
                            <p className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Neural Mode</p>
                            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase">Experimental Lab Access</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Input Area */}
                    <div className="lg:col-span-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-4 lg:p-10 border border-white/20 dark:border-slate-800/50 shadow-2xl"
                        >
                            <div className="flex flex-col md:flex-row gap-10">
                                {/* Left Side: Controls & Input */}
                                <div className="flex-1 space-y-8">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Source Fragment</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {["Formal", "Creative", "Concise"].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => setStyle(s)}
                                                    className={cn(
                                                        "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500",
                                                        style === s
                                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                                            : "text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                                        <Textarea
                                            placeholder="Paste your sentence or paragraph here to see the neural rewriter in action..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            className="min-h-[300px] lg:min-h-[400px] bg-slate-50/50 dark:bg-slate-950/50 border-none rounded-[2rem] p-10 font-bold text-slate-900 dark:text-white focus:ring-0 transition-all resize-none no-scrollbar text-lg placeholder:text-slate-300 dark:placeholder:text-slate-700 outline-none leading-relaxed"
                                        />
                                        <div className="absolute bottom-8 right-8 flex gap-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setInput("")}
                                                className="rounded-xl px-4 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
                                            >
                                                <Eraser size={14} className="mr-2" /> Clear
                                            </Button>
                                            <AIActionButton
                                                label="Neural Rewrite"
                                                icon={Sparkles}
                                                onClick={handleRewrite}
                                                isLoading={isProcessing}
                                                disabled={!input.trim()}
                                                className="h-14 flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Insights (Desktop Only) */}
                                <div className="hidden lg:flex w-72 flex-col gap-6">
                                    <div className="p-8 bg-slate-50 dark:bg-slate-950/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-8 flex-1">
                                        <div className="space-y-1">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rewriter Protocols</h4>
                                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Active Parameters</p>
                                        </div>

                                        <div className="space-y-6">
                                            <ProtocolItem icon={Target} color="bg-primary/10 text-primary" label="Accuracy" value="98.2%" />
                                            <ProtocolItem icon={Flame} color="bg-rose-500/10 text-rose-500" label="Creativity" value="Low-Flow" />
                                            <ProtocolItem icon={Cpu} color="bg-indigo-500/10 text-indigo-500" label="Model" value="GPT-4X" />
                                        </div>

                                        <div className="pt-10 mt-auto border-t border-slate-200/50 dark:border-slate-800/50">
                                            <div className="flex items-center gap-3 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">
                                                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                                                    <Mic2 size={18} />
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Neural Voice <br />Enabled</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Output Area (Conditional) */}
                    <AnimatePresence>
                        {output && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="lg:col-span-12"
                            >
                                <div className="bg-primary/5 dark:bg-primary/10 backdrop-blur-3xl rounded-[3rem] p-10 border border-primary/20 shadow-2xl space-y-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                                        <Sparkles size={160} className="text-primary" />
                                    </div>

                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl">
                                                <Cpu size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black font-outfit text-slate-900 dark:text-white tracking-tight">Neural Synthesis Result</h4>
                                                <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">Refined & Validated</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="h-11 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest border-primary/20 hover:border-primary hover:text-primary bg-white/50 dark:bg-slate-900/50 backdrop-blur-md transition-all group/copy"
                                        >
                                            <Clipboard size={14} className="mr-2 group-hover/copy:scale-110" /> Copy Synthesis
                                        </Button>
                                    </div>

                                    <div className="relative z-10 p-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-[2rem] border border-white/30 dark:border-slate-800/50 shadow-inner">
                                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic">
                                            {output.split('\n\n')[1]}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 justify-center pt-4 relative z-10">
                                        <div className="h-px flex-1 bg-primary/10" />
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">End of Transmission</span>
                                        <div className="h-px flex-1 bg-primary/10" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Coming Soon / Feature Card */}
                    {!output && !isProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="lg:col-span-12 text-center py-10 opacity-40 hover:opacity-100 transition-opacity duration-700"
                        >
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.8em]">Awaiting Input Sequence</p>
                        </motion.div>
                    )}
                </div>

                {/* Footer Insight */}
                <div className="flex items-center justify-center gap-10 opacity-30">
                    <div className="flex items-center gap-2">
                        <FileText size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Essay Ready</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                        <Ghost size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Neural Shadow Mode</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ArrowRight size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Band 8.5+ Lexis</span>
                    </div>
                </div>
            </div>

            <footer className="mt-auto py-12 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em] border-t border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
                IELTS LOVER NEURAL REWRITER &nbsp; • &nbsp; DISTRIBUTED INTELLIGENCE
            </footer>
        </div>
    )
}

function ProtocolItem({ icon: Icon, color, label, value }: { icon: any, color: string, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 group/item">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110", color)}>
                <Icon size={18} />
            </div>
            <div className="space-y-0.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 tracking-tight uppercase">{value}</p>
            </div>
        </div>
    )
}
