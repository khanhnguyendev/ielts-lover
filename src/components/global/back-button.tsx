"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BackButtonProps {
    href?: string
    label?: string
    className?: string
    variant?: "outline" | "ghost" | "default"
}

export function BackButton({
    href,
    label = "Back",
    className,
    variant = "outline"
}: BackButtonProps) {
    const router = useRouter()

    const handleBack = (e: React.MouseEvent) => {
        if (!href) {
            e.preventDefault()
            router.back()
        }
    }

    const content = (
        <Button
            variant={variant}
            className={cn(
                "h-10 px-5 rounded-2xl border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer font-bold text-[10px] uppercase tracking-widest gap-2 group",
                className
            )}
            onClick={!href ? handleBack : undefined}
        >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {label}
        </Button>
    )

    if (href) {
        return (
            <Link href={href}>
                {content}
            </Link>
        )
    }

    return content
}
