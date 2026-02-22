"use client"

import React, { useEffect, useState } from "react"
import {
    DollarSign,
    Cpu,
    TrendingUp,
    Coins,
    BarChart3,
    Zap,
    Clock,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    ShieldCheck,
    PenTool,
    Mic2,
    RefreshCw,
    MessageSquare,
    Target,
    Image,
    FileText,
    Calculator,
    Sparkles,
    Settings2,
    Package,
    Loader2
} from "lucide-react"
import { getAICostAnalytics, getModelPricingList, updateModelPricing, getRollingAICostSummaries, generateAndSeedPackages } from "../actions"
import { AIModelPricing, AICostSummary } from "@/repositories/interfaces"
import { NumericInput } from "@/components/global/numeric-input"
import { useNotification } from "@/lib/contexts/notification-context"
import { PulseLoader } from "@/components/global/pulse-loader"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FEATURE_KEYS, AI_METHODS } from "@/lib/constants"

function getServiceIcon(key: string) {
    switch (key) {
        case FEATURE_KEYS.WRITING_EVALUATION:
        case AI_METHODS.GENERATE_WRITING_REPORT:
            return { icon: PenTool, color: "text-purple-600", bg: "bg-purple-50" }
        case FEATURE_KEYS.SPEAKING_EVALUATION:
            return { icon: Mic2, color: "text-blue-600", bg: "bg-blue-50" }
        case FEATURE_KEYS.TEXT_REWRITER:
        case AI_METHODS.REWRITE_CONTENT:
            return { icon: RefreshCw, color: "text-indigo-600", bg: "bg-indigo-50" }
        case FEATURE_KEYS.AI_TUTOR_CHAT:
            return { icon: MessageSquare, color: "text-sky-600", bg: "bg-sky-50" }
        case FEATURE_KEYS.WEAKNESS_ANALYSIS:
        case AI_METHODS.ANALYZE_WEAKNESSES:
            return { icon: Target, color: "text-amber-600", bg: "bg-amber-50" }
        case FEATURE_KEYS.CHART_IMAGE_ANALYSIS:
        case AI_METHODS.ANALYZE_CHART_IMAGE:
            return { icon: Image, color: "text-emerald-600", bg: "bg-emerald-50" }
        case FEATURE_KEYS.DETAILED_CORRECTION:
        case AI_METHODS.GENERATE_CORRECTION:
            return { icon: FileText, color: "text-rose-600", bg: "bg-rose-50" }
        default:
            return { icon: Zap, color: "text-slate-500", bg: "bg-slate-50" }
    }
}

export default function AICostsPage() {
    const [analytics, setAnalytics] = useState<any>(null)
    const [rollingSummaries, setRollingSummaries] = useState<{ last7Days: AICostSummary; last30Days: AICostSummary } | null>(null)
    const [pricing, setPricing] = useState<AIModelPricing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activePeriod, setActivePeriod] = useState<7 | 30>(7)
    const [targetMargin, setTargetMargin] = useState(60)
    const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
    const [isGenerating, setIsGenerating] = useState(false)
    const [customPrices, setCustomPrices] = useState<Record<number, number>>({})
    const { notifySuccess, notifyError } = useNotification()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setIsLoading(true)
        try {
            const [analyticsData, pricingData, rollingData] = await Promise.all([
                getAICostAnalytics(30),
                getModelPricingList(),
                getRollingAICostSummaries()
            ])
            setAnalytics(analyticsData)
            setPricing(pricingData)
            setRollingSummaries(rollingData)
        } catch (error) {
            console.error(error)
            notifyError("Error", "Failed to load AI cost data")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleUpdatePricing(id: string, field: "input_price_per_million" | "output_price_per_million", value: number) {
        // Check if value actually changed
        const currentModel = pricing.find(p => p.id === id)
        if (currentModel && Number(currentModel[field]) === value) return

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
            <div className="p-8 max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-1">
                        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
                        <div className="h-4 w-64 bg-slate-50 rounded animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-slate-50 rounded-[2rem] border border-slate-100 animate-pulse" />
                    ))}
                </div>
                <div className="h-64 bg-slate-50 rounded-[2.5rem] border border-slate-100 animate-pulse" />
            </div>
        )
    }

    const currentRolling = activePeriod === 7 ? rollingSummaries?.last7Days : rollingSummaries?.last30Days

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {/* 1. Header & Quick Toggles */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Cpu size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black font-outfit text-slate-900 tracking-tight">AI Cost Controller</h1>
                    </div>
                    <p className="text-sm font-bold text-slate-400">Manage token budgets, model pricing and platform usage</p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-full bg-white border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 gap-2">
                                <ShieldCheck size={14} />
                                Market Rates
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] border-none">
                            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <Cpu size={140} />
                                </div>

                                <div className="relative z-10 space-y-8">
                                    <div className="space-y-1">
                                        <DialogHeader>
                                            <DialogTitle className="text-sm font-black uppercase tracking-[0.2em] text-primary">Token Pricing</DialogTitle>
                                        </DialogHeader>
                                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                                            Rates are per 1M tokens. Changes effect margin calculations instantly.
                                        </p>
                                    </div>

                                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {pricing.map((model) => (
                                            <div key={model.id} className="space-y-3 group/model">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-200">{model.model_name}</span>
                                                    </div>
                                                    {updatingIds.has(model.id) && <PulseLoader size="sm" color="primary" />}
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 focus-within:bg-white/10 transition-colors">
                                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Input</p>
                                                        <div className="flex items-center text-primary">
                                                            <span className="text-xs font-black mr-0.5">$</span>
                                                            <NumericInput
                                                                value={Number(model.input_price_per_million)}
                                                                onChange={() => { }}
                                                                onCommit={(val) => handleUpdatePricing(model.id, "input_price_per_million", val)}
                                                                className="h-6 border-none bg-transparent focus-visible:ring-0 transition-all text-left font-black text-sm p-0 text-white placeholder-slate-600"
                                                                step={0.01}
                                                                isFloat={true}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 focus-within:bg-white/10 transition-colors">
                                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Output</p>
                                                        <div className="flex items-center text-emerald-400">
                                                            <span className="text-xs font-black mr-0.5">$</span>
                                                            <NumericInput
                                                                value={Number(model.output_price_per_million)}
                                                                onChange={() => { }}
                                                                onCommit={(val) => handleUpdatePricing(model.id, "output_price_per_million", val)}
                                                                className="h-6 border-none bg-transparent focus-visible:ring-0 transition-all text-left font-black text-sm p-0 text-white placeholder-slate-600"
                                                                step={0.01}
                                                                isFloat={true}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">System v1.02</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Sync</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <div className="flex bg-slate-100 p-1 rounded-full">
                        {[7, 30].map((p) => (
                            <button
                                key={p}
                                onClick={() => setActivePeriod(p as 7 | 30)}
                                className={cn(
                                    "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                    activePeriod === p ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                                )}
                            >
                                {p} Days Rolling
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. Rolling KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    icon={DollarSign}
                    label="Est. Cost (USD)"
                    value={`$${Number(currentRolling?.total_cost_usd || 0).toFixed(4)}`}
                    trend="+12%"
                    isPositive={false}
                    color="text-rose-600"
                    bgColor="bg-rose-50"
                />
                <KPICard
                    icon={Zap}
                    label="Total AI Calls"
                    value={(currentRolling?.total_calls || 0).toLocaleString()}
                    trend="-3%"
                    isPositive={true}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                />
                <KPICard
                    icon={Coins}
                    label="Credits Charged"
                    value={(currentRolling?.total_credits_charged || 0).toLocaleString()}
                    color="text-indigo-600"
                    bgColor="bg-indigo-50"
                />
                <KPICard
                    icon={Clock}
                    label="Avg Latency"
                    value={`${currentRolling?.avg_duration_ms || 0}ms`}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
            </div>

            {/* 3. Feature Breakdown */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[1.25rem] bg-slate-100 text-slate-600 flex items-center justify-center">
                            <BarChart3 size={18} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black font-outfit text-slate-900 tracking-tight">Feature Economics</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Search size={14} className="text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Filter size={14} className="text-slate-400" />
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group/panel transition-all hover:shadow-xl hover:shadow-slate-200/50">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-50 bg-slate-50/30">
                                    <th className="text-left px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">Service Area</th>
                                    <th className="text-center px-4 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">Volume</th>
                                    <th className="text-right px-4 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">Cost (USD)</th>
                                    <th className="text-right px-4 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">Credits</th>
                                    <th className="text-right px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">ROI Index</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {analytics?.byFeature?.map((f: any) => {
                                    const costPerCredit = f.total_credits_charged > 0
                                        ? f.total_cost_usd / f.total_credits_charged
                                        : 0
                                    return (
                                        <tr key={f.feature_key} className="group/row hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const config = getServiceIcon(f.feature_key)
                                                    const Icon = config.icon
                                                    return (
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                                                config.bg, config.color
                                                            )}>
                                                                <Icon size={14} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                                                    {f.feature_key.replace(/_/g, " ")}
                                                                </span>
                                                                <span className="text-[9px] font-bold text-slate-400">Active Module</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })()}
                                            </td>
                                            <td className="text-center px-4 py-4">
                                                <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-100 font-bold text-slate-600 px-2 py-0">
                                                    {f.call_count.toLocaleString()}
                                                </Badge>
                                            </td>
                                            <td className="text-right px-4 py-4">
                                                <span className="text-xs font-black text-rose-600">${f.total_cost_usd.toFixed(4)}</span>
                                            </td>
                                            <td className="text-right px-4 py-4">
                                                <span className="text-xs font-black text-indigo-600">{f.total_credits_charged.toLocaleString()}</span>
                                            </td>
                                            <td className="text-right px-6 py-4">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-black text-emerald-600">${costPerCredit.toFixed(5)}</span>
                                                    <span className="text-[9px] font-bold text-slate-300">per credit</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 4. Pricing Economics Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[1.25rem] bg-rose-100 text-rose-600 flex items-center justify-center">
                            <Calculator size={18} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black font-outfit text-slate-900 tracking-tight">Pricing Strategy</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Key Metrics */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all h-full">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Burn Rate Logic</span>
                                <h3 className="text-lg font-black font-outfit text-slate-900">Credit Break-even</h3>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Cost per 1 Credit</span>
                                    <Badge variant="outline" className="bg-white border-slate-200 text-primary font-bold">USD</Badge>
                                </div>
                                <div className="text-2xl font-black text-slate-900">${(() => {
                                    const costPerCredit = (currentRolling?.total_credits_charged || 0) > 0
                                        ? Number(currentRolling?.total_cost_usd || 0) / Number(currentRolling?.total_credits_charged)
                                        : 0
                                    return costPerCredit.toFixed(6)
                                })()}</div>
                                <p className="text-[9px] font-bold text-slate-400 mt-1">Weighted average across all AI models</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                    <span>Model Accuracy</span>
                                    <span className="text-emerald-500">99.9%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[99.9%]" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <div className="flex items-center gap-2 text-primary">
                                <Sparkles size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">AI Projected Margin</span>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Calculator */}
                    <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-1 flex flex-col sm:flex-row shadow-sm">
                        {/* Margin Selector */}
                        <div className="sm:w-1/2 p-8 space-y-8 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-200/50">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Settings2 size={16} className="text-primary" />
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Profit Target</h4>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                                    Set margin to calculate pricing levels.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <NumericInput
                                        value={targetMargin}
                                        onChange={() => { }}
                                        onCommit={(val) => { setTargetMargin(Math.max(1, val)); setCustomPrices({}) }}
                                        className="text-3xl font-black text-primary font-outfit w-24 h-12 border-none bg-transparent focus-visible:ring-0 p-0"
                                    />
                                    <span className="text-2xl font-black text-primary font-outfit">%</span>
                                    <span className="text-[10px] font-black uppercase text-slate-400 ml-auto">Margin</span>
                                </div>
                                <p className="text-[9px] font-bold text-slate-400">Enter any margin percentage. No limit.</p>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="sm:w-1/2 bg-white rounded-[2.25rem] m-1 p-6 space-y-5 shadow-sm border border-slate-100/50">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Suggestions</h4>

                            <div className="space-y-3">
                                {[100, 500, 1000].map((stars) => {
                                    const costPerCredit = (currentRolling?.total_credits_charged || 0) > 0
                                        ? Number(currentRolling?.total_cost_usd || 0) / Number(currentRolling?.total_credits_charged)
                                        : 0
                                    const suggestsPrice = costPerCredit * (1 + targetMargin / 100) * stars
                                    const displayPrice = customPrices[stars] ?? Number(suggestsPrice.toFixed(2))

                                    return (
                                        <div key={stars} className="flex items-center justify-between gap-4 group/item">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                    <Coins size={12} />
                                                </div>
                                                <span className="text-[11px] font-black text-slate-700">{stars} Stars</span>
                                            </div>
                                            <div className="flex items-center gap-0.5">
                                                <span className="text-xs font-black text-slate-900">$</span>
                                                <NumericInput
                                                    value={displayPrice}
                                                    onChange={() => { }}
                                                    onCommit={(val) => setCustomPrices(prev => ({ ...prev, [stars]: val }))}
                                                    isFloat={true}
                                                    step={0.01}
                                                    className="h-6 w-16 border-none bg-transparent focus-visible:ring-0 text-right font-black text-xs p-0 text-slate-900"
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="bg-emerald-50 rounded-2xl p-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                                    <TrendingUp size={16} />
                                </div>
                                <p className="text-[9px] font-bold text-emerald-700 leading-tight text-balance">
                                    Prevents negative margin.
                                </p>
                            </div>

                            <Button
                                className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest gap-2 h-10 shadow-sm"
                                disabled={isGenerating}
                                onClick={async () => {
                                    setIsGenerating(true)
                                    try {
                                        const costPerCredit = (currentRolling?.total_credits_charged || 0) > 0
                                            ? Number(currentRolling?.total_cost_usd || 0) / Number(currentRolling?.total_credits_charged)
                                            : 0
                                        const tiers = [100, 500, 1000].map(stars => {
                                            const suggestsPrice = costPerCredit * (1 + targetMargin / 100) * stars
                                            return {
                                                credits: stars,
                                                price: customPrices[stars] ?? Number(suggestsPrice.toFixed(2))
                                            }
                                        })
                                        await generateAndSeedPackages(tiers)
                                        notifySuccess("Packages Created", "New credit packages generated with AI content.")
                                    } catch (error) {
                                        console.error(error)
                                        notifyError("Error", "Failed to generate packages.")
                                    } finally {
                                        setIsGenerating(false)
                                    }
                                }}
                            >
                                {isGenerating ? (
                                    <><Loader2 size={14} className="animate-spin" /> Generating...</>
                                ) : (
                                    <><Package size={14} /> Generate Packages</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-10 flex items-center justify-between opacity-30">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
                        AI Cost Accounting Active
                    </p>
                </div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
                    IELTS Lover v1.2
                </p>
            </div>
        </div>
    )
}

function KPICard({ icon: Icon, label, value, trend, isPositive, color, bgColor }: {
    icon: React.ElementType
    label: string
    value: string
    trend?: string
    isPositive?: boolean
    color: string
    bgColor: string
}) {
    return (
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                <Icon size={48} strokeWidth={2.5} />
            </div>

            <div className="flex flex-col relative z-10">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500", bgColor)}>
                    <Icon className={cn("w-5 h-5", color)} strokeWidth={2.5} />
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
                        {trend && (
                            <div className={cn(
                                "flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-full",
                                isPositive ? "text-emerald-500 bg-emerald-50" : "text-rose-500 bg-rose-50"
                            )}>
                                {isPositive ? <ArrowUpRight size={10} strokeWidth={3} className="mr-0.5" /> : <ArrowDownRight size={10} strokeWidth={3} className="mr-0.5" />}
                                {trend}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
