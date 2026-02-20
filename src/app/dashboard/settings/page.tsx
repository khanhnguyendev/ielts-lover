"use client"

import * as React from "react"
import {
    User,
    Calendar,
    Target,
    BookOpen,
    Save,
    ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCurrentUser, updateUserProfile } from "@/app/actions"
import { UserProfile } from "@/types"
import { PulseLoader } from "@/components/global/pulse-loader"
import { useNotification } from "@/lib/contexts/notification-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
                notifyError("Load Failed", "Could not load your profile.")
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

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
            notifySuccess("Saved", "Your settings have been updated.")
        } catch (err) {
            console.error(err)
            notifyError("Save Failed", "Could not save your settings. Please try again.")
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
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-8 lg:p-12 space-y-8 max-w-3xl mx-auto">
                {/* Page Header */}
                <div className="space-y-1">
                    <h1 className="text-2xl font-black font-outfit text-slate-900">Account Settings</h1>
                    <p className="text-sm text-muted-foreground font-medium">Manage your profile and IELTS preferences.</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden">
                    {/* Header with avatar */}
                    <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl" />
                        <div className="flex items-center gap-5 relative z-10">
                            <Avatar className="h-16 w-16 border-2 border-white/20 shadow-xl">
                                <AvatarImage src={user?.avatar_url} />
                                <AvatarFallback className="bg-white/10 text-white font-black text-lg">
                                    {user?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-lg font-black text-white">{user?.full_name || user?.email?.split("@")[0]}</h2>
                                <p className="text-xs text-slate-300 font-medium">{user?.email}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                    Member since {user && new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-8 space-y-8">
                        {/* Display Name */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <User className="h-3.5 w-3.5" />
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full h-12 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/10 focus:bg-white focus:border-primary/40 transition-all placeholder:text-slate-400 placeholder:font-normal outline-none"
                            />
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* IELTS Preferences Section */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">IELTS Preferences</h3>

                            {/* Test Type */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    Test Type
                                </label>
                                <div className="flex gap-3">
                                    {(["academic", "general"] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setTestType(type)}
                                            className={cn(
                                                "flex-1 h-12 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border",
                                                testType === type
                                                    ? "bg-primary text-white border-primary shadow-sm"
                                                    : "bg-slate-50 text-slate-500 border-slate-100 hover:border-primary/30 hover:text-primary"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Target Score */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <Target className="h-3.5 w-3.5" />
                                    Target Band Score
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((score) => (
                                        <button
                                            key={score}
                                            onClick={() => setTargetScore(score)}
                                            className={cn(
                                                "h-11 w-14 rounded-xl text-sm font-black transition-all border",
                                                targetScore === score
                                                    ? "bg-primary text-white border-primary shadow-sm"
                                                    : "bg-slate-50 text-slate-500 border-slate-100 hover:border-primary/30 hover:text-primary"
                                            )}
                                        >
                                            {score}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Exam Date */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Exam Date (optional)
                                </label>
                                <input
                                    type="date"
                                    value={examDate}
                                    onChange={(e) => setExamDate(e.target.value)}
                                    className="w-full h-12 px-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/10 focus:bg-white focus:border-primary/40 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                className={cn(
                                    "h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-2 transition-all",
                                    hasChanges
                                        ? "bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl hover:translate-y-[-2px]"
                                        : "bg-slate-200 text-slate-400"
                                )}
                            >
                                {isSaving ? (
                                    <PulseLoader size="sm" color="white" />
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Account Info Card */}
                <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden p-8 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Account Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1 min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Email</span>
                            <p className="text-sm font-bold text-slate-900 truncate" title={user?.email}>{user?.email}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Role</span>
                            <p className="text-sm font-bold text-slate-900 capitalize">{user?.role}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">StarCredits</span>
                            <p className="text-sm font-black text-primary font-mono">{user?.credits_balance ?? 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
