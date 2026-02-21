"use client"

import * as React from "react"
import Link from "next/link"
import {
    Zap,
    ChevronRight,
    Calendar,
    PenTool,
    Mic2,
    CheckCircle2,
    ArrowRight,
    Send,
    Sparkles,
    Target,
    TrendingUp,
    Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import { getCurrentUser } from "@/app/actions"
import { UserProfile } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"
import { useNotification } from "@/lib/contexts/notification-context"

export default function DashboardPage() {
    const [user, setUser] = React.useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [chatInput, setChatInput] = React.useState("")
    const { notifySuccess, notifyInfo } = useNotification()

    const handleChatSubmit = () => {
        if (!chatInput.trim()) return
        notifySuccess("Message Sent", "Horsebot is thinking and will reply soon!", "Close")
        setChatInput("")
    }

    const handleFeatureClick = (feature: string) => {
        notifyInfo("Coming Soon", `The ${feature} feature is currently under development.`, "Close")
    }

    React.useEffect(() => {
        async function loadData() {
            try {
                const userData = await getCurrentUser()
                setUser(userData as UserProfile)
            } catch (error) {
                console.error("Failed to load dashboard data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <PulseLoader size="lg" color="primary" />
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 1. Quick Stats Header */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={Zap}
                        label="StarCredits"
                        value={user?.credits_balance?.toString() || "0"}
                        subLabel="Credits available"
                        color="text-amber-600"
                        bgColor="bg-amber-50"
                    />
                    <StatCard
                        icon={Target}
                        label="Target Score"
                        value={user?.target_score?.toString() || "7.5"}
                        subLabel={`IELTS ${user?.test_type || "Academic"}`}
                        color="text-primary"
                        bgColor="bg-primary/5"
                    />
                    <StatCard
                        icon={Calendar}
                        label="Exam Date"
                        value={user?.exam_date ? new Date(user.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Not set"}
                        subLabel={user?.exam_date ? new Date(user.exam_date).getFullYear().toString() : "Set in settings"}
                        color="text-blue-600"
                        bgColor="bg-blue-50"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Practice Level"
                        value="B2+"
                        subLabel="Estimated Level"
                        color="text-emerald-600"
                        bgColor="bg-emerald-50"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: AI Coach & Actions */}
                    <div className="lg:col-span-12 space-y-6">

                        {/* AI Coach Console */}
                        <div className="relative overflow-hidden bg-card border-none rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles size={120} className="text-primary" />
                            </div>

                            <div className="relative flex flex-col md:flex-row items-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-105 transition-transform duration-500">
                                        🐴
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-white">
                                        <Sparkles size={10} />
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h1 className="text-xl font-black text-slate-900 leading-none mb-2">Hello, {user?.full_name?.split(' ')[0] || 'Learner'}!</h1>
                                    <p className="text-sm font-medium text-slate-500 max-w-md">I&apos;m your AI IELTS Coach. Ask me anything about writing or speaking, or let&apos;s start a practice session.</p>
                                </div>

                                <div className="w-full md:max-w-md relative group/input">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-indigo-100 rounded-2xl blur opacity-25 group-hover/input:opacity-100 transition duration-1000 group-hover/input:duration-200"></div>
                                    <div className="relative bg-white border border-slate-100 rounded-2xl p-1.5 flex items-center shadow-sm hover:shadow-md transition-all">
                                        <input
                                            type="text"
                                            placeholder="Ask Horsebot a question..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-3 py-2"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleChatSubmit()
                                            }}
                                        />
                                        <Button size="icon-sm" className="rounded-xl shadow-lg shadow-primary/20" onClick={handleChatSubmit}>
                                            <Send size={14} className="text-white" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2 mt-2 px-1">
                                        {['Analyze Task', 'Check Grammar', 'Sample Idea'].map((hint) => (
                                            <button
                                                key={hint}
                                                onClick={() => handleFeatureClick(hint)}
                                                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors py-1 focus:outline-none"
                                            >
                                                {hint}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Practice & Getting Started Split */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Practice Writing */}
                            <Link href="/dashboard/writing" className="group">
                                <div className="h-full bg-white border border-slate-100 p-6 rounded-[2rem] hover:shadow-2xl hover:shadow-purple-100 hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <PenTool size={22} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 mb-1">Writing</h3>
                                    <p className="text-xs font-medium text-slate-500 mb-6">Task 1 & Task 2 exercises with instant AI grading.</p>
                                    <div className="flex items-center text-purple-600 text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                        Start Practice <ArrowRight size={14} className="ml-2" />
                                    </div>
                                </div>
                            </Link>

                            {/* Practice Speaking */}
                            <Link href="/dashboard/speaking" className="group">
                                <div className="h-full bg-white border border-slate-100 p-6 rounded-[2rem] hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Mic2 size={22} />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 mb-1">Speaking</h3>
                                    <p className="text-xs font-medium text-slate-500 mb-6">Full mock tests or part-specific practice with voice analysis.</p>
                                    <div className="flex items-center text-blue-600 text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                        Open Booth <ArrowRight size={14} className="ml-2" />
                                    </div>
                                </div>
                            </Link>

                            {/* Getting Started Guide */}
                            <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-black">Onboarding</h3>
                                        <span className="text-primary font-black font-outfit text-xl">
                                            {user?.target_score ? "100%" : "25%"}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        <OnboardingItem label="Target Score" completed={!!user?.target_score} />
                                        <OnboardingItem label="Speaking Level" />
                                        <OnboardingItem label="Writing Level" />
                                    </div>
                                </div>
                                <Progress value={user?.target_score ? 100 : 25} className="h-1 bg-white/10 mt-6" />
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between mb-6 px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                        <Clock size={16} />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Recent Activity</h3>
                                </div>
                                <Link href="/dashboard/reports" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline">
                                    Full History
                                </Link>
                            </div>

                            <div className="space-y-1">
                                <div className="text-center py-10">
                                    <div className="text-4xl grayscale opacity-30 mb-4">🐴💤</div>
                                    <h4 className="text-sm font-bold text-slate-600">No recent reports found</h4>
                                    <p className="text-[10px] text-slate-400 font-medium mt-1">Start practicing to see your progress here.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <footer className="mt-auto py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-t border-slate-50 bg-white/50">
                © 2026 IELTS LOVER &nbsp; • &nbsp; AI POWERED COACHING
            </footer>
        </div>
    )
}


function StatCard({ icon: Icon, label, value, subLabel, color, bgColor }: any) {
    return (
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-3">
                <div className={cn("p-2 rounded-xl", bgColor, color)}>
                    <Icon size={18} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                    {label}
                </div>
            </div>
            <div className="space-y-0.5">
                <div className="text-2xl font-black font-outfit text-slate-900">{value}</div>
                <div className="text-[10px] font-medium text-slate-400">{subLabel}</div>
            </div>
        </div>
    )
}

function OnboardingItem({ label, completed = false }: { label: string, completed?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                completed ? "bg-primary border-primary" : "border-white/20"
            )}>
                {completed && <CheckCircle2 size={10} className="text-slate-900" />}
            </div>
            <span className={cn(
                "text-xs font-bold transition-all",
                completed ? "text-white/40 line-through" : "text-white"
            )}>
                {label}
            </span>
        </div>
    )
}
