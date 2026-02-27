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
    Layout,
    ArrowUpRight,
    TrendingDown
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import { getCurrentUser, getRecentActivity } from "@/app/actions"
import { UserProfile } from "@/types"
import { CreditTransaction } from "@/repositories/interfaces"
import { PulseLoader } from "@/components/global/pulse-loader"
import { useNotification } from "@/lib/contexts/notification-context"
import { ActivityItem } from "@/components/dashboard/activity-item"
import { NOTIFY_MSGS } from "@/lib/constants/messages"

export default function DashboardPage() {
    const [user, setUser] = React.useState<UserProfile | null>(null)
    const [recentActivity, setRecentActivity] = React.useState<CreditTransaction[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [chatInput, setChatInput] = React.useState("")
    const { notifySuccess, notifyInfo } = useNotification()

    const handleChatSubmit = () => {
        if (!chatInput.trim()) return
        notifySuccess(NOTIFY_MSGS.SUCCESS.MESSAGE_SENT.title, NOTIFY_MSGS.SUCCESS.MESSAGE_SENT.description, "Close")
        setChatInput("")
    }

    const handleFeatureClick = (feature: string) => {
        notifyInfo(NOTIFY_MSGS.INFO.COMING_SOON.title, `The ${feature} feature is currently under development.`, "Close")
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
        <div className="flex-1">
            <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">

                {/* 1. High-Density Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        index={0}
                        icon={Zap}
                        label="StarCredits"
                        value={user?.credits_balance?.toString() || "0"}
                        subLabel="Ready to spend"
                        color="text-amber-500"
                        bgColor="bg-amber-100/50"
                        href="/dashboard/credits"
                        trend="+12%"
                    />
                    <StatCard
                        index={1}
                        icon={Target}
                        label="Target Score"
                        value={user?.target_score?.toString() || "7.5"}
                        subLabel={`IELTS ${user?.test_type || "Academic"}`}
                        color="text-indigo-500"
                        bgColor="bg-indigo-100/50"
                        href="/dashboard/settings"
                    />
                    <StatCard
                        index={2}
                        icon={Calendar}
                        label="Exam Date"
                        value={user?.exam_date ? new Date(user.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Not Set"}
                        subLabel={user?.exam_date ? new Date(user.exam_date).getFullYear().toString() : "Set target date"}
                        color="text-sky-500"
                        bgColor="bg-sky-100/50"
                        href="/dashboard/settings"
                    />
                    <StatCard
                        index={3}
                        icon={TrendingUp}
                        label="Estimated Band"
                        value="6.5"
                        subLabel="Based on 0 attempts"
                        color="text-emerald-500"
                        bgColor="bg-emerald-100/50"
                        href="/dashboard/reports"
                        trend="+0.5"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    <div className="lg:col-span-12 space-y-10">

                        {/* 2. Immersive AI Coach Console */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="relative overflow-hidden group"
                        >
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-indigo-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
                            <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] p-8 lg:p-12 border border-white/20 dark:border-slate-800/50 shadow-2xl flex flex-col md:flex-row items-center gap-10">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />

                                <div className="relative shrink-0">
                                    <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-slate-100 dark:border-slate-700">
                                        🐴
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full border-4 border-white dark:border-slate-900 shadow-xl">
                                        <Sparkles size={16} className="animate-pulse" />
                                    </div>
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-3">
                                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                        Ready for Band {user?.target_score || '7.5'}, <span className="text-primary">{user?.full_name?.split(' ')[0] || 'Learner'}?</span>
                                    </h1>
                                    <p className="text-base font-medium text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                                        I&apos;m your personal AI coach. Let&apos;s analyze your latest writing or explore some speaking topics together.
                                    </p>
                                </div>

                                <div className="w-full md:max-w-md lg:max-w-lg relative group/input">
                                    <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl p-2 flex items-center border border-slate-200 dark:border-slate-700/50 transition-all hover:border-primary shadow-sm hover:shadow-lg">
                                        <input
                                            type="text"
                                            placeholder="Ask Horsebot a question..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold px-4 text-slate-900 dark:text-white placeholder:text-slate-400"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleChatSubmit()
                                            }}
                                        />
                                        <Button
                                            size="icon"
                                            className="rounded-xl shadow-lg bg-primary hover:bg-primary/90 transition-all active:scale-95 group/btn h-11 w-11"
                                            onClick={handleChatSubmit}
                                        >
                                            <Send size={20} className="text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2.5 mt-4 px-1 overflow-x-auto no-scrollbar">
                                        {['Check Grammar', 'Writing Task 2 Ideas', 'Part 1 Mock'].map((hint) => (
                                            <button
                                                key={hint}
                                                onClick={() => handleFeatureClick(hint)}
                                                className="whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                                            >
                                                {hint}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Action Hub Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <ActionCard
                                href="/dashboard/writing"
                                icon={PenTool}
                                label="Writing Lab"
                                description="Task 1 & 2 practice with real-time AI feedback and detailed band descriptors."
                                theme="purple"
                                meta="1,200+ Topics"
                            />
                            <ActionCard
                                href="/dashboard/speaking"
                                icon={Mic2}
                                label="Speaking Lab"
                                description="AI-powered speaking mock tests with fluency, grammar, and pronunciation analysis."
                                theme="blue"
                                meta="AI Mock Tests"
                                badge="Coming Soon"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:border-primary/20 transition-all duration-500 shadow-sm relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <GraduationCap className="w-24 h-24 text-primary" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex flex-col">
                                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">Learning Progress</h3>
                                            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Onboarding</p>
                                        </div>
                                        <span className="text-primary font-black font-outfit text-3xl">
                                            {user?.target_score ? "100%" : "33%"}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <OnboardingItem label="Set Target Score" completed={!!user?.target_score} />
                                        <OnboardingItem label="Complete First Writing Task" />
                                        <OnboardingItem label="Try Speaking Part 1" />
                                    </div>
                                </div>
                                <div className="mt-10">
                                    <Progress value={user?.target_score ? 100 : 33} className="h-2.5 bg-slate-100 dark:bg-slate-800 transition-all duration-300" />
                                </div>
                            </motion.div>
                        </div>

                        {/* 4. Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 lg:p-10 shadow-sm group hover:border-primary/10 transition-all duration-500"
                        >
                            <div className="flex items-center justify-between mb-10 px-1">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 shadow-sm">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Recent Activity</h3>
                                            <div className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{recentActivity.length} items</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your Latest Progress</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/transactions" className="group/link flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-all hover:translate-x-1">
                                    View Full History <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="space-y-1">
                                {recentActivity.length > 0 ? (
                                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                        {recentActivity.map((t, idx) => (
                                            <motion.div
                                                key={t.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.4, delay: 0.3 + (idx * 0.05) }}
                                            >
                                                <ActivityItem transaction={t} />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 flex flex-col items-center text-center space-y-6">
                                        <div className="text-7xl opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000">📊</div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Your lab is waiting</h4>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                                                Complete your first practice session to see your performance metrics here.
                                            </p>
                                        </div>
                                        <Link href="/dashboard/writing">
                                            <Button className="rounded-2xl h-11 px-8 font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20">
                                                Start Practice session
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>

            <footer className="mt-auto py-12 text-center border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center justify-center gap-8 mb-6 opacity-20 grayscale saturate-0 hover:opacity-50 hover:grayscale-0 transition-all">
                    <History size={18} />
                    <Sparkles size={18} />
                    <Target size={18} />
                    <Layout size={18} />
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">
                    © 2026 IELTS LOVER &nbsp; • &nbsp; AI POWERED COACHING LAB
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
    const themes = {
        purple: {
            bg: "group-hover:bg-purple-50 dark:group-hover:bg-purple-900/10",
            iconBg: "bg-purple-600 shadow-purple-200 dark:shadow-purple-900/40",
            text: "text-purple-600 dark:text-purple-400",
            glow: "bg-purple-400/10"
        },
        blue: {
            bg: "group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10",
            iconBg: "bg-blue-600 shadow-blue-200 dark:shadow-blue-900/40",
            text: "text-blue-600 dark:text-blue-400",
            glow: "bg-blue-400/10"
        },
        emerald: {
            bg: "group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/10",
            iconBg: "bg-emerald-600 shadow-emerald-200 dark:shadow-emerald-900/40",
            text: "text-emerald-600 dark:text-emerald-400",
            glow: "bg-emerald-400/10"
        }
    }

    const current = themes[theme]

    return (
        <Link href={href} className="group h-full">
            <motion.div
                whileHover={{ y: -8 }}
                className={cn(
                    "h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 lg:p-10 rounded-[2.5rem] transition-all duration-500 flex flex-col shadow-sm group-hover:shadow-2xl relative overflow-hidden",
                    current.bg
                )}
            >
                <div className={cn("absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-[70px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000", current.glow)} />

                {badge && (
                    <div className="absolute top-8 right-8 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                        {badge}
                    </div>
                )}

                <div className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl",
                    current.iconBg
                )}>
                    <Icon size={30} className="text-white" />
                </div>

                <div className="space-y-1.5 mb-3 relative z-10">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{label}</h3>
                    {meta && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{meta}</p>
                    )}
                </div>

                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-10 leading-relaxed relative z-10">
                    {description}
                </p>

                <div className={cn(
                    "mt-auto flex items-center text-xs font-black uppercase tracking-widest transition-all duration-500 gap-2 group-hover:gap-3 relative z-10",
                    current.text
                )}>
                    Get Started <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </div>
            </motion.div>
        </Link>
    )
}

function StatCard({ icon: Icon, label, value, subLabel, color, bgColor, href, trend, index }: {
    icon: React.ElementType,
    label: string,
    value: string,
    subLabel: string,
    color: string,
    bgColor: string,
    href?: string,
    trend?: string,
    index: number
}) {
    return (
        <Link href={href || "#"} className="block h-full">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col justify-between group"
            >
                <div className="flex justify-between items-start mb-8">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-700 group-hover:scale-110 group-hover:rotate-6", bgColor, color)}>
                        <Icon size={24} />
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black shadow-sm",
                            trend.startsWith('+') ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                        )}>
                            {trend.startsWith('+') ? <ArrowUpRight size={12} /> : <TrendingDown size={12} />}
                            {trend}
                        </div>
                    )}
                </div>
                <div className="space-y-1.5 px-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">{label}</p>
                    <div className="text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tighter leading-none">{value}</div>
                    <div className="flex items-center justify-between pt-2">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{subLabel}</div>
                        <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                            <ChevronRight size={14} className="text-primary" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

function OnboardingItem({ label, completed = false }: { label: string, completed?: boolean }) {
    return (
        <div className="flex items-center gap-4 group/item cursor-default">
            <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 shrink-0",
                completed ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-110" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            )}>
                {completed ? (
                    <CheckCircle2 size={12} className="text-white" />
                ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover/item:bg-primary transition-colors" />
                )
                }
            </div>
            <span className={cn(
                "text-[13px] font-bold transition-all duration-500",
                completed ? "text-slate-400 dark:text-slate-500 line-through decoration-primary/40" : "text-slate-700 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white"
            )}>
                {label}
            </span>
        </div>
    )
}
