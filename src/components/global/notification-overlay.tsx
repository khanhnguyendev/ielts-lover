"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
    id: string
    title: string
    description: string
    time: string
    read: boolean
}

const notifications: Notification[] = [
    {
        id: "1",
        title: "Report Ready!",
        description: "Your Speaking Part 1 report is now ready to view with a score of 7.5.",
        time: "9m ago",
        read: false,
    },
    {
        id: "2",
        title: "New Lesson Available",
        description: "Master the 'Academic Writing Task 1' with our new video lesson.",
        time: "2h ago",
        read: true,
    },
]

import { BarChart3 } from "lucide-react"

export function NotificationOverlay() {
    const unreadCount = notifications.filter((n) => !n.read).length

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-full hover:bg-slate-100 transition-colors">
                    <Bell className="h-5 w-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <div className="absolute right-2.5 top-2.5 h-4 w-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-[8px] font-black text-white">{unreadCount}</span>
                        </div>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[380px] p-0 shadow-2xl border-slate-100 bg-white rounded-[24px] overflow-hidden" sideOffset={12}>
                <div className="p-5 border-b border-slate-50">
                    <h4 className="font-black text-sm text-slate-900 font-outfit">Notifications</h4>
                </div>
                <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-slate-50">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="flex gap-4 p-5 hover:bg-slate-50/50 transition-all cursor-pointer group"
                            >
                                <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="h-5 w-5 text-cyan-500" />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-black text-[13px] text-slate-900 leading-tight">{notification.title}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                                            {notification.time}
                                        </span>
                                    </div>
                                    <p className="text-[12px] font-medium text-slate-600 leading-relaxed pr-4">
                                        {notification.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                    <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors py-2 w-full">
                        View all notifications
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
