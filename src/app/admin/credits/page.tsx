"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Save, MoveUp, MoveDown, Zap, Shield, Award, Crown, Sparkles, LayoutGrid, Package, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NumericInput } from "@/components/global/numeric-input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useNotification } from "@/lib/contexts/notification-context"
import {
    getCreditPackages,
    createCreditPackage,
    updateCreditPackage,
    deleteCreditPackage,
    seedCreditPackages
} from "../actions"
import { CreditPackage } from "@/types"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import { PulseLoader } from "@/components/global/pulse-loader"

function LoadingSkeleton() {
    return (
        <div className="p-8 space-y-10 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100/50">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-96 rounded-[2rem] bg-slate-50 border border-slate-100 animate-pulse" />
                ))}
            </div>
        </div>
    )
}

function getTierConfig(type: string) {
    switch (type.toLowerCase()) {
        case 'pro':
            return {
                icon: Award,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "border-indigo-100",
                accent: "bg-indigo-600",
                gradient: "from-indigo-50/50 to-transparent"
            }
        case 'master':
            return {
                icon: Crown,
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-100",
                accent: "bg-amber-600",
                gradient: "from-amber-50/50 to-transparent"
            }
        default:
            return {
                icon: Shield,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
                accent: "bg-blue-600",
                gradient: "from-blue-50/50 to-transparent"
            }
    }
}

export default function AdminCreditsPage() {
    const { notifySuccess, notifyError } = useNotification()
    const [packages, setPackages] = useState<CreditPackage[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        loadPackages()
    }, [])

    const loadPackages = async () => {
        try {
            const data = await getCreditPackages()
            setPackages(data)
        } catch (error) {
            notifyError("Loading Failed", "Failed to load credit packages")
        } finally {
            setLoading(false)
        }
    }

    const handleSeed = async () => {
        setUpdatingIds(prev => new Set(prev).add('seed'))
        try {
            await seedCreditPackages()
            notifySuccess("Database Seeded", "Default credit packages have been initialized")
            loadPackages()
        } catch (error) {
            notifyError("Seed Failed", "Failed to seed credit packages database")
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev)
                next.delete('seed')
                return next
            })
        }
    }

    const handleAddPackage = async () => {
        setUpdatingIds(prev => new Set(prev).add('add'))
        const newPkg: Omit<CreditPackage, "id" | "created_at" | "updated_at"> = {
            name: "New Package",
            credits: 100,
            bonus_credits: 0,
            price: 5.00,
            tagline: "Description here",
            type: "starter",
            is_active: true,
            display_order: packages.length + 1
        }

        try {
            await createCreditPackage(newPkg)
            notifySuccess("Package Added", "New credit package created successfully")
            loadPackages()
        } catch (error) {
            notifyError("Add Failed", "Failed to add new credit package")
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev)
                next.delete('add')
                return next
            })
        }
    }

    const handleUpdate = async (id: string, updates: Partial<CreditPackage>) => {
        setUpdatingIds(prev => new Set(prev).add(id))
        try {
            await updateCreditPackage(id, updates)
            notifySuccess("Package Updated", "Credit package updated successfully")
            loadPackages()
        } catch (error) {
            notifyError("Update Failed", "Failed to update credit package")
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return

        setUpdatingIds(prev => new Set(prev).add(id))
        try {
            await deleteCreditPackage(id)
            notifySuccess("Package Deleted", "Credit package has been removed")
            loadPackages()
        } catch (error) {
            notifyError("Delete Failed", "Failed to delete credit package")
        } finally {
            setUpdatingIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }

    if (loading) return <LoadingSkeleton />

    return (
        <div className="p-8 space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100/50">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Package size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black font-outfit text-slate-900 tracking-tight">Credit Packages</h1>
                    </div>
                    <p className="text-sm font-bold text-slate-400">Design and manage user store credit bundles</p>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                    <Button
                        variant="outline"
                        onClick={handleSeed}
                        className="rounded-full bg-white border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 gap-2 h-10 px-6"
                        disabled={updatingIds.has('seed')}
                    >
                        {updatingIds.has('seed') ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                        Seed Database
                    </Button>
                    <Button
                        onClick={handleAddPackage}
                        className="rounded-full bg-primary text-white font-black uppercase text-[10px] tracking-widest gap-2 h-10 px-6 shadow-sm hover:shadow-md transition-all active:scale-95"
                        disabled={updatingIds.has('add')}
                    >
                        {updatingIds.has('add') ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                        New Package
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {packages.map((pkg) => {
                    const tier = getTierConfig(pkg.type)
                    const Icon = tier.icon

                    return (
                        <div key={pkg.id} className={cn(
                            "group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 flex flex-col",
                            !pkg.is_active && "opacity-60 grayscale-[0.5]",
                            updatingIds.has(pkg.id) && "ring-2 ring-primary/20"
                        )}>
                            {/* Visual Background Accent */}
                            <div className={cn("absolute top-0 inset-x-0 h-32 bg-gradient-to-b opacity-[0.05] group-hover:opacity-[0.1] transition-opacity", tier.gradient)} />

                            {/* Card Content */}
                            <div className="p-8 relative z-10 flex flex-col flex-1 h-full">
                                {/* Top Badges & Actions */}
                                <div className="flex items-start justify-between mb-8">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500", tier.bg, tier.color)}>
                                        <Icon size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-100 ring-1 ring-inset ring-white/50">
                                            <Switch
                                                checked={pkg.is_active}
                                                onCheckedChange={(checked) => handleUpdate(pkg.id, { is_active: checked })}
                                                disabled={updatingIds.has(pkg.id)}
                                                className="scale-75"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleDelete(pkg.id)}
                                            disabled={updatingIds.has(pkg.id)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Main Identity Section */}
                                <div className="space-y-4 mb-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <Badge variant="outline" className={cn("rounded-full font-black uppercase text-[8px] tracking-[0.2em] px-2 py-0.5", tier.color, tier.bg, "border-transparent")}>
                                                {pkg.type}
                                            </Badge>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                                Order #{pkg.display_order}
                                            </span>
                                        </div>
                                        <Input
                                            value={pkg.name}
                                            onChange={(e) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, name: e.target.value } : p))}
                                            onBlur={(e) => handleUpdate(pkg.id, { name: e.target.value })}
                                            className="text-2xl font-black font-outfit text-slate-900 bg-transparent border-none p-0 h-auto focus-visible:ring-0 placeholder:text-slate-200"
                                            placeholder="Package Name"
                                        />
                                    </div>
                                    <div className="relative group/tag">
                                        <Input
                                            value={pkg.tagline}
                                            onChange={(e) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, tagline: e.target.value } : p))}
                                            onBlur={(e) => handleUpdate(pkg.id, { tagline: e.target.value })}
                                            className="text-[11px] font-bold text-slate-400 bg-transparent border-none p-0 h-auto focus-visible:ring-0 placeholder:text-slate-200 uppercase tracking-wide italic"
                                            placeholder="Tagline or description..."
                                        />
                                        <div className="absolute -bottom-1 inset-x-0 h-[1.5px] bg-slate-100 group-focus-within/tag:bg-primary transition-all rounded-full scale-x-75 group-focus-within/tag:scale-x-100" />
                                    </div>
                                </div>

                                {/* Pricing & Credits Grid */}
                                <div className="grid grid-cols-2 gap-3 mt-auto">
                                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 pt-3 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all duration-300">
                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 mb-2">Base Stars</span>
                                        <div className="flex items-center gap-1">
                                            <NumericInput
                                                value={pkg.credits}
                                                onChange={(val) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, credits: val } : p))}
                                                onCommit={(val) => handleUpdate(pkg.id, { credits: val })}
                                                className="h-8 border-none bg-transparent focus-visible:ring-0 p-0 text-lg font-black text-slate-900 w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 pt-3 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all duration-300">
                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-indigo-400 mb-2">Bonus Bonus</span>
                                        <div className="flex items-center gap-1">
                                            <NumericInput
                                                value={pkg.bonus_credits}
                                                onChange={(val) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, bonus_credits: val } : p))}
                                                onCommit={(val) => handleUpdate(pkg.id, { bonus_credits: val })}
                                                className="h-8 border-none bg-transparent focus-visible:ring-0 p-0 text-lg font-black text-indigo-600 w-full"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 bg-primary/5 rounded-2xl border border-primary/10 p-4 pt-3 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all duration-300 ring-1 ring-inset ring-transparent hover:ring-primary/20">
                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-primary/60 mb-2">Retail Price (USD)</span>
                                        <div className="flex items-center gap-1.5 leading-none">
                                            <span className="text-xl font-black text-primary font-outfit">$</span>
                                            <NumericInput
                                                isFloat
                                                step="0.01"
                                                value={pkg.price}
                                                onChange={(val) => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, price: val } : p))}
                                                onCommit={(val) => handleUpdate(pkg.id, { price: val })}
                                                className="h-9 border-none bg-transparent focus-visible:ring-0 p-0 text-2xl font-black text-slate-900 w-full font-outfit"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-1.5 pt-1">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Tier Category</Label>
                                        <select
                                            className="w-full h-10 bg-white border border-slate-100 rounded-xl px-4 text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer shadow-sm"
                                            value={pkg.type}
                                            onChange={(e) => handleUpdate(pkg.id, { type: e.target.value as any })}
                                            disabled={updatingIds.has(pkg.id)}
                                        >
                                            <option value="starter">Starter Economy</option>
                                            <option value="pro">Pro Advantage</option>
                                            <option value="master">Elite Master</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Saving/Loading Indicator */}
                            {updatingIds.has(pkg.id) && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center animate-in fade-in duration-300">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className={cn("w-12 h-12 rounded-2xl animate-bounce flex items-center justify-center shadow-lg", tier.bg, tier.color)}>
                                            <Icon size={24} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Syncing...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="pt-10 flex items-center justify-between opacity-30 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Live Pricing Engine
                    </p>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    IELTS Lover v1.23
                </p>
            </div>
        </div>
    )
}
