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

export function NotificationOverlay() {
    const unreadCount = notifications.filter((n) => !n.read).length

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 shadow-xl border-border bg-card rounded-[16px]">
                <div className="p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                </div>
                <ScrollArea className="h-80">
                    <div className="grid">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="flex flex-col gap-1 p-4 border-b last:border-0 hover:bg-muted transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium text-sm">{notification.title}</span>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        {notification.time}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {notification.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-2 border-t text-center">
                    <Button variant="link" size="sm" className="text-xs text-primary h-auto py-1">
                        View all notifications
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
