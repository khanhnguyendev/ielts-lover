"use client"

import * as React from "react"
import {
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
} from "@/app/notification-actions"
import { AppNotification } from "@/repositories/interfaces"

const POLL_INTERVAL_MS = 30_000 // 30s polling

interface NotificationPollingContextType {
    unreadCount: number
    notifications: AppNotification[]
    loading: boolean
    pulse: boolean
    refreshUnreadCount: () => void
    refreshNotifications: () => void
    handleMarkRead: (notificationId: string) => void
    handleMarkAllRead: () => void
}

const NotificationPollingContext = React.createContext<NotificationPollingContextType | undefined>(undefined)

export function NotificationPollingProvider({
    userId,
    children,
}: {
    userId: string
    children: React.ReactNode
}) {
    const [unreadCount, setUnreadCount] = React.useState(0)
    const [notifications, setNotifications] = React.useState<AppNotification[]>([])
    const [loading, setLoading] = React.useState(false)
    const [pulse, setPulse] = React.useState(false)
    const prevCountRef = React.useRef(0)

    const refreshUnreadCount = React.useCallback(() => {
        getUnreadCount().then((count) => {
            setUnreadCount(prev => {
                if (count > prev && prev === prevCountRef.current) {
                    setPulse(true)
                    setTimeout(() => setPulse(false), 2000)
                }
                prevCountRef.current = count
                return count
            })
        }).catch(() => { })
    }, [])

    const refreshNotifications = React.useCallback(() => {
        setLoading(true)
        getNotifications()
            .then(setNotifications)
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const handleMarkRead = React.useCallback((notificationId: string) => {
        markNotificationRead(notificationId).catch(() => { })
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => {
            const next = Math.max(0, prev - 1)
            prevCountRef.current = next
            return next
        })
    }, [])

    const handleMarkAllRead = React.useCallback(() => {
        markAllNotificationsRead().catch(() => { })
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
        prevCountRef.current = 0
    }, [])

    // Initial fetch
    React.useEffect(() => {
        refreshUnreadCount()
    }, [refreshUnreadCount])

    // Single polling interval
    React.useEffect(() => {
        const interval = setInterval(refreshUnreadCount, POLL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [refreshUnreadCount])

    // Refresh on tab visibility
    React.useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                refreshUnreadCount()
            }
        }
        document.addEventListener("visibilitychange", handleVisibility)
        return () => document.removeEventListener("visibilitychange", handleVisibility)
    }, [refreshUnreadCount])

    return (
        <NotificationPollingContext.Provider value={{
            unreadCount,
            notifications,
            loading,
            pulse,
            refreshUnreadCount,
            refreshNotifications,
            handleMarkRead,
            handleMarkAllRead,
        }}>
            {children}
        </NotificationPollingContext.Provider>
    )
}

export function useNotificationPolling() {
    const context = React.useContext(NotificationPollingContext)
    if (context === undefined) {
        throw new Error("useNotificationPolling must be used within a NotificationPollingProvider")
    }
    return context
}
