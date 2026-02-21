"use client"

import * as React from "react"
import { NotificationDialog, NotificationType } from "@/components/global/notification-dialog"

interface NotificationOptions {
    title: string
    description: string
    type: NotificationType
    actionText?: string
    onAction?: () => void | Promise<void>
    cancelText?: string
    onCancel?: () => void
    traceId?: string
}

interface NotificationContextType {
    notify: (options: NotificationOptions) => void
    notifySuccess: (title: string, description: string, actionText?: string, onAction?: () => void) => void
    notifyError: (title: string, description: string, actionText?: string, traceId?: string) => void
    notifyWarning: (title: string, description: string, actionText?: string, onAction?: () => void, cancelText?: string) => void
    notifyInfo: (title: string, description: string, actionText?: string, onAction?: () => void) => void
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [options, setOptions] = React.useState<NotificationOptions>({
        title: "",
        description: "",
        type: "info"
    })

    const notify = React.useCallback((newOptions: NotificationOptions) => {
        setOptions(newOptions)
        setIsOpen(true)
    }, [])

    const notifySuccess = React.useCallback((title: string, description: string, actionText?: string, onAction?: () => void) => {
        notify({ title, description, type: "success", actionText, onAction })
    }, [notify])

    const notifyError = React.useCallback((title: string, description: string, actionText?: string, traceId?: string) => {
        notify({ title, description, type: "error", actionText, traceId })
    }, [notify])

    const notifyWarning = React.useCallback((title: string, description: string, actionText?: string, onAction?: () => void, cancelText?: string) => {
        notify({ title, description, type: "warning", actionText, onAction, cancelText: cancelText || "Cancel" })
    }, [notify])

    const notifyInfo = React.useCallback((title: string, description: string, actionText?: string, onAction?: () => void) => {
        notify({ title, description, type: "info", actionText, onAction })
    }, [notify])

    return (
        <NotificationContext.Provider value={{ notify, notifySuccess, notifyError, notifyWarning, notifyInfo }}>
            {children}
            <NotificationDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                type={options.type}
                title={options.title}
                description={options.description}
                actionText={options.actionText}
                onAction={options.onAction}
                cancelText={options.cancelText}
                onCancel={options.onCancel}
                traceId={options.traceId}
            />
        </NotificationContext.Provider>
    )
}

export function useNotification() {
    const context = React.useContext(NotificationContext)
    if (context === undefined) {
        throw new Error("useNotification must be used within a NotificationProvider")
    }
    return context
}
