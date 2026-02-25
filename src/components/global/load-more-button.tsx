"use client"

import { Button } from "@/components/ui/button"
import { PulseLoader } from "@/components/global/pulse-loader"

interface LoadMoreButtonProps {
    onClick: () => void
    isLoading: boolean
    remaining: number
}

export function LoadMoreButton({ onClick, isLoading, remaining }: LoadMoreButtonProps) {
    return (
        <div className="flex justify-center pt-4">
            <Button
                variant="outline"
                onClick={onClick}
                disabled={isLoading}
                className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 border-slate-100 hover:border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
            >
                {isLoading ? (
                    <PulseLoader size="sm" color="primary" />
                ) : (
                    `Load More (${remaining} remaining)`
                )}
            </Button>
        </div>
    )
}
