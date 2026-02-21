"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UserProfile } from "@/types"
import { createCreditRequest } from "@/app/teacher/actions"
import { PulseLoader } from "@/components/global/pulse-loader"

export function CreditRequestForm({ students }: { students: UserProfile[] }) {
    const [studentId, setStudentId] = useState("")
    const [amount, setAmount] = useState("")
    const [reason, setReason] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!studentId || !amount || !reason.trim()) return

        setIsLoading(true)
        setMessage(null)

        try {
            await createCreditRequest(studentId, parseInt(amount), reason)
            setMessage({ type: "success", text: "Credit request submitted successfully!" })
            setStudentId("")
            setAmount("")
            setReason("")
        } catch (error) {
            setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to submit request" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Request Credits for Student</h3>

            <div className="space-y-3">
                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Student</label>
                    <select
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none"
                        required
                    >
                        <option value="">Select a student...</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.full_name || s.email}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Amount (StarCredits)</label>
                    <Input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 50"
                        className="rounded-xl"
                        required
                    />
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Reason</label>
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Why does this student need credits?"
                        className="rounded-xl resize-none"
                        rows={3}
                        required
                    />
                </div>
            </div>

            {message && (
                <div className={`text-xs font-bold px-3 py-2 rounded-lg ${message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                    {message.text}
                </div>
            )}

            <Button
                type="submit"
                disabled={isLoading || !studentId || !amount || !reason.trim()}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black"
            >
                {isLoading ? <PulseLoader size="sm" /> : "Submit Request"}
            </Button>
        </form>
    )
}
