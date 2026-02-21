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
            <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto animate-in fade-in duration-700">
                {/* 1. Daily Quota Banner */}
                <div className="bg-primary rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between text-white shadow-lg shadow-primary/20 gap-4 transition-all hover:shadow-primary/30">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
                            <Zap className="h-5 w-5 fill-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold font-outfit text-white">
                                You have {user?.credits_balance || 0} StarCredits available
                            </h3>
                            <p className="text-[10px] text-white/80 font-medium mt-0.5">Daily grants add credits every 24 hours</p>
                        </div>
                    </div>
                </div>

                {/* 2. IELTS Info Card */}
                <div className="bg-card rounded-2xl border p-5 flex flex-wrap gap-6 items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold font-outfit uppercase">IELTS {user?.test_type || "Academic"}</h4>
                            <p className="text-sm text-muted-foreground font-medium">{user?.exam_date || "No date selected"}</p>
                        </div>
                    </div>

                    <div className="flex gap-10">
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mb-1">Target Score</p>
                            <div className="text-2xl font-black font-outfit text-primary">{user?.target_score || "7.0"}</div>
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

                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                        <Edit3 className="h-5 w-5" />
                    </Button>
                </div>

                {/* 3. Horsebot Greeting & AI Input */}
                <div className="text-center space-y-4 py-4">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 bg-card border-2 border-primary/20 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                            <span className="text-4xl">🐴</span>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full animate-bounce">
                            <Sparkles className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl">Hi, I&apos;m your IELTS Coach!</h1>
                        <p className="text-foreground-secondary font-medium text-base">
                            ✨ I&apos;m here to make your IELTS preparation effective and fun. ✨
                        </p>
                    </div>

                    <div className="max-w-xl mx-auto relative group pt-2">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative bg-card border-2 border-muted hover:border-primary/30 transition-all rounded-2xl p-2 shadow-sm">
                            <textarea
                                placeholder="Ask anything in your language"
                                className="w-full h-20 p-3 text-sm bg-transparent border-none focus:ring-0 resize-none font-medium"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleChatSubmit()
                                    }
                                }}
                            />
                            <div className="flex items-center justify-between px-2 pb-2 mt-1">
                                <div className="flex gap-2">
                                    <Button variant="soft" size="xs" onClick={() => handleFeatureClick("Ask")}>Ask</Button>
                                    <Button variant="soft" size="xs" onClick={() => handleFeatureClick("Learn")}>Learn</Button>
                                    <Button variant="soft" size="xs" onClick={() => handleFeatureClick("Support")}>Support</Button>
                                </div>
                                <Button size="icon-sm" className="shadow-lg shadow-primary/20 hover:scale-110" onClick={handleChatSubmit}>
                                    <Send className="h-4 w-4 text-white" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Getting Started Progress */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-xl">
                                <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold font-outfit">Getting Started</h3>
                        </div>
                        <span className="text-lg font-black font-outfit text-primary">
                            {user?.target_score ? "100%" : "25%"}
                        </span>
                    </div>
                    <Progress value={user?.target_score ? 100 : 25} className="h-2 bg-muted rounded-full overflow-hidden" />

                    <div className="grid grid-cols-1 gap-2.5 pt-2">
                        <OnboardingStep label="Add your target score" completed={!!user?.target_score} href="/dashboard/settings" />
                        <OnboardingStep label="Learn your speaking level" href="/dashboard/speaking" />
                        <OnboardingStep label="Learn your writing level" href="/dashboard/writing" />
                        <OnboardingStep label="View sample reports" href="/dashboard/samples" />
                    </div>
                </div>

                {/* 5. Start Practice Cards */}
                <div className="space-y-5">
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
                <div className="bg-card rounded-3xl border p-6 space-y-6 shadow-sm">
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
                        <div className="text-8xl grayscale opacity-50">🐴🪴</div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-bold">You don&apos;t have any reports yet.</h4>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed">
                                Check out sample reports to see feedback examples.
                            </p>
                        </div>
                        <Link href="/dashboard/samples">
                            <Button variant="default" size="lg" className="px-10">
                                View Sample Reports
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-8 border-t text-center">
                        <Link href="/dashboard/reports">
                            <Button variant="ghost" className="text-primary hover:bg-primary/5 group">
                                View all in My Reports <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <footer className="mt-auto py-8 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] border-t bg-white/30">
                © 2026 IELTS Lover. &nbsp; Terms · Privacy · Contact us
            </footer>
        </div>
    )
}

function OnboardingStep({ label, completed = false, href }: { label: string, completed?: boolean, href?: string }) {
    const content = (
        <div className={cn(
            "flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer",
            completed ? "bg-muted/30 border-muted opacity-60 hover:opacity-100" : "bg-white border-muted hover:border-primary/20 hover:bg-primary/5"
        )}>
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    completed ? "bg-green-500" : "bg-muted"
                )}>
                    {completed ? <CheckCircle2 className="h-4 w-4 text-white" /> : <Edit3 className="h-4 w-4 text-muted-foreground" />}
                </div>
                <span className={cn("text-sm font-bold", completed && "line-through text-muted-foreground")}>{label}</span>
            </div>
            {!completed && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
    )

    if (href) {
        return <Link href={href} className="block">{content}</Link>
    }
    
    return content
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
        <div className="bg-card p-6 rounded-3xl border flex flex-col items-center text-center gap-5 shadow-sm hover:shadow-xl transition-all duration-300 group ring-primary/5 hover:ring-8 h-full">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
                <h4 className="text-xl font-black font-outfit">{title}</h4>
                <p className="text-sm text-foreground-secondary font-medium">{desc}</p>
            </div>
            <Button className="w-full font-black text-sm shadow-lg shadow-primary/20 transition-all group-hover:bg-primary/90">
                <div className="flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    {buttonText}
                </div>
            </Button>
        </div>
    )
}
