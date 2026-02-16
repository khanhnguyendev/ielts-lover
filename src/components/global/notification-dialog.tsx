"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    CheckCircle2,
    AlertCircle,
    Info,
    XCircle,
    Sparkles,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

export type NotificationType = "success" | "error" | "warning" | "info" | "loading"

interface NotificationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: NotificationType
    title: string
    description: string
    actionText?: string
    onAction?: () => void
    cancelText?: string
    onCancel?: () => void
}

const TYPE_CONFIG = {
    success: {
        icon: CheckCircle2,
        iconClass: "text-emerald-500 bg-emerald-50",
        titleClass: "text-emerald-900",
        buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    error: {
        icon: XCircle,
        iconClass: "text-rose-500 bg-rose-50",
        titleClass: "text-rose-900",
        buttonClass: "bg-rose-600 hover:bg-rose-700 text-white",
    },
    warning: {
        icon: AlertCircle,
        iconClass: "text-amber-500 bg-amber-50",
        titleClass: "text-amber-900",
        buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    info: {
        icon: Info,
        iconClass: "text-blue-500 bg-blue-50",
        titleClass: "text-blue-900",
        buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    loading: {
        icon: Loader2,
        iconClass: "text-primary bg-primary/5",
        titleClass: "text-slate-900",
        buttonClass: "bg-primary hover:bg-primary/90 text-white",
    }
}

export function NotificationDialog({
    open,
    onOpenChange,
    type,
    title,
    description,
    actionText = "Understand",
    onAction,
    cancelText,
    onCancel
}: NotificationDialogProps) {
    const config = TYPE_CONFIG[type]
    const Icon = config.icon

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-white rounded-[32px] p-8 overflow-hidden border-none shadow-2xl">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className={cn(
                        "w-20 h-20 rounded-[28px] flex items-center justify-center transition-all duration-500",
                        config.iconClass
                    )}>
                        <Icon className={cn(
                            "w-10 h-10",
                            type === "loading" && "animate-spin"
                        )} />
                    </div>

                    <div className="space-y-2">
                        <DialogTitle className={cn(
                            "text-2xl font-black font-outfit",
                            config.titleClass
                        )}>
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium leading-relaxed">
                            {description}
                        </DialogDescription>
                    </div>

                    <DialogFooter className="w-full flex sm:flex-row gap-3 pt-2">
                        {cancelText && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onCancel?.()
                                    onOpenChange(false)
                                }}
                                className="flex-1 h-14 rounded-2xl font-black text-sm border-2 border-slate-100 hover:bg-slate-50 transition-all active:scale-95 text-slate-600"
                            >
                                {cancelText}
                            </Button>
                        )}
                        <Button
                            onClick={() => {
                                onAction?.()
                                onOpenChange(false)
                            }}
                            className={cn(
                                "flex-1 h-14 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-black/5",
                                config.buttonClass
                            )}
                        >
                            {actionText}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
