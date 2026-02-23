"use client"

import React, { useEffect, useState } from "react"
import { AdminDynamicTitle } from "@/components/admin/dynamic-title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Settings,
    Save,
    AlertCircle,
    Coins,
    Zap,
    PenTool,
    Mic2,
    MessageSquare,
    BarChart3,
    ShieldCheck,
    Globe,
    Sparkles,
    ChevronRight,
    ArrowRight,
    Search,
    Filter,
    LayoutGrid,
    Target,
    Image,
    FileText,
    RefreshCw,
    Construction
} from "lucide-react"
import { getSystemSettings, updateSystemSetting, getFeaturePricing, updateFeaturePricing, toggleMaintenanceMode } from "../actions"
import { SystemSetting, FeaturePricing } from "@/repositories/interfaces"
import { NumericInput } from "@/components/global/numeric-input"
import { Switch } from "@/components/ui/switch"
import { NotificationDialog } from "@/components/global/notification-dialog"
import { useNotification } from "@/lib/contexts/notification-context"
import { PulseLoader } from "@/components/global/pulse-loader"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FEATURE_KEYS } from "@/lib/constants"

function getFeatureConfig(key: string) {
    if (key.includes('writing') || key.includes('correction') || key.includes('sentence') || key.includes('example_essay')) {
        return { icon: PenTool, color: "text-purple-600", bg: "bg-purple-50", category: "Writing" }
    }
    if (key.includes('speaking')) {
        return { icon: Mic2, color: "text-blue-600", bg: "bg-blue-50", category: "Speaking" }
    }
    if (key.includes('chat') || key.includes('tutor')) {
        return { icon: MessageSquare, color: "text-sky-600", bg: "bg-sky-50", category: "AI Assistant" }
    }
    if (key.includes('weakness') || key.includes('chart') || key.includes('test')) {
        return { icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", category: "Analytics & Tools" }
    }
    if (key.includes('rewriter')) {
        return { icon: RefreshCw, color: "text-indigo-600", bg: "bg-indigo-50", category: "Writing" }
    }
    return { icon: Zap, color: "text-amber-600", bg: "bg-amber-50", category: "Others" }
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSetting[]>([])
    const [pricing, setPricing] = useState<FeaturePricing[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingKeys, setUpdatingKeys] = useState<Set<string>>(new Set())
    const [maintenanceEnabled, setMaintenanceEnabled] = useState(false)
    const [togglingMaintenance, setTogglingMaintenance] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
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
            const maintenanceSetting = settingsData.find(s => s.setting_key === "MAINTENANCE_MODE")
            setMaintenanceEnabled(maintenanceSetting?.setting_value === true)
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

    function handleToggleMaintenance(enabled: boolean) {
        if (enabled) {
            setShowConfirmDialog(true)
            return
        }
        executeMaintenance(false)
    }

    async function executeMaintenance(enabled: boolean) {
        setShowConfirmDialog(false)
        setTogglingMaintenance(true)
        try {
            await toggleMaintenanceMode(enabled)
            setMaintenanceEnabled(enabled)
            notifySuccess(
                enabled ? "Maintenance ON" : "Maintenance OFF",
                enabled ? "Non-admin users are now blocked." : "Platform is back to normal."
            )
        } catch (error) {
            console.error(error)
            notifyError("Error", "Failed to toggle maintenance mode")
        } finally {
            setTogglingMaintenance(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-8 max-w-6xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100/50">
                    <div className="space-y-1">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    // Categorize features
    const categories: Record<string, FeaturePricing[]> = {}
    pricing.forEach(p => {
        const { category } = getFeatureConfig(p.feature_key)
        if (!categories[category]) categories[category] = []
        categories[category].push(p)
    })

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1.5 border-b border-slate-100/50">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                            <ShieldCheck size={14} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-2xl font-black font-outfit text-slate-900 tracking-tight">Platform Settings</h1>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400">Configure feature costs and system-wide policies</p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto opacity-50">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Guard Active</span>
                </div>
            </div>

            {/* Maintenance Mode Section */}
            <div className={cn(
                "rounded-2xl border p-5 transition-all duration-300",
                maintenanceEnabled
                    ? "bg-amber-50 border-amber-200 shadow-lg shadow-amber-100/50"
                    : "bg-white border-slate-100"
            )}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors",
                            maintenanceEnabled ? "bg-amber-200 text-amber-700" : "bg-slate-100 text-slate-400"
                        )}>
                            <Construction size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-sm font-black font-outfit text-slate-900 tracking-tight">Maintenance Mode</h2>
                            <p className="text-[10px] font-bold text-slate-400">
                                {maintenanceEnabled
                                    ? "Platform is in maintenance. Non-admin users are blocked."
                                    : "Enable to block all non-admin traffic during migrations or updates."
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        {maintenanceEnabled && (
                            <Badge className="bg-amber-200 text-amber-800 border-0 text-[8px] font-black uppercase tracking-widest animate-pulse">
                                Active
                            </Badge>
                        )}
                        {togglingMaintenance ? (
                            <PulseLoader size="sm" color="primary" />
                        ) : (
                            <Switch
                                checked={maintenanceEnabled}
                                onCheckedChange={handleToggleMaintenance}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Feature Pricing Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                        <Coins size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black font-outfit text-slate-900 tracking-tight">Feature Economics</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">StarCredits Spend Units</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {Object.entries(categories).map(([catName, items]) => (
                        <div key={catName} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 shrink-0">{catName}</h3>
                                <div className="h-px w-full bg-slate-50" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {items.map((item) => {
                                    const config = getFeatureConfig(item.feature_key)
                                    const Icon = config.icon
                                    return (
                                        <div
                                            key={item.id}
                                            className="group bg-white rounded-xl border border-slate-100 p-2.5 px-3 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/40 relative overflow-hidden flex items-center gap-3"
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 shrink-0 relative z-10",
                                                config.bg, config.color
                                            )}>
                                                <Icon size={14} strokeWidth={2.5} />
                                            </div>

                                            <div className="flex-1 min-w-0 relative z-10">
                                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate leading-none mb-0.5">
                                                    {item.feature_key.replace(/_/g, ' ')}
                                                </h4>
                                                <div className="flex items-center gap-1 opacity-40">
                                                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest truncate">AI Cost Unit</span>
                                                </div>
                                            </div>

                                            <div className="w-16 shrink-0 relative z-10">
                                                {updatingKeys.has(item.feature_key) ? (
                                                    <div className="h-7 flex items-center justify-center">
                                                        <PulseLoader size="sm" color="primary" />
                                                    </div>
                                                ) : (
                                                    <NumericInput
                                                        value={item.cost_per_unit}
                                                        onChange={() => { }}
                                                        onCommit={(val) => handleUpdatePricing(item.feature_key, val)}
                                                        className="h-7 border-none bg-slate-50/80 rounded-md focus-visible:ring-0 text-center font-black text-xs p-0 text-slate-900 shadow-inner group-hover:bg-white border group-hover:border-slate-100"
                                                    />
                                                )}
                                            </div>

                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Policies Section */}
            <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                        <Globe size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black font-outfit text-slate-900 tracking-tight">Global Policies</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Platform limits & issuance rules</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                    {settings.filter(s => s.setting_key !== 'DAILY_GRANT_PREMIUM' && s.setting_key !== 'MAINTENANCE_MODE').map((setting) => (
                        <div
                            key={setting.id}
                            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 hover:bg-slate-50/50 transition-colors"
                        >
                            <div className="space-y-0.5 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="font-black text-[9px] uppercase tracking-[0.15em] text-slate-400">
                                        {setting.setting_key.replace(/_/g, ' ')}
                                    </h4>
                                    <Badge variant="outline" className="rounded-full h-3.5 px-1.5 text-[7px] font-black uppercase text-slate-300 border-slate-100">Active</Badge>
                                </div>
                                <p className="text-[12px] font-bold text-slate-500 leading-snug">
                                    {setting.description}
                                </p>
                            </div>

                            <div className="w-full md:w-24">
                                {updatingKeys.has(setting.setting_key) ? (
                                    <div className="h-9 flex items-center justify-center">
                                        <PulseLoader size="sm" color="primary" />
                                    </div>
                                ) : (
                                    <div className="relative group/input">
                                        <NumericInput
                                            value={Number(setting.setting_value)}
                                            onChange={() => { }}
                                            onCommit={(val) => handleUpdateSetting(setting.setting_key, val)}
                                            className="h-9 border-none bg-slate-50 rounded-lg focus-visible:ring-0 transition-all text-center font-black text-sm p-0 text-slate-900"
                                        />
                                        <div className="absolute inset-x-2 -bottom-px h-px bg-slate-200 group-focus-within/input:bg-primary transition-colors" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="pt-6 flex items-center justify-between opacity-30">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Admin Protocol: Secure
                    </p>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    IELTS Lover v1.25
                </p>
            </div>

            {/* Maintenance Confirmation Dialog */}
            <NotificationDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                type="warning"
                title="Enable Maintenance Mode?"
                description="All non-admin users will be immediately redirected to a maintenance page. They will not be able to access the platform until you turn it off."
                actionText="Enable Maintenance"
                onAction={() => executeMaintenance(true)}
                cancelText="Cancel"
            />
        </div >
    )
}
