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
    ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { InviteFriendsModal } from "./invite-friends-modal"

const NAV_ITEMS = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: PieChart, label: "My Reports", href: "/dashboard/reports" },
    { icon: PenTool, label: "Writing", href: "/dashboard/writing" },
    { icon: Mic2, label: "Speaking", href: "/dashboard/speaking" },
    { icon: RefreshCw, label: "Rewriter", href: "/dashboard/rewriter" },
    { icon: FileText, label: "Sample Reports", href: "/dashboard/samples" },
    { icon: BookOpen, label: "Lessons", href: "/dashboard/lessons" },
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
            <div className="p-6 flex items-center justify-between">
                {!isCollapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <span className="text-xl font-bold font-outfit text-primary tracking-tight">IELTS LOVER</span>
                            <span className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] -mt-1 uppercase">Practice Platform</span>
                        </div>
                    </Link>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 bg-primary rounded shadow-lg shadow-primary/20" />
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
            <ScrollArea className="flex-1 px-3 py-4">
                <div className="space-y-1.5">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
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
            </ScrollArea>

            {/* Invite Section */}
            {!isCollapsed && (
                <div className="px-6 mb-8 group">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 transition-all group-hover:bg-primary/10">
                        <h4 className="text-sm font-bold text-primary mb-1">Invite friends</h4>
                        <p className="text-[10px] text-muted-foreground leading-tight mb-3">Get 1 free mock test for every friend who joins.</p>
                        <Button
                            onClick={() => setIsInviteModalOpen(true)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-full text-[10px] font-bold uppercase tracking-wider rounded-lg border-primary/20 hover:bg-primary hover:text-white transition-all"
                        >
                            Invite friends
                        </Button>
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
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted transition-all group relative"
                    >
                        <item.icon className="h-5 w-5 group-hover:text-primary transition-colors" />
                        {!isCollapsed && <span className="text-sm font-semibold">{item.label}</span>}
                    </Link>
                ))}
            </div>
        </div>
    )
}
