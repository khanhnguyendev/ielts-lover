"use client"

import * as React from "react"
import {
    User,
    Calendar,
    Target,
    Save,
    Sparkles,
    ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCurrentUser, updateUserProfile } from "@/app/actions"
import { UserProfile } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"
import { useNotification } from "@/lib/contexts/notification-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarsBalance } from "@/components/dashboard/stars-balance"
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
            <div className="flex-1 flex items-center justify-center">
                <PulseLoader size="lg" color="primary" />
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50/20">
            <div className="p-6 lg:p-10 space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Page Header */}
                <div className="space-y-1 mt-2 ml-1">
                    <h1 className="text-2xl font-black font-outfit text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">Control center for your IELTS journey</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden group">
                    {/* Immersive Header (Compacted) */}
                    <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-primary/30 transition-all duration-1000" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-24 -mb-24 blur-[80px]" />

                        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                            <div className="relative group/avatar">
                                <Avatar className="h-20 w-20 border-4 border-white/10 shadow-3xl ring-4 ring-white/5 transition-transform duration-700 group-hover/avatar:scale-105">
                                    <AvatarImage src={user?.avatar_url} />
                                    <AvatarFallback className="bg-white/10 text-white font-black text-lg">
                                        {user?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 rounded-full bg-primary/20 blur opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                            </div>

                            <div className="text-center md:text-left space-y-1.5">
                                <div className="flex flex-col md:flex-row items-center gap-2.5">
                                    <h2 className="text-xl font-black text-white tracking-tight">{user?.full_name || user?.email?.split("@")[0]}</h2>
                                    <div className="flex gap-2">
                                        {user?.role === "admin" && (
                                            <div className="bg-amber-400 text-amber-950 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20">Admin</div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium tracking-wide leading-none">{user?.email}</p>
                                <div className="flex items-center justify-center md:justify-start gap-4 pt-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Active Session</span>
                                    </div>
                                    <span className="text-slate-700 text-[10px]">•</span>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
                                        Since {user && new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form (Compacted) */}
                    <div className="p-8 space-y-8">
                        {/* Display Name Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                                    <User size={12} />
                                </div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Identity Details</h3>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your official name"
                                    className="w-full h-11 px-5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary transition-all placeholder:text-slate-300 outline-none"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-slate-50" />

                        {/* IELTS Preferences Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                                    <Target size={12} />
                                </div>
                                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">IELTS Strategy</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Test Type */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Target Module</label>
                                    <div className="flex gap-2">
                                        {(["academic", "general"] as const).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setTestType(type)}
                                                className={cn(
                                                    "flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border shadow-sm",
                                                    testType === type
                                                        ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200 -translate-y-0.5"
                                                        : "bg-white text-slate-400 border-slate-100 hover:border-primary/30 hover:text-primary hover:bg-slate-50"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Exam Date */}
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Exam Deadline</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={examDate}
                                            onChange={(e) => setExamDate(e.target.value)}
                                            className="w-full h-10 pl-11 pr-5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Target Score */}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Ambition (Band Score)</label>
                                <div className="flex gap-2 flex-wrap">
                                    {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((score) => (
                                        <button
                                            key={score}
                                            onClick={() => setTargetScore(score)}
                                            className={cn(
                                                "h-10 w-10 rounded-xl text-xs font-black transition-all border shadow-sm flex items-center justify-center",
                                                targetScore === score
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 -translate-y-1"
                                                    : "bg-white text-slate-400 border-slate-100 hover:border-primary/20 hover:text-primary hover:bg-slate-50"
                                            )}
                                        >
                                            {score}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-50" />

                        {/* Save Button */}
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                className={cn(
                                    "h-12 px-8 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] gap-2.5 transition-all duration-500 shadow-xl",
                                    hasChanges
                                        ? "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200 hover:shadow-primary/20 hover:-translate-y-1 active:translate-y-0"
                                        : "bg-slate-100 text-slate-300 cursor-not-allowed grayscale"
                                )}
                            >
                                {isSaving ? (
                                    <PulseLoader size="sm" color="white" />
                                ) : (
                                    <>
                                        <div className="p-1 bg-white/10 rounded-full">
                                            <Save className="h-2.5 w-2.5" />
                                        </div>
                                        Sync Settings
                                        <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-auto py-8 text-center border-t border-slate-50 bg-white/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                    AUTHENTICATED SECURE SESSION &nbsp; • &nbsp; © 2026
                </p>
            </footer>
        </div>
    )
}
