"use client"

import React, { useEffect, useState } from "react"
import { AdminDynamicTitle } from "@/components/admin/dynamic-title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Settings, Save, AlertCircle, Coins, Zap } from "lucide-react"
import { getSystemSettings, updateSystemSetting, getFeaturePricing, updateFeaturePricing } from "../actions"
import { SystemSetting, FeaturePricing } from "@/repositories/interfaces"
import { NumericInput } from "@/components/global/numeric-input"
import { useNotification } from "@/lib/contexts/notification-context"
import { PulseLoader } from "@/components/global/pulse-loader"

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSetting[]>([])
    const [pricing, setPricing] = useState<FeaturePricing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingKeys, setUpdatingKeys] = useState<Set<string>>(new Set())
    const { notifySuccess, notifyError } = useNotification()

    useEffect(() => {
        fetchAllData()
    }, [])

    async function fetchAllData() {
        setIsLoading(true)
        try {
            const [settingsData, pricingData] = await Promise.all([
                getSystemSettings(),
                getFeaturePricing()
            ])
            setSettings(settingsData)
            setPricing(pricingData)
        } catch (error) {
            console.error(error)
            notifyError("Error", "Failed to fetch settings/pricing")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleUpdateSetting(key: string, value: any) {
        setUpdatingKeys(prev => new Set(prev).add(key))
        try {
            await updateSystemSetting(key, value)
            notifySuccess("Updated", `${key} updated successfully.`)
            // Refresh settings only
            const data = await getSystemSettings()
            setSettings(data)
        } catch (error) {
            console.error(error)
            notifyError("Error", "Failed to update setting")
        } finally {
            setUpdatingKeys(prev => {
                const next = new Set(prev)
                next.delete(key)
                return next
            })
        }
    }

    async function handleUpdatePricing(key: string, cost: number) {
        setUpdatingKeys(prev => new Set(prev).add(key))
        try {
            await updateFeaturePricing(key, cost)
            notifySuccess("Updated", `Pricing for ${key} updated.`)
            // Refresh pricing only
            const data = await getFeaturePricing()
            setPricing(data)
        } catch (error) {
            console.error(error)
            notifyError("Error", "Failed to update pricing")
        } finally {
            setUpdatingKeys(prev => {
                const next = new Set(prev)
                next.delete(key)
                return next
            })
        }
    }

    if (isLoading) {
        return (
            <div className="p-8 max-w-5xl mx-auto space-y-12">
                <div className="space-y-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex items-center justify-between gap-8 py-4 border-b border-slate-50">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-10 w-32" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100/50">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                    <AlertCircle className="w-3 h-3 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Platform Configuration</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Live Sync</span>
                </div>
            </div>

            {/* Feature Pricing Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 font-outfit">Feature Costs (StarCredits)</h2>
                </div>
                <div className="space-y-0">
                    {pricing.map((item) => (
                        <div
                            key={item.id}
                            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-50 transition-all hover:bg-slate-50/50 -mx-4 px-4 rounded-lg"
                        >
                            <div className="space-y-0.5 flex-1">
                                <h4 className="font-black text-[9px] uppercase tracking-[0.15em] text-amber-600/80 flex items-center gap-2">
                                    <Zap className="w-3 h-3" />
                                    {item.feature_key.replace(/_/g, ' ')}
                                </h4>
                                <p className="text-[11px] font-semibold text-slate-500 max-w-lg leading-snug">
                                    Cost for using this feature per unit.
                                </p>
                            </div>
                            <div className="w-full md:w-24 flex items-center justify-end">
                                {updatingKeys.has(item.feature_key) ? (
                                    <div className="h-8 flex items-center justify-center w-full">
                                        <PulseLoader size="sm" color="primary" />
                                    </div>
                                ) : (
                                    <div className="relative group/input w-full">
                                        <NumericInput
                                            value={item.cost_per_unit}
                                            onChange={() => { }}
                                            onCommit={(val) => handleUpdatePricing(item.feature_key, val)}
                                            className="h-8 border-none bg-transparent focus-visible:ring-0 transition-all text-center font-black text-sm p-0 text-amber-700"
                                        />
                                        <div className="absolute inset-x-2 -bottom-px h-px bg-amber-100 group-focus-within/input:bg-amber-500 transition-colors" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* System Settings Section */}
            <section className="space-y-6 pt-10">
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 font-outfit">System Policies</h2>
                </div>
                <div className="space-y-0">
                    {settings.filter(s => s.setting_key !== 'DAILY_GRANT_PREMIUM').map((setting) => (
                        <div
                            key={setting.id}
                            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-50 transition-all hover:bg-slate-50/50 -mx-4 px-4 rounded-lg"
                        >
                            <div className="space-y-0.5 flex-1">
                                <h4 className="font-black text-[9px] uppercase tracking-[0.15em] text-primary/60">
                                    {setting.setting_key.replace(/_/g, ' ')}
                                </h4>
                                <p className="text-[11px] font-semibold text-slate-500 max-w-lg leading-snug">
                                    {setting.description}
                                </p>
                            </div>
                            <div className="w-full md:w-24 flex items-center justify-end">
                                {updatingKeys.has(setting.setting_key) ? (
                                    <div className="h-8 flex items-center justify-center w-full">
                                        <PulseLoader size="sm" color="primary" />
                                    </div>
                                ) : (
                                    <div className="relative group/input w-full">
                                        <NumericInput
                                            value={Number(setting.setting_value)}
                                            onChange={() => { }}
                                            onCommit={(val) => handleUpdateSetting(setting.setting_key, val)}
                                            className="h-8 border-none bg-transparent focus-visible:ring-0 transition-all text-center font-black text-sm p-0"
                                        />
                                        <div className="absolute inset-x-2 -bottom-px h-px bg-slate-100 group-focus-within/input:bg-primary transition-colors" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="pt-6 flex items-center justify-between opacity-30">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Admin Audit Active
                    </p>
                </div>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
                    IELTS Lover v1.0
                </p>
            </div>
        </div>
    )
}
