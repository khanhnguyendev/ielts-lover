"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Mail,
    MessageSquare,
    Send,
    HelpCircle,
    FileQuestion,
    LifeBuoy,
    Sparkles,
    ChevronRight,
    ArrowRight,
    ShieldCheck,
    Cpu,
    Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function SupportPage() {
    const [submitted, setSubmitted] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            setSubmitted(true)
        }, 1500)
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20 dark:bg-slate-950/20">
            <div className="p-6 lg:p-12 space-y-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-slate-900 dark:bg-slate-800 rounded-2xl text-white shadow-2xl">
                            <LifeBuoy size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Support Hub</h1>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Neural Assistance & Global Tickets</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 shadow-xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Response System Online</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                    {/* Assistance Channels */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/20 dark:border-slate-800/50 shadow-2xl flex flex-col gap-10 sticky top-12"
                        >
                            <div className="space-y-2">
                                <h3 className="text-xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Direct Channels</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect with our grid</p>
                            </div>

                            <div className="space-y-4">
                                <SupportActionCard
                                    icon={Mail}
                                    label="Neural Mail"
                                    value="hq@ielts-lover.com"
                                    color="bg-primary/10 text-primary"
                                />
                                <SupportActionCard
                                    icon={MessageSquare}
                                    label="AI Buddy"
                                    value="Instant Synthesis"
                                    color="bg-purple-500/10 text-purple-400"
                                />
                                <SupportActionCard
                                    icon={Cpu}
                                    label="Protocol Help"
                                    value="Premium Exclusive"
                                    color="bg-amber-500/10 text-amber-500"
                                />
                            </div>

                            <div className="mt-auto p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                                <FileQuestion className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-200 dark:text-slate-700 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                                <div className="relative z-10 space-y-4">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1.5">Knowledge Grid</h4>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Decrypt common issues and learn expert tips.</p>
                                    </div>
                                    <Button variant="outline" className="w-full h-11 rounded-xl text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-all">
                                        Access FAQ Archive
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-4 lg:p-12 border border-white/20 dark:border-slate-800/50 shadow-2xl h-full flex flex-col transition-all duration-500 min-h-[650px]"
                        >
                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex-1 flex flex-col items-center justify-center space-y-8 text-center"
                                    >
                                        <div className="relative">
                                            <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10">
                                                <Send className="h-10 w-10 text-white translate-x-1" />
                                            </div>
                                            <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] animate-pulse" />
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Signal Transmitted!</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto uppercase tracking-wide">Our intelligence team is decrypting your request.</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSubmitted(false)}
                                            className="h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary transition-all shadow-xl bg-white dark:bg-slate-800"
                                        >
                                            Submit New Ticket
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col h-full"
                                    >
                                        <div className="space-y-4 mb-10 text-center lg:text-left">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-primary/10">
                                                <Sparkles size={12} className="fill-current" />
                                                Priority Support
                                            </div>
                                            <h3 className="text-2xl font-black font-outfit text-slate-900 dark:text-white tracking-tight leading-none">New Support Request</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Transmit your inquiry to our global dispatch center.</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-8 flex-1">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <FormInput label="Official Name" placeholder="e.g. Liam Smith" required />
                                                <FormInput label="Relay Email" placeholder="e.g. liam@example.com" type="email" required />
                                            </div>

                                            <FormInput label="Ticket Subject" placeholder="What requires analysis?" required />

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Inquiry Description</label>
                                                <Textarea
                                                    required
                                                    placeholder="Provide all relevant data points for faster resolution..."
                                                    className="min-h-[220px] bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-8 focus:ring-primary/5 transition-all resize-none no-scrollbar text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
                                                />
                                            </div>

                                            <Button
                                                disabled={isLoading}
                                                className="w-full h-16 rounded-[2.5rem] bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-xs uppercase tracking-[0.3em] gap-4 shadow-3xl hover:-translate-y-1 active:translate-y-0 transition-all duration-500"
                                            >
                                                {isLoading ? <PulseLoader size="sm" color="white" /> : (
                                                    <>
                                                        Initialize Transmission
                                                        <div className="p-2 bg-white/10 rounded-xl">
                                                            <Send className="h-4 w-4 fill-white" />
                                                        </div>
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* FAQ Flow */}
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] p-12 border border-white/20 dark:border-slate-800/50 space-y-16 shadow-2xl">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/5 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/10 mb-2">
                            <Zap size={12} className="fill-current" />
                            Flash Resolution
                        </div>
                        <h3 className="text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Common Decryptions</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {FAQ_DATA.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="group/faq space-y-4 p-8 rounded-[2rem] bg-white/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover/faq:bg-primary/10 group-hover/faq:text-primary group-hover/faq:rotate-12 transition-all duration-500 shadow-sm border border-slate-100 dark:border-slate-800">
                                        <Sparkles size={16} />
                                    </div>
                                    <h4 className="text-base font-black font-outfit text-slate-900 dark:text-white pr-4 leading-tight">{faq.q}</h4>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-1 uppercase tracking-wide opacity-80">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 bg-slate-900 dark:bg-black rounded-[2rem] border border-white/5 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Still Need Connectivity?</p>
                            <p className="text-sm text-white font-black tracking-tight uppercase">Initiate a direct signal via the hub above</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-auto py-12 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em] border-t border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
                IELTS LOVER NEURAL SUPPORT &nbsp; • &nbsp; GLOBAL GRID V4.2
            </footer>
        </div>
    )
}

function SupportActionCard({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string, color: string }) {
    return (
        <div className="flex items-center gap-5 p-5 rounded-2xl border border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary/30 hover:shadow-xl transition-all duration-500 group/card cursor-default group">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover/card:scale-110 group-hover/card:rotate-6 shadow-sm", color)}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">{value}</p>
            </div>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                <ArrowRight size={16} className="text-primary" />
            </div>
        </div>
    )
}

function FormInput({ label, placeholder, type = "text", required = false }: { label: string, placeholder: string, type?: string, required?: boolean }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">{label}</label>
            <Input
                required={required}
                type={type}
                placeholder={placeholder}
                className="h-14 bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 rounded-2xl px-6 font-bold text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:ring-8 focus:ring-primary/5 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
            />
        </div>
    )
}

function PulseLoader({ size = "md", color = "primary" }: { size?: "sm" | "md" | "lg", color?: string }) {
    const sizes = { sm: "h-1 w-1", md: "h-1.5 w-1.5", lg: "h-2.5 w-2.5" }
    return (
        <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        "rounded-full animate-pulse",
                        sizes[size],
                        color === "white" ? "bg-white" : "bg-primary"
                    )}
                    style={{ animationDelay: `${i * 0.2}s` }}
                />
            ))}
        </div>
    )
}

const FAQ_DATA = [
    { q: "Data Sync Reliability", a: "Your StarCredits and session history are replicated across global nodes instantly. No practice data ever lost." },
    { q: "AI Synthesis Speed", a: "Standard evaluation takes ~1.5s. Deep re-evaluation with band descriptors can take up to 2.5s for massive essays." },
    { q: "Device Connectivity", a: "Session persistence works across 5 simultaneous relays per account. Your lab state is always synced." },
    { q: "Refund Protocols", a: "If a relay fails or AI synthesis errors, your StarCredits are automatically refunded via the local 'credit-change' event system." }
]
