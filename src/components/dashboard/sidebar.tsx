"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home,
    FileText,
    PenTool,
    Mic2,
    RefreshCw,
    BookOpen,
    PieChart,
    Tag,
    MessageCircle,
    ChevronLeft,
    Search,
    ExternalLink,
    History
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InviteFriendsModal } from "./invite-friends-modal"

const NAV_GROUPS = [
    {
        label: "Dashboard",
        items: [
            { icon: Home, label: "Home", href: "/dashboard" },
            { icon: PieChart, label: "My Reports", href: "/dashboard/reports" },
            { icon: History, label: "Transactions", href: "/dashboard/transactions" },
        ]
    },
    {
        label: "Practice Area",
        items: [
            { icon: PenTool, label: "Writing Tasks", href: "/dashboard/writing" },
            { icon: Mic2, label: "Speaking Practice", href: "/dashboard/speaking" },
            { icon: RefreshCw, label: "IELTS Rewriter", href: "/dashboard/rewriter" },
        ]
    },
    {
        label: "Resources",
        items: [
            { icon: BookOpen, label: "Lessons Hub", href: "/dashboard/lessons" },
            { icon: FileText, label: "Sample Reports", href: "/dashboard/samples" },
        ]
    }
]

const BOTTOM_NAV = [
    { icon: Tag, label: "Buy Credits", href: "/dashboard/credits" },
    { icon: MessageCircle, label: "Support", href: "/dashboard/support" },
]

export function DashboardSidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)

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
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <span className="text-xl font-bold font-outfit text-primary tracking-tight">IELTS LOVER</span>
                            <span className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] -mt-1 uppercase">Practice Platform</span>
                        </div>
                    </Link>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 bg-primary rounded shadow-lg shadow-primary/20 mx-auto" />
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-white shadow-sm hover:bg-muted"
                >
                    <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                </Button>
            </div>

            {/* Main Navigation */}
            <ScrollArea className="flex-1 px-3 py-2">
                <div className="space-y-4">
                    {NAV_GROUPS.map((group, idx) => (
                        <div key={group.label || idx} className="space-y-1.5">
                            {!isCollapsed && (
                                <h3 className="px-3 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-2">
                                    {group.label}
                                </h3>
                            )}
                            {group.items.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                                : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
                                        {!isCollapsed && <span className="text-sm font-semibold">{item.label}</span>}
                                        {isCollapsed && (
                                            <div className="absolute left-14 bg-foreground text-background px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                {item.label}
                                            </div>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Invite Section */}
            {!isCollapsed && (
                <div className="px-4 mb-4">
                    <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-200 group transition-all hover:shadow-indigo-300">
                        {/* Decorative background circle */}
                        <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 rounded-lg bg-white/20">
                                    <ExternalLink className="h-4 w-4 text-white" />
                                </div>
                                <h4 className="text-sm font-black tracking-tight text-white underline-offset-4 decoration-white/30 underline">Refer & Earn</h4>
                            </div>

                            <p className="text-xs text-white/90 font-medium leading-relaxed mb-4">
                                Get <span className="text-white font-black underline decoration-yellow-400">100 StarCredits</span> for every friend who joins.
                            </p>

                            <Button
                                onClick={() => setIsInviteModalOpen(true)}
                                size="sm"
                                className="h-9 w-full bg-white text-indigo-600 hover:bg-white/90 text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all"
                            >
                                Share the love 🐴
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <InviteFriendsModal
                open={isInviteModalOpen}
                onOpenChange={setIsInviteModalOpen}
            />

            {/* Bottom Navigation */}
            <div className="px-3 pb-6 space-y-1.5 border-t pt-6">
                {BOTTOM_NAV.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-all group relative"
                    >
                        <item.icon className="h-5 w-5 group-hover:text-primary transition-colors" />
                        {!isCollapsed && <span className="text-sm font-semibold">{item.label}</span>}
                    </Link>
                ))}
            </div>
        </div>
    )
}
