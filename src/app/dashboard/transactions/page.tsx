"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { CreditTransactionRepository } from "@/repositories/transaction.repository"
import { TransactionTable } from "@/components/dashboard/transaction-table"
import { redirect } from "next/navigation"

export default async function TransactionsPage() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    const transactionRepo = new CreditTransactionRepository()
    const transactions = await transactionRepo.listByUserId(user.id)

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-8 lg:p-12 space-y-8 max-w-5xl mx-auto">
                {/* Header removed to avoid duplication with DynamicTitle */}

                {/* Table */}
                <TransactionTable transactions={transactions} />
            </div>

            <footer className="mt-auto py-8 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] border-t bg-white/30">
                © 2026 IELTS Lover. &nbsp; Terms · Privacy · Contact us
            </footer>
        </div>
    )
}
