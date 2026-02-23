"use client"

import * as React from "react"
import {
    Bell, CheckCheck, FileText, Coins, AlertTriangle,
    Gift, XCircle, Sparkles, Megaphone, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { AppNotification } from "@/repositories/interfaces"
import { NOTIFICATION_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useNotificationPolling } from "@/lib/contexts/notification-polling-context"

const TYPE_CONFIG: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    [NOTIFICATION_TYPES.EVALUATION_COMPLETE]: { icon: FileText, bg: "bg-emerald-50", color: "text-emerald-600" },
    [NOTIFICATION_TYPES.CREDITS_RECEIVED]: { icon: Coins, bg: "bg-blue-50", color: "text-blue-600" },
    [NOTIFICATION_TYPES.CREDITS_LOW]: { icon: AlertTriangle, bg: "bg-amber-50", color: "text-amber-600" },
    [NOTIFICATION_TYPES.CREDIT_REQUEST_APPROVED]: { icon: Gift, bg: "bg-emerald-50", color: "text-emerald-600" },
    [NOTIFICATION_TYPES.CREDIT_REQUEST_REJECTED]: { icon: XCircle, bg: "bg-rose-50", color: "text-rose-500" },
    [NOTIFICATION_TYPES.CREDIT_REQUEST_NEW]: { icon: Sparkles, bg: "bg-indigo-50", color: "text-indigo-600" },
    [NOTIFICATION_TYPES.WELCOME]: { icon: Sparkles, bg: "bg-purple-50", color: "text-purple-600" },
    [NOTIFICATION_TYPES.SYSTEM]: { icon: Megaphone, bg: "bg-slate-100", color: "text-slate-600" },
}

const DEFAULT_CONFIG = { icon: Bell, bg: "bg-slate-50", color: "text-slate-500" }

function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
}

export function NotificationOverlay() {
    const router = useRouter()
    const {
        unreadCount,
        notifications,
        loading,
        pulse,
        refreshNotifications,
        handleMarkRead,
        handleMarkAllRead,
    } = useNotificationPolling()

    const [isOpen, setIsOpen] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState<"all" | "unread">("all")

    // Load notifications when popover opens
    React.useEffect(() => {
        if (!isOpen) return
        refreshNotifications()
    }, [isOpen, refreshNotifications])

    const handleClick = (notification: AppNotification) => {
        if (!notification.is_read) {
            handleMarkRead(notification.id)
        }
        if (notification.deep_link) {
            setIsOpen(false)
            router.push(notification.deep_link)
        }
    }

    const filteredNotifications = activeTab === "all"
        ? notifications
        : notifications.filter(n => !n.is_read)

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-full hover:bg-slate-100 transition-all duration-300">
                    <Bell className={cn("h-5 w-5 text-slate-600 transition-transform duration-500", pulse && "animate-[wiggle_0.5s_ease-in-out]")} />
                    {unreadCount > 0 && (
                        <div className={cn(
                            "absolute right-2.5 top-2.5 h-4 min-w-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center px-0.5 transition-all duration-300",
                            pulse && "animate-bounce scale-110"
                        )}>
                            <span className="text-[8px] font-black text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[420px] p-0 shadow-2xl border-slate-100/60 bg-white rounded-[28px] overflow-hidden" sideOffset={12}>
                {/* Header */}
                <div className="p-6 pb-4 bg-white/50 backdrop-blur-sm border-b border-slate-50 relative z-10">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Bell className="h-4 w-4 text-primary" />
                            </div>
                            <h4 className="font-black text-base text-slate-900 font-outfit tracking-tight">Notifications</h4>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-primary/10 transition-all duration-300"
                            >
                                <CheckCheck className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-bold text-slate-500 group-hover:text-primary uppercase tracking-widest transition-colors">Mark all read</span>
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-100/50 p-1 rounded-xl w-full border border-slate-200/40">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={cn(
                                "flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative",
                                activeTab === "all"
                                    ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            All
                            <span className={cn(
                                "ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-colors",
                                activeTab === "all" ? "bg-primary/10 text-primary" : "bg-slate-200/50 text-slate-400"
                            )}>
                                {notifications.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("unread")}
                            className={cn(
                                "flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative",
                                activeTab === "unread"
                                    ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Unread
                            <span className={cn(
                                "ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-colors",
                                activeTab === "unread" ? "bg-primary text-white" : "bg-primary/10 text-primary"
                            )}>
                                {unreadCount}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="h-[420px] bg-slate-50/20">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-16 text-center animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100/50 group">
                                <Bell className="h-8 w-8 text-slate-200 group-hover:text-primary/20 transition-colors duration-500" />
                            </div>
                            <h5 className="text-[14px] font-black text-slate-900 font-outfit mb-1">All caught up!</h5>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                {activeTab === "unread" ? "No unread notifications" : "Your inbox is empty"}
                            </p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {filteredNotifications.map((notification) => {
                                const config = TYPE_CONFIG[notification.type] || DEFAULT_CONFIG
                                const Icon = config.icon

                                return (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleClick(notification)}
                                        className={cn(
                                            "flex gap-4 p-4 w-full text-left rounded-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden",
                                            notification.is_read
                                                ? "hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                                                : "bg-white shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1"
                                        )}
                                    >
                                        {!notification.is_read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                        )}

                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 group-hover:rotate-6",
                                            config.bg
                                        )}>
                                            <Icon className={cn("h-6 w-6", config.color)} />
                                        </div>

                                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className={cn(
                                                    "text-[14px] leading-tight font-outfit tracking-tight truncate",
                                                    notification.is_read ? "font-bold text-slate-600" : "font-black text-slate-900"
                                                )}>
                                                    {notification.title}
                                                </span>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0 whitespace-nowrap">
                                                    {relativeTime(notification.created_at)}
                                                </span>
                                            </div>

                                            <p className={cn(
                                                "text-[12px] leading-relaxed line-clamp-2",
                                                notification.is_read ? "font-medium text-slate-400" : "font-bold text-slate-500"
                                            )}>
                                                {notification.body}
                                            </p>

                                            <div className="flex items-center justify-between mt-1">
                                                {notification.deep_link ? (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 group-hover:bg-primary/5 transition-colors duration-300">
                                                        <span className="text-[9px] font-black text-slate-400 group-hover:text-primary uppercase tracking-widest transition-colors">Details</span>
                                                        <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-primary transition-all duration-300 group-hover:translate-x-0.5" />
                                                    </div>
                                                ) : <div />}

                                                {!notification.is_read && (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">
                                                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                        New
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Stay updated with your progress</p>
                </div>
            </PopoverContent>
        </Popover>
    )
}
