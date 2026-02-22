"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, Cpu, TrendingUp, Coins, BarChart3, Zap } from "lucide-react"
import { getAICostAnalytics, getModelPricingList, updateModelPricing } from "../actions"
import { AIModelPricing } from "@/repositories/interfaces"
import { NumericInput } from "@/components/global/numeric-input"
import { useNotification } from "@/lib/contexts/notification-context"
import { PulseLoader } from "@/components/global/pulse-loader"

export default function AICostsPage() {
    const [analytics, setAnalytics] = useState<any>(null)
    const [pricing, setPricing] = useState<AIModelPricing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
    const { notifySuccess, notifyError } = useNotification()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setIsLoading(true)
        try {
            const [analyticsData, pricingData] = await Promise.all([
                getAICostAnalytics(30),
                getModelPricingList(),
            ])
            setAnalytics(analyticsData)
            setPricing(pricingData)
        } catch (error) {
            console.error(error)
            notifyError("Error", "Failed to load AI cost data")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleUpdatePricing(id: string, field: "input_price_per_million" | "output_price_per_million", value: number) {
        setUpdatingIds(prev => new Set(prev).add(id))
        try {
            await updateModelPricing(id, { [field]: value })
            notifySuccess("Updated", "Model pricing updated.")
            const data = await getModelPricingList()
            setPricing(data)
        } catch (error) {
            console.error(error)
            notifyError("Error", "Failed to update pricing")
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }

    if (isLoading) {
        return (
            <div className="p-8 max-w-5xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
            </div>
        )
    }

    const summary = analytics?.summary
    const featureCostPerCredit = summary?.cost_per_credit ?? 0

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100/50">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                    <BarChart3 className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Last 30 Days</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Live Data</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                    icon={DollarSign}
                    label="Total AI Spend"
                    value={`$${(summary?.total_cost_usd ?? 0).toFixed(4)}`}
                    color="text-red-500"
                    bgColor="bg-red-50"
                />
                <KPICard
                    icon={Coins}
                    label="Credits Consumed"
                    value={summary?.total_credits_charged?.toLocaleString() ?? "0"}
                    color="text-amber-500"
                    bgColor="bg-amber-50"
                />
                <KPICard
                    icon={TrendingUp}
                    label="Cost Per Credit"
                    value={`$${featureCostPerCredit.toFixed(6)}`}
                    color="text-blue-500"
                    bgColor="bg-blue-50"
                />
                <KPICard
                    icon={Cpu}
                    label="Total API Calls"
                    value={summary?.total_calls?.toLocaleString() ?? "0"}
                    color="text-purple-500"
                    bgColor="bg-purple-50"
                />
            </div>

            {/* Feature Breakdown */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 font-outfit">Cost by Feature</h2>
                </div>

                {analytics?.byFeature?.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Feature</th>
                                    <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Calls</th>
                                    <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Avg Tokens</th>
                                    <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Total Cost</th>
                                    <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Credits</th>
                                    <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Cost/Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.byFeature.map((f: any) => {
                                    const costPerCredit = f.total_credits_charged > 0
                                        ? f.total_cost_usd / f.total_credits_charged
                                        : 0
                                    return (
                                        <tr key={f.feature_key} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-primary/80">
                                                    {f.feature_key.replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            <td className="text-right px-4 py-3 font-bold text-slate-700">{f.call_count}</td>
                                            <td className="text-right px-4 py-3 font-bold text-slate-500">{(Number(f.avg_tokens) || 0).toLocaleString()}</td>
                                            <td className="text-right px-4 py-3 font-black text-red-600">${f.total_cost_usd.toFixed(4)}</td>
                                            <td className="text-right px-4 py-3 font-bold text-amber-600">{f.total_credits_charged}</td>
                                            <td className="text-right px-4 py-3 font-bold text-blue-600">${costPerCredit.toFixed(6)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400 text-sm font-semibold">
                        No AI usage data yet. Usage will appear here after AI features are used.
                    </div>
                )}
            </section>

            {/* Model Pricing Editor */}
            <section className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-500" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 font-outfit">Model Pricing (USD / 1M Tokens)</h2>
                </div>
                <div className="space-y-0">
                    {pricing.map((model) => (
                        <div
                            key={model.id}
                            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-50 transition-all hover:bg-slate-50/50 -mx-4 px-4 rounded-lg"
                        >
                            <div className="space-y-0.5 flex-1">
                                <h4 className="font-black text-[10px] uppercase tracking-[0.15em] text-purple-600/80 flex items-center gap-2">
                                    <Cpu className="w-3 h-3" />
                                    {model.model_name}
                                </h4>
                                <p className="text-[11px] font-semibold text-slate-500">
                                    {model.is_active ? "Active" : "Inactive"}
                                </p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Input</div>
                                    {updatingIds.has(model.id) ? (
                                        <PulseLoader size="sm" color="primary" />
                                    ) : (
                                        <div className="relative group/input w-24">
                                            <NumericInput
                                                value={Number(model.input_price_per_million)}
                                                onChange={() => { }}
                                                onCommit={(val) => handleUpdatePricing(model.id, "input_price_per_million", val)}
                                                className="h-8 border-none bg-transparent focus-visible:ring-0 transition-all text-center font-black text-sm p-0 text-purple-700"
                                                step={0.01}
                                            />
                                            <div className="absolute inset-x-2 -bottom-px h-px bg-purple-100 group-focus-within/input:bg-purple-500 transition-colors" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Output</div>
                                    {updatingIds.has(model.id) ? (
                                        <PulseLoader size="sm" color="primary" />
                                    ) : (
                                        <div className="relative group/input w-24">
                                            <NumericInput
                                                value={Number(model.output_price_per_million)}
                                                onChange={() => { }}
                                                onCommit={(val) => handleUpdatePricing(model.id, "output_price_per_million", val)}
                                                className="h-8 border-none bg-transparent focus-visible:ring-0 transition-all text-center font-black text-sm p-0 text-purple-700"
                                                step={0.01}
                                            />
                                            <div className="absolute inset-x-2 -bottom-px h-px bg-purple-100 group-focus-within/input:bg-purple-500 transition-colors" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="pt-6 flex items-center justify-between opacity-30">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
                        AI Cost Accounting Active
                    </p>
                </div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
                    IELTS Lover v1.0
                </p>
            </div>
        </div>
    )
}

function KPICard({ icon: Icon, label, value, color, bgColor }: {
    icon: React.ElementType
    label: string
    value: string
    color: string
    bgColor: string
}) {
    return (
        <Card className="border-slate-100 shadow-none hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                        <p className="text-lg font-black text-slate-900 tracking-tight">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
