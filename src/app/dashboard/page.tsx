"use client"

import * as React from "react"
import Link from "next/link"
import {
    Zap,
    ChevronRight,
    Calendar,
    Edit3,
    PenTool,
    Mic2,
    CheckCircle2,
    ArrowRight,
    Send,
    Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
    return (
        <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in duration-700">

            {/* 1. Daily Quota Banner */}
            <div className="bg-primary rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-primary/20">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <Zap className="h-5 w-5 fill-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold font-outfit">0/2 daily free reports used</h3>
                        <p className="text-[10px] text-white/70 font-medium">Renews in 23 hours 59 minutes</p>
                    </div>
                </div>
                <Button variant="secondary" size="sm" className="h-9 px-4 rounded-full font-bold text-xs shadow-sm hover:scale-105 transition-transform">
                    Upgrade to premium now
                </Button>
            </div>

            {/* 2. IELTS Info Card */}
            <div className="bg-card rounded-2xl border p-6 flex flex-wrap gap-8 items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold font-outfit">IELTS Academic</h4>
                        <p className="text-sm text-muted-foreground font-medium">No date selected</p>
                    </div>
                </div>

                <div className="flex gap-10">
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mb-1">Target Score</p>
                        <div className="text-2xl font-black font-outfit text-primary">7.0</div>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mb-1">Writing</p>
                        <div className="text-2xl font-black font-outfit text-muted-foreground/60">--</div>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mb-1">Speaking</p>
                        <div className="text-2xl font-black font-outfit text-muted-foreground/60">--</div>
                    </div>
                </div>

                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted rounded-xl">
                    <Edit3 className="h-5 w-5" />
                </Button>
            </div>

            {/* 3. Catbot Greeting & AI Input */}
            <div className="text-center space-y-6 py-8">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-card border-2 border-primary/20 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                        <span className="text-5xl">🐱</span>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full animate-bounce">
                        <Sparkles className="h-4 w-4" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl">Hi, I&apos;m your IELTS Coach!</h1>
                    <p className="text-foreground-secondary font-medium text-lg">
                        ✨ I&apos;m here to make your IELTS preparation effective and fun. ✨
                    </p>
                </div>

                <div className="max-w-xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-card border-2 border-muted hover:border-primary/30 transition-all rounded-2xl p-2 shadow-sm">
                        <textarea
                            placeholder="Ask anything in your language"
                            className="w-full h-24 p-4 text-base bg-transparent border-none focus:ring-0 resize-none font-medium"
                        />
                        <div className="flex items-center justify-between px-2 pb-2">
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground rounded-lg hover:bg-muted">Ask</Button>
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground rounded-lg hover:bg-muted">Learn</Button>
                                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-muted-foreground rounded-lg hover:bg-muted">Support</Button>
                            </div>
                            <Button size="icon" className="h-10 w-10 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:scale-110 transition-transform">
                                <Send className="h-4 w-4 text-white" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Getting Started Progress */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold font-outfit">Getting Started</h3>
                    </div>
                    <span className="text-lg font-black font-outfit text-primary">25%</span>
                </div>
                <Progress value={25} className="h-2 bg-muted rounded-full overflow-hidden" />

                <div className="grid grid-cols-1 gap-3 pt-4">
                    <OnboardingStep label="Add your target score" completed={true} />
                    <OnboardingStep label="Learn your speaking level" />
                    <OnboardingStep label="Learn your writing level" />
                    <OnboardingStep label="View premium sample reports" />
                </div>
            </div>

            {/* 5. Start Practice Cards */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl">
                        <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold font-outfit">Start Practice</h3>
                </div>
                <p className="text-sm text-foreground-secondary font-medium">Ready to improve your IELTS score? Choose a skill to practice now!</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <Link href="/dashboard/writing" className="flex-1">
                        <PracticeCard
                            title="Writing Practice"
                            desc="Practice Task 1 & Task 2"
                            icon={PenTool}
                            buttonText="Start Writing"
                        />
                    </Link>
                    <Link href="/dashboard/speaking" className="flex-1">
                        <PracticeCard
                            title="Speaking Practice"
                            desc="Practice Part 1, Part 2, Part 3"
                            icon={Mic2}
                            buttonText="Start Speaking"
                        />
                    </Link>
                </div>
            </div>

            {/* 6. Recent Activity (Empty State) */}
            <div className="bg-card rounded-3xl border p-8 space-y-8 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold font-outfit">Recent Activity</h3>
                </div>

                <div className="hidden md:grid grid-cols-5 text-[10px] uppercase tracking-widest font-black text-muted-foreground/60 border-b pb-4">
                    <div>Time</div>
                    <div>Task</div>
                    <div>Task Description</div>
                    <div>Status</div>
                    <div className="text-right">Score</div>
                </div>

                <div className="text-center py-12 space-y-6">
                    <div className="text-8xl grayscale opacity-50">🐱🪴</div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-bold">You don&apos;t have any reports yet.</h4>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed">
                            Check out sample reports to see feedback examples for premium users.
                        </p>
                    </div>
                    <Link href="/dashboard/samples">
                        <Button variant="secondary" className="rounded-full px-8 h-12 font-bold bg-primary text-white hover:bg-primary/90">
                            View Premium Sample Reports
                        </Button>
                    </Link>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium pt-8">
                        Free users can see up to 5 completed records. <span className="text-primary font-bold cursor-pointer hover:underline">Upgrade</span> to see more results.
                    </p>
                </div>

                <div className="pt-8 border-t text-center">
                    <Link href="/dashboard/reports">
                        <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-xl group">
                            View all in My Reports <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>

        </div>
    )
}

function OnboardingStep({ label, completed = false }: { label: string, completed?: boolean }) {
    return (
        <div className={cn(
            "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
            completed ? "bg-muted/30 border-muted opacity-60" : "bg-white border-muted hover:border-primary/20 hover:bg-primary/5"
        )}>
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    completed ? "bg-green-500" : "bg-muted"
                )}>
                    {completed ? <CheckCircle2 className="h-5 w-5 text-white" /> : <Edit3 className="h-5 w-5 text-muted-foreground" />}
                </div>
                <span className={cn("text-sm font-bold", completed && "line-through text-muted-foreground")}>{label}</span>
            </div>
            {!completed && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
    )
}

function PracticeCard({
    title,
    desc,
    icon: Icon,
    buttonText
}: {
    title: string,
    desc: string,
    icon: any,
    buttonText: string
}) {
    return (
        <div className="bg-card p-8 rounded-3xl border flex flex-col items-center text-center gap-6 shadow-sm hover:shadow-xl transition-all duration-300 group ring-primary/5 hover:ring-8 h-full">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
                <h4 className="text-xl">{title}</h4>
                <p className="text-sm text-foreground-secondary font-medium">{desc}</p>
            </div>
            <Button className="w-full h-12 bg-primary text-white rounded-xl font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    {buttonText}
                </div>
            </Button>
        </div>
    )
}
