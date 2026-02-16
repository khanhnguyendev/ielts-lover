"use client"

import * as React from "react"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface PremiumBannerProps {
    title: React.ReactNode
    subtitle?: string
    buttonText?: string
    href?: string
    className?: string
    onClick?: () => void
    showIcon?: boolean
    action?: React.ReactNode
}

export function PremiumBanner({
    title,
    subtitle,
    buttonText = "Upgrade to Premium",
    href = "/dashboard/credits",
    className,
    onClick,
    showIcon = true,
    action
}: PremiumBannerProps) {
    const Content = () => (
        <div className={cn(
            "bg-primary rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between text-white shadow-lg shadow-primary/20 gap-4 transition-all hover:shadow-primary/30",
            className
        )}>
            <div className="flex items-center gap-4 w-full sm:w-auto">
                {showIcon && (
                    <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
                        <Zap className="h-5 w-5 fill-white" />
                    </div>
                )}
                <div>
                    <h3 className="text-sm font-bold font-outfit text-white">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-[10px] text-white/80 font-medium mt-0.5">{subtitle}</p>
                    )}
                </div>
            </div>

            {action ? action : (
                <Button
                    variant="white"
                    size="sm"
                    className="px-6 w-full sm:w-auto font-black"
                    onClick={(e) => {
                        if (onClick) {
                            e.preventDefault()
                            onClick()
                        }
                    }}
                >
                    {buttonText}
                </Button>
            )}
        </div>
    )

    if (onClick) {
        return <Content />
    }

    return (
        <Link href={href} className="block w-full">
            <Content />
        </Link>
    )
}
