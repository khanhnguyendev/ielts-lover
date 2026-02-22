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
    Clock,
    History,
    GraduationCap,
    Layout
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import { getCurrentUser, getRecentActivity } from "@/app/actions"
import { UserProfile } from "@/types"
import { CreditTransaction } from "@/repositories/interfaces"
import { PulseLoader } from "@/components/global/pulse-loader"
import { useNotification } from "@/lib/contexts/notification-context"
import { ActivityItem } from "@/components/dashboard/activity-item"

export default function DashboardPage() {
    const [user, setUser] = React.useState<UserProfile | null>(null)
    const [recentActivity, setRecentActivity] = React.useState<CreditTransaction[]>([])
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
                const [userData, activityData] = await Promise.all([
                    getCurrentUser(),
                    getRecentActivity(),
                ])
                setUser(userData as UserProfile)
                setRecentActivity(activityData)
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
            <div className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">

                {/* 1. High-Density Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                        icon={Zap}
                        label="StarCredits"
                        value={user?.credits_balance?.toString() || "0"}
                        subLabel="Ready to spend"
                        color="text-amber-500"
                        bgColor="bg-amber-50"
                        href="/dashboard/credits"
                    />
                    <StatCard
                        icon={Target}
                        label="Target Score"
                        value={user?.target_score?.toString() || "7.5"}
                        subLabel={`IELTS ${user?.test_type || "Academic"}`}
                        color="text-primary"
                        bgColor="bg-primary/5"
                        href="/dashboard/settings"
                    />
                    <StatCard
                        icon={Calendar}
                        label="Exam Date"
                        value={user?.exam_date ? new Date(user.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Not Set"}
                        subLabel={user?.exam_date ? new Date(user.exam_date).getFullYear().toString() : "Set target date"}
                        color="text-blue-500"
                        bgColor="bg-blue-50"
                        href="/dashboard/settings"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Estimated Band"
                        value="6.5"
                        subLabel="Based on 0 attempts"
                        color="text-emerald-500"
                        bgColor="bg-emerald-50"
                        href="/dashboard/reports"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left & Main Content Area */}
                    <div className="lg:col-span-12 space-y-8">

                        {/* 2. Immersive AI Coach Console */}
                        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl shadow-slate-200 group border border-slate-800">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full -mr-40 -mt-40 blur-[100px] transition-all group-hover:bg-primary/20 duration-1000" />
                            <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/5 rounded-full -ml-30 -mb-30 blur-[80px]" />

                            <div className="relative flex flex-col md:flex-row items-center gap-8">
                                <div className="relative shrink-0">
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center text-4xl shadow-2xl group-hover:scale-105 transition-transform duration-700 group-hover:rotate-3">
                                        🐴
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full border-4 border-slate-900 shadow-xl">
                                        <Sparkles size={12} className="animate-pulse" />
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-2">
                                    <h1 className="text-2xl font-black text-white tracking-tight">
                                        Ready to achieve Band {user?.target_score || '7.5'}, {user?.full_name?.split(' ')[0] || 'Learner'}?
                                    </h1>
                                    <p className="text-sm font-medium text-slate-400 max-w-lg leading-relaxed">
                                        I&apos;m your AI IELTS Coach. Send me an essay to analyze, or ask about any speaking topic.
                                    </p>
                                </div>

                                <div className="w-full md:max-w-md lg:max-w-lg relative group/input">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-[2rem] blur opacity-25 group-hover/input:opacity-100 transition duration-1000 group-hover/input:duration-300"></div>
                                    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.8rem] p-2 flex items-center shadow-2xl transition-all group-hover/input:border-white/20">
                                        <input
                                            type="text"
                                            placeholder="Ask Horsebot a question..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-4 text-white placeholder:text-slate-500"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleChatSubmit()
                                            }}
                                        />
                                        <Button
                                            size="icon-lg"
                                            className="rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95 group/btn"
                                            onClick={handleChatSubmit}
                                        >
                                            <Send size={18} className="text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2.5 mt-3 px-2 overflow-x-auto scrollbar-hide no-scrollbar">
                                        {['Check Grammar', 'Sample Task 1', 'Mock Part 2'].map((hint) => (
                                            <button
                                                key={hint}
                                                onClick={() => handleFeatureClick(hint)}
                                                className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary border border-slate-700 hover:border-primary/30 px-3 py-1.5 rounded-lg transition-all focus:outline-none"
                                            >
                                                {hint}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Action Hub Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                            {/* Practice Writing */}
                            <ActionCard
                                href="/dashboard/writing"
                                icon={PenTool}
                                label="Writing Tasks"
                                description="Task 1 & 2 practice with instant AI grading and level-up tips."
                                theme="purple"
                                meta="1,200+ Topics"
                            />

                            {/* Practice Speaking */}
                            <ActionCard
                                href="/dashboard/speaking"
                                icon={Mic2}
                                label="Speaking Partner"
                                description="Experience real-time AI conversation with voice and fluency analysis."
                                theme="blue"
                                meta="AI Mock Tests"
                                badge="Coming Soon"
                            />

                            {/* Modern Onboarding */}
                            <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:border-primary/20 transition-all duration-500 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <GraduationCap className="w-24 h-24 text-primary" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex flex-col">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Onboarding</h3>
                                            <p className="text-xl font-black text-slate-900 tracking-tight">Setup Progress</p>
                                        </div>
                                        <span className="text-primary font-black font-outfit text-3xl">
                                            {user?.target_score ? "100%" : "33%"}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <OnboardingItem label="Define Target Score" completed={!!user?.target_score} />
                                        <OnboardingItem label="First Speaking Trial" />
                                        <OnboardingItem label="Submit Writing Task" />
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <Progress value={user?.target_score ? 100 : 33} className="h-2 bg-slate-200 group-hover:h-2.5 transition-all duration-300" />
                                </div>
                            </div>
                        </div>

                        {/* 4. Refined Recent Activity */}
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm group hover:border-slate-200 transition-all duration-500">
                            <div className="flex items-center justify-between mb-8 px-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Your Activity</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historical Progress</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/transactions" className="group/link flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-all">
                                    Full History <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <div className="space-y-1">
                                {recentActivity.length > 0 ? (
                                    <div className="divide-y divide-slate-50">
                                        {recentActivity.map((t) => (
                                            <ActivityItem key={t.id} transaction={t} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 flex flex-col items-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-1000">
                                        <div className="relative">
                                            <div className="text-6xl filter grayscale opacity-20 transition-all group-hover:grayscale-0 group-hover:opacity-40 hover:scale-110 duration-700 cursor-default">
                                                📊
                                            </div>
                                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/5 rounded-full blur-xl animate-pulse" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-lg font-black text-slate-800 tracking-tight">No recent activity detected</h4>
                                            <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
                                                Start practicing Writing or Speaking to see your band scores and analysis here.
                                            </p>
                                        </div>
                                        <div className="pt-2">
                                            <Link href="/dashboard/writing">
                                                <Button variant="outline" className="rounded-2xl border-slate-200 px-8 font-black uppercase tracking-widest text-[10px] hover:border-primary/30 hover:bg-primary/5 transition-all">
                                                    Start Practice Session
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <footer className="mt-auto py-10 text-center border-t border-slate-50 bg-white/50">
                <div className="flex items-center justify-center gap-6 mb-4 opacity-30 grayscale saturate-0">
                    <History size={16} />
                    <Sparkles size={16} />
                    <Target size={16} />
                    <Layout size={16} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                    © 2026 IELTS LOVER &nbsp; • &nbsp; AI POWERED COACHING PLATFORM
                </p>
            </footer>
        </div>
    )
}

function ActionCard({ href, icon: Icon, label, description, theme, meta, badge }: {
    href: string,
    icon: React.ElementType,
    label: string,
    description: string,
    theme: "purple" | "blue" | "emerald",
    meta?: string,
    badge?: string
}) {
    const iconStyles = {
        purple: "bg-purple-600 text-white shadow-purple-200",
        blue: "bg-blue-600 text-white shadow-blue-200",
        emerald: "bg-emerald-600 text-white shadow-emerald-200",
    }

    const hoverShadow = {
        purple: "hover:shadow-purple-100/80",
        blue: "hover:shadow-blue-100/80",
        emerald: "hover:shadow-emerald-100/80",
    }

    return (
        <Link href={href} className="group">
            <div className={cn(
                "h-full bg-white border border-slate-100 p-8 rounded-[2.5rem] transition-all duration-500 flex flex-col shadow-sm hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden",
                hoverShadow[theme]
            )}>
                {badge && (
                    <div className="absolute top-6 right-6 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-100 text-[8px] font-black uppercase tracking-widest text-amber-600">
                        {badge}
                    </div>
                )}

                <div className={cn(
                    "w-14 h-14 rounded-[1.25rem] flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg",
                    iconStyles[theme]
                )}>
                    <Icon size={26} />
                </div>

                <div className="space-y-1 mb-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{label}</h3>
                    {meta && (
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{meta}</p>
                    )}
                </div>

                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                    {description}
                </p>

                <div className={cn(
                    "mt-auto flex items-center text-xs font-black uppercase tracking-widest transition-all duration-500 group-hover:gap-3 gap-2",
                    theme === "purple" ? "text-purple-600" : theme === "blue" ? "text-blue-600" : "text-emerald-600"
                )}>
                    Start Practice <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    )
}

function StatCard({ icon: Icon, label, value, subLabel, color, bgColor, href }: {
    icon: React.ElementType,
    label: string,
    value: string,
    subLabel: string,
    color: string,
    bgColor: string,
    href?: string
}) {
    return (
        <Link href={href || "#"} className="block group">
            <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-primary/5 hover:-translate-y-1 transition-all duration-500 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500 group-hover:scale-110", bgColor, color)}>
                        <Icon size={20} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors pr-1">
                        {label}
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="text-3xl font-black font-outfit text-slate-900 tracking-tighter">{value}</div>
                    <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{subLabel}</div>
                        <ChevronRight size={12} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </div>
        </Link>
    )
}

function OnboardingItem({ label, completed = false }: { label: string, completed?: boolean }) {
    return (
        <div className="flex items-center gap-3.5 group/item">
            <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                completed ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-110" : "border-slate-200 bg-white"
            )}>
                {completed ? (
                    <CheckCircle2 size={12} className="text-white" />
                ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/item:bg-primary transition-colors" />
                )
                }
            </div>
            <span className={cn(
                "text-xs font-bold transition-all duration-500",
                completed ? "text-slate-400 line-through decoration-primary/40" : "text-slate-700 group-hover/item:text-slate-900"
            )}>
                {label}
            </span>
        </div>
    )
}
