"use client"

import * as React from "react"
import {
    Mail,
    MessageSquare,
    Send,
    HelpCircle,
    FileQuestion,
    LifeBuoy,
    Sparkles,
    ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function SupportPage() {
    const [submitted, setSubmitted] = React.useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 lg:p-12 space-y-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 1. Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl lg:text-4xl font-black font-outfit text-slate-900 tracking-tight">Support & Help</h1>
                        <p className="text-sm font-medium text-slate-500 max-w-lg">Get expert assistance and technical support for your IELTS preparation journey.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Support Online</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* 2. Sidebar Assistance */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group">
                            <h3 className="text-xl font-black font-outfit text-slate-900">Immediate Assistance</h3>

                            <div className="space-y-5">
                                <SupportActionCard
                                    icon={Mail}
                                    label="Email Support"
                                    value="support@ielts-lover.com"
                                    color="bg-primary/10 text-primary"
                                />
                                <SupportActionCard
                                    icon={MessageSquare}
                                    label="Live AI Buddy"
                                    value="Available 24/7"
                                    color="bg-purple-50 text-purple-600"
                                />
                                <SupportActionCard
                                    icon={LifeBuoy}
                                    label="Priority Help"
                                    value="Premium Exclusive"
                                    color="bg-amber-50 text-amber-600"
                                />
                            </div>

                            <div className="pt-6 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                                * Average response time for standard inquiries is ~24 hours.
                            </div>
                        </div>

                        {/* Knowledge Base Teaser */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group shadow-xl shadow-slate-200">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                                <Sparkles className="h-24 w-24 text-primary fill-primary" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary backdrop-blur-xl">
                                    <FileQuestion size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Knowledge Base</h4>
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Browse our collection of guides, tutorials and expert advice for IELTS mastery.</p>
                                </div>
                                <Button variant="cta" className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2">
                                    Explore FAQs
                                    <ChevronRight size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Main Contact Form */}
                    <div className="lg:col-span-8 h-full">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 md:p-12 shadow-sm flex flex-col h-full min-h-[600px] transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50">
                            {submitted ? (
                                <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center animate-in zoom-in-95 duration-500">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 relative z-10 animate-bounce">
                                            <Send className="h-10 w-10 text-white translate-x-1" />
                                        </div>
                                        <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-3xl font-black font-outfit text-slate-900">Message Received!</h3>
                                        <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">Our team has received your ticket and will investigate. You&apos;ll hear from us soon via email.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSubmitted(false)}
                                        className="h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-200 hover:border-primary hover:text-primary transition-all"
                                    >
                                        Send another message
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-3 mb-10">
                                        <h3 className="text-2xl font-black font-outfit text-slate-900">Connect with Experts</h3>
                                        <p className="text-sm text-slate-500 font-medium">Please provide as much detail as possible so we can assist you better.</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <FormInput label="Full Name" placeholder="e.g. Liam Smith" required />
                                            <FormInput label="Email Address" placeholder="e.g. liam@example.com" type="email" required />
                                        </div>

                                        <FormInput label="Subject" placeholder="Brief summary of your inquiry" required />

                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">How can we help?</label>
                                            <Textarea
                                                required
                                                placeholder="Please describe your issue, feedback, or question in detail..."
                                                className="min-h-[180px] bg-slate-50/50 border-slate-100 rounded-[2rem] p-6 font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all resize-none scrollbar-hide text-sm"
                                            />
                                        </div>

                                        <Button className="w-full h-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98] uppercase tracking-[0.2em] gap-3">
                                            Submit Request
                                            <Send className="h-5 w-5 fill-white" />
                                        </Button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Deep FAQ Grid */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 space-y-12 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-primary/10 mb-2">
                            <HelpCircle size={12} />
                            Instant Help
                        </div>
                        <h3 className="text-3xl font-black font-outfit text-slate-900">Frequently Asked Questions</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        {FAQ_DATA.map((faq, i) => (
                            <div key={i} className="group/faq space-y-3 p-6 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 group-hover/faq:scale-110 transition-transform">
                                        <Sparkles size={14} className="fill-current" />
                                    </div>
                                    <h4 className="text-sm font-black font-outfit text-slate-900 pr-4">{faq.q}</h4>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed ml-11">{faq.a}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100/50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Still Have Questions?</p>
                        <p className="text-xs text-slate-600 font-bold mt-1">Scroll up to send us a direct message or use the live chat.</p>
                    </div>
                </div>
            </div>

            <footer className="mt-auto py-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-t border-slate-50 bg-white/50">
                © 2026 IELTS LOVER &nbsp; • &nbsp; GLOBAL SUPPORT &nbsp; • &nbsp; TICKETING SYSTEM V2
            </footer>
        </div>
    )
}

function SupportActionCard({ icon: Icon, label, value, color }: { icon: React.ElementType, label: string, value: string, color: string }) {
    return (
        <div className="flex items-center gap-5 p-4 rounded-2xl border border-slate-50 hover:border-primary/20 hover:bg-slate-50 transition-all duration-300 group/card cursor-default">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover/card:rotate-6", color)}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="text-sm font-bold text-slate-800 tracking-tight">{value}</p>
            </div>
        </div>
    )
}

function FormInput({ label, placeholder, type = "text", required = false }: { label: string, placeholder: string, type?: string, required?: boolean }) {
    return (
        <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">{label}</label>
            <Input
                required={required}
                type={type}
                placeholder={placeholder}
                className="h-14 bg-slate-50/50 border-slate-100 rounded-2xl px-6 font-medium focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm"
            />
        </div>
    )
}

const FAQ_DATA = [
    { q: "How accurate is the AI scoring?", a: "Extremely. Our models are trained on thousands of official IELTS examiner-graded papers and follow the exact descriptors for Lexical Resource, CC, and Grammar." },
    { q: "What's the best way to use StarCredits?", a: "Each practice session or correction consumes credits. For the fastest improvement, we recommend doing 1 Task A and 1 Task B session daily." },
    { q: "Can I use my account on multiple devices?", a: "Yes. Your progress, history, and StarCredit balance are synced across all devices via your secure login." },
    { q: "How do I download my performance reports?", a: "You can view full reports in the Reports Hub. Exporting to PDF is a feature currently being prioritized for the next update." }
]
