"use client"

import * as React from "react"
import { TransactionFeed } from "@/components/dashboard/transaction-feed"
import { redirect } from "next/navigation"
import { getCurrentUser, getUserTransactionsPaginated, getUserTransactionStats } from "@/app/actions"
import { formatCredits } from "@/lib/utils"
import {
    History,
    Sparkles,
    Zap,
    ArrowUpCircle,
    ArrowDownCircle
} from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { PulseLoader } from "@/components/global/pulse-loader"
import { UserProfile } from "@/types"
import { CreditTransaction } from "@/repositories/interfaces"
import { useSearchParams } from "next/navigation"

const PAGE_SIZE = 8

export default function TransactionsPage() {
    return (
        <React.Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-slate-50/20 dark:bg-slate-950/20">
                <PulseLoader size="lg" color="primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 animate-pulse">Initializing Financial Audit...</p>
            </div>
        }>
            <TransactionsContent />
        </React.Suspense>
    )
}

function TransactionsContent() {
    const searchParams = useSearchParams()
    const txId = searchParams.get("txId")

    const [user, setUser] = React.useState<UserProfile | null>(null)
    const [stats, setStats] = React.useState({ totalEarned: 0, totalSpent: 0 })
    const [initialData, setInitialData] = React.useState<{ data: CreditTransaction[], total: number } | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        async function loadData() {
            try {
                const userData = await getCurrentUser()
                if (!userData) {
                    redirect("/auth/login")
                    return
                }

                const [userStats, firstPage] = await Promise.all([
                    getUserTransactionStats(),
                    getUserTransactionsPaginated(PAGE_SIZE, 0)
                ])

                setUser(userData as UserProfile)
                setStats(userStats)
                setInitialData(firstPage)
            } catch (error) {
                console.error("Failed to load transaction data:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    if (isLoading || !initialData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-slate-50/20 dark:bg-slate-950/20">
                <PulseLoader size="lg" color="primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 animate-pulse">Retrieving Ledger Records...</p>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/20 dark:bg-slate-950/20">
            <div className="p-6 lg:p-12 space-y-10 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-900 dark:bg-slate-800 rounded-2xl text-white shadow-2xl">
                                <History size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">Financial Ledger</h1>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Transaction History & StarCredits Audit</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Summary Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard
                        index={0}
                        icon={Zap}
                        label="StarCredits Vault"
                        value={formatCredits(user?.credits_balance || 0)}
                        subLabel="Ready to spend"
                        color="text-amber-500"
                        bgColor="bg-amber-100/50"
                        href="/dashboard/credits"
                    />
                    <StatCard
                        index={1}
                        icon={ArrowUpCircle}
                        label="Total Accumulation"
                        value={formatCredits(stats.totalEarned)}
                        subLabel="Lifetime additions"
                        color="text-emerald-500"
                        bgColor="bg-emerald-100/50"
                    />
                    <StatCard
                        index={2}
                        icon={ArrowDownCircle}
                        label="Total Utilization"
                        value={formatCredits(stats.totalSpent)}
                        subLabel="Lifetime investment"
                        color="text-rose-500"
                        bgColor="bg-rose-100/50"
                    />
                </div>

                {/* 3. Transaction Feed */}
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-4 lg:p-10 shadow-2xl border border-white/20 dark:border-slate-800/50 space-y-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 px-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="space-y-1 text-center md:text-left">
                            <h2 className="text-2xl font-black font-outfit text-slate-900 dark:text-white tracking-tight leading-none">Activity Feed</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">Chronological credit flow audit</p>
                        </div>

                        <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Real-time sync active</span>
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        <TransactionFeed
                            initialTransactions={initialData.data}
                            totalTransactions={initialData.total}
                            pageSize={PAGE_SIZE}
                            initialSelectedTxId={txId}
                        />
                    </div>
                </div>
            </div>

            <footer className="mt-auto py-12 text-center text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] border-t border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
                © 2026 IELTS LOVER COGNITIVE &nbsp; • &nbsp; SECURE TRANSACTION LAB
            </footer>
        </div>
    )
}
