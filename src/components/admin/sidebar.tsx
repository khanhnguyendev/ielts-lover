"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    Package,
    ArrowLeft,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Search,
    Wand2,
    Calendar,
    Settings2,
    ShieldCheck,
    Zap,
    HandCoins,
    BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const NAV_GROUPS = [
    {
        label: "Overview",
        items: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
        ]
    },
    {
        label: "Content Management",
        items: [
            { icon: Zap, label: "Exercises", href: "/admin/exercises" },
            { icon: Package, label: "Credit Packages", href: "/admin/credits" },
            { icon: BarChart3, label: "AI Costs", href: "/admin/ai-costs" },
            { icon: Settings2, label: "System Settings", href: "/admin/settings" },
        ]
    },
    {
        label: "User Operations",
        items: [
            { icon: Users, label: "Users", href: "/admin/users" },
            { icon: HandCoins, label: "Credit Requests", href: "/admin/credit-requests" },
            { icon: FileText, label: "Attempts Audit", href: "/admin/attempts" },
        ]
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = React.useState(false)

    return (
        <div
            className={cn(
                "relative flex flex-col h-screen border-r bg-white transition-all duration-300",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Logo Section */}
            <div className="p-4 flex items-center justify-between">
                {!isCollapsed && (
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-200">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black font-outfit text-slate-900 tracking-tight leading-none">ADMIN HUB</span>
                            <span className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] mt-0.5 uppercase leading-none text-primary">IELTS LOVER</span>
                        </div>
                    </Link>
                )}
                {isCollapsed && (
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 mx-auto">
                        <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-white shadow-sm hover:bg-muted z-50 transition-all hover:scale-110"
                >
                    <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                </Button>
            </div>

            {/* Main Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
                <div className="space-y-6">
                    {NAV_GROUPS.map((group, idx) => (
                        <div key={group.label || idx} className="space-y-1.5">
                            {!isCollapsed && (
                                <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                                    {group.label}
                                </h3>
                            )}
                            {group.items.map((item) => {
                                // Handle sub-routes highlighting (e.g. /admin/exercises/new matches /admin/exercises)
                                const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href))

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
                                        {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}

                                        {isCollapsed && (
                                            <div className="absolute left-16 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 pointer-events-none z-50 shadow-xl">
                                                {item.label}
                                            </div>
                                        )}

                                        {isActive && !isCollapsed && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Bottom Section */}
            <div className="px-3 pb-8 pt-4 border-t border-slate-50">
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group relative",
                        isCollapsed && "justify-center"
                    )}
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    {!isCollapsed && <span className="text-sm font-bold">Return to App</span>}

                    {isCollapsed && (
                        <div className="absolute left-16 bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 pointer-events-none z-50 shadow-xl">
                            Return to App
                        </div>
                    )}
                </Link>
            </div>
        </div>
    )
}
