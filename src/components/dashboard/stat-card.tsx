"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    subLabel: string;
    color: string;
    bgColor: string;
}

export function StatCard({ icon: Icon, label, value, subLabel, color, bgColor }: StatCardProps) {
    return (
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-3">
                <div className={cn("p-2 rounded-xl", bgColor, color)}>
                    <Icon size={18} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                    {label}
                </div>
            </div>
            <div className="space-y-0.5">
                <div className="text-2xl font-black font-outfit text-slate-900">{value}</div>
                <div className="text-[10px] font-medium text-slate-400">{subLabel}</div>
            </div>
        </div>
    )
}
