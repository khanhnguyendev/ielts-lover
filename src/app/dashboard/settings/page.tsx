"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    User,
    Calendar,
    Target,
    Save,
    Sparkles,
    ShieldCheck,
    Mail,
    UserCircle,
    CheckCircle2,
    Settings as SettingsIcon,
    Camera
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCurrentUser, updateUserProfile } from "@/app/actions"
import { UserProfile } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"
import { useNotification } from "@/lib/contexts/notification-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NOTIFY_MSGS } from "@/lib/constants/messages"

export default function SettingsPage() {
    const { notifySuccess, notifyError } = useNotification()
    const [user, setUser] = React.useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)

    // Form state
    const [fullName, setFullName] = React.useState("")
    const [targetScore, setTargetScore] = React.useState(7)
    const [testType, setTestType] = React.useState<"academic" | "general">("academic")
    const [examDate, setExamDate] = React.useState("")

    React.useEffect(() => {
        async function load() {
            try {
                const data = await getCurrentUser()
                if (data) {
                    setUser(data)
                    setFullName(data.full_name || "")
                    setTargetScore(data.target_score || 7)
                    setTestType(data.test_type || "academic")
                    setExamDate(data.exam_date || "")
                }
            } catch (err) {
                console.error(err)
                notifyError(NOTIFY_MSGS.ERROR.LOAD_FAILED.title, NOTIFY_MSGS.ERROR.LOAD_FAILED.description)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [notifyError])

    const hasChanges = React.useMemo(() => {
        if (!user) return false
        return (
            fullName !== (user.full_name || "") ||
            targetScore !== (user.target_score || 7) ||
            testType !== (user.test_type || "academic") ||
            examDate !== (user.exam_date || "")
        )
    }, [user, fullName, targetScore, testType, examDate])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateUserProfile({
                full_name: fullName,
                target_score: targetScore,
                test_type: testType,
                exam_date: examDate || undefined,
            })
            // Update local user state so hasChanges resets
            setUser(prev => prev ? { ...prev, full_name: fullName, target_score: targetScore, test_type: testType, exam_date: examDate } : null)
            notifySuccess(NOTIFY_MSGS.SUCCESS.SETTINGS_UPDATED.title, NOTIFY_MSGS.SUCCESS.SETTINGS_UPDATED.description)
        } catch (err) {
            console.error(err)
            notifyError(NOTIFY_MSGS.ERROR.UPDATE_FAILED.title, NOTIFY_MSGS.ERROR.UPDATE_FAILED.description)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-slate-50/20 dark:bg-slate-950/20">
                <PulseLoader size="lg" color="primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 animate-pulse">Initializing Control Center...</p>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20 dark:bg-slate-950/20">
            <div className="p-6 lg:p-12 space-y-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Section Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-900 dark:bg-slate-800 rounded-2xl text-white shadow-2xl">
                                <SettingsIcon size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Profile Hub & Journey Preferences</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-5 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-8 shadow-2xl border border-white/20 dark:border-slate-800/50 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:bg-primary/10 transition-all duration-1000" />

                            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-purple-500 shadow-2xl transition-transform duration-700 group-hover:scale-105">
                                        <Avatar className="h-full w-full border-4 border-white dark:border-slate-900">
                                            <AvatarImage src={user?.avatar_url} />
                                            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-400 font-black text-3xl">
                                                {user?.full_name?.substring(0, 1).toUpperCase() || user?.email?.substring(0, 1).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <button className="absolute bottom-1 right-1 p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 text-primary hover:scale-110 transition-transform active:scale-95">
                                        <Camera size={16} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
                                        {user?.full_name || "IELTS Warrior"}
                                    </h2>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                                            {user?.role || "Free Member"}
                                        </span>
                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Joined {user && new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full pt-4 space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group/item">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400 group-hover/item:text-primary transition-colors">
                                                <Mail size={14} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Primary Email</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group/item">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400 group-hover/item:text-primary transition-colors">
                                                <ShieldCheck size={14} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Account Status</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Verified & Secure</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Preferences Form */}
                    <div className="lg:col-span-7 space-y-10">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-10 shadow-2xl border border-white/20 dark:border-slate-800/50 space-y-10"
                        >
                            {/* Personal Details */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                        <UserCircle size={18} />
                                    </div>
                                    <h3 className="text-lg font-black font-outfit text-slate-900 dark:text-white tracking-tight">Personal Identity</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Display Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="w-full h-14 px-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:bg-white dark:focus:bg-slate-900 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* IELTS Preferences */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                                        <Target size={18} />
                                    </div>
                                    <h3 className="text-lg font-black font-outfit text-slate-900 dark:text-white tracking-tight">IELTS Strategic Target</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Training Pathway</label>
                                        <div className="flex p-1.5 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            {(["academic", "general"] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setTestType(type)}
                                                    className={cn(
                                                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        testType === type
                                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl scale-[1.02]"
                                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                    )}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Exam Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                                            <input
                                                type="date"
                                                value={examDate}
                                                onChange={(e) => setExamDate(e.target.value)}
                                                className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-xs font-bold focus:ring-4 focus:ring-primary/5 focus:bg-white dark:focus:bg-slate-900 focus:border-primary transition-all outline-none appearance-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Band Score</label>
                                    <div className="grid grid-cols-5 sm:grid-cols-9 gap-3">
                                        {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((score) => (
                                            <button
                                                key={score}
                                                onClick={() => setTargetScore(score)}
                                                className={cn(
                                                    "h-12 rounded-xl text-xs font-black transition-all border shadow-sm flex items-center justify-center",
                                                    targetScore === score
                                                        ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 -translate-y-1 ring-4 ring-primary/10"
                                                        : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-700 hover:border-primary/20 hover:text-primary"
                                                )}
                                            >
                                                {score}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest max-w-[200px]">
                                    Last synchronized: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </p>

                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !hasChanges}
                                    className={cn(
                                        "h-14 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] gap-3 transition-all duration-500 shadow-2xl overflow-hidden relative",
                                        hasChanges
                                            ? "bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white shadow-slate-200 dark:shadow-black/50 hover:-translate-y-1 active:translate-y-0"
                                            : "bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                                    )}
                                >
                                    <AnimatePresence mode="wait">
                                        {isSaving ? (
                                            <motion.div
                                                key="saving"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center gap-2"
                                            >
                                                <PulseLoader size="sm" color="white" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="save"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="p-1.5 bg-white/10 rounded-lg">
                                                    <Save size={12} />
                                                </div>
                                                Synchronize Preferences
                                                <Sparkles size={12} className="text-amber-400" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <footer className="mt-auto py-12 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] border-t border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
                © 2026 IELTS LOVER COGNITIVE &nbsp; • &nbsp; SECURE PREFERENCE LAB
            </footer>
        </div>
    )
}
