"use server"

import { CreditTransactionRepository } from "@/repositories/transaction.repository"
import { TransactionFeed } from "@/components/dashboard/transaction-feed"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/actions"
import {
    CreditCard,
    ArrowUpCircle,
    ArrowDownCircle,
    History
} from "lucide-react"
import { cn } from "@/lib/utils"

export default async function TransactionsPage() {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/auth/login")
    }

    const transactionRepo = new CreditTransactionRepository()
    const transactions = await transactionRepo.listByUserId(user.id)

    // Compute stats
    const totalEarned = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0)

    const totalSpent = Math.abs(transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0))

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50/30">
            <div className="p-6 lg:p-12 space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 1. Summary Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        icon={CreditCard}
                        label="Current Balance"
                        value={`${user.credits_balance} ⭐`}
                        subLabel="Available credits"
                        color="text-primary"
                        bgColor="bg-primary/5"
                    />
                    <StatCard
                        icon={ArrowUpCircle}
                        label="Total Earned"
                        value={`${totalEarned} ⭐`}
                        subLabel="Lifetime additions"
                        color="text-emerald-600"
                        bgColor="bg-emerald-50"
                    />
                    <StatCard
                        icon={ArrowDownCircle}
                        label="Total Spent"
                        value={`${totalSpent} ⭐`}
                        subLabel="Lifetime usage"
                        color="text-rose-600"
                        bgColor="bg-rose-50"
                    />
                </div>

                {/* 2. Transaction Feed */}
                <div className="bg-white rounded-[2.5rem] p-4 lg:p-10 shadow-xl shadow-slate-200/40 space-y-10 border border-slate-100">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-2 px-2">
                        <div className="space-y-1.5 text-center md:text-left">
                            <h2 className="text-2xl font-black font-outfit text-slate-900 leading-none flex items-center justify-center md:justify-start gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl text-white">
                                    <History className="w-5 h-5" />
                                </div>
                                Transaction Ledger
                            </h2>
                            <p className="text-sm font-medium text-slate-400">Deep history of your StarCredit activity</p>
                        </div>
                    </div>

                    <TransactionFeed transactions={transactions.map(t => ({ ...t }))} />
                </div>
            </div>

            <footer className="mt-auto py-10 text-center text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] border-t bg-white/50 backdrop-blur-sm">
                © 2026 IELTS Lover. &nbsp; • &nbsp; Precision Excellence
            </footer>
        </div>
    )
}

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    subLabel: string;
    color: string;
    bgColor: string;
}

function StatCard({ icon: Icon, label, value, subLabel, color, bgColor }: StatCardProps) {
    return (
        <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-2xl transition-colors duration-500", bgColor, color)}>
                    <Icon size={20} />
                </div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                    {label}
                </div>
            </div>
            <div className="space-y-1">
                <div className="text-3xl font-black font-outfit text-slate-900 tracking-tight">{value}</div>
                <div className="text-[11px] font-medium text-slate-400 leading-tight">{subLabel}</div>
            </div>
        </div>
    )
}
