"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const ADMIN_ROUTE_MAP: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/exercises": "Exercises",
    "/admin/lessons": "Lessons Hub",
    "/admin/users": "User Management",
    "/admin/attempts": "Attempts Audit",
    "/admin/settings": "System Settings",
    "/admin/credits": "Credit Packages",
    "/admin/credit-requests": "Credit Requests",
    "/admin/ai-costs": "AI Costs",
}

export function AdminDynamicTitle() {
    const pathname = usePathname()

    const getTitle = () => {
        // Exact match
        if (ADMIN_ROUTE_MAP[pathname]) return ADMIN_ROUTE_MAP[pathname]

        // Handle nested routes (simple heuristic)
        if (pathname.startsWith("/admin/exercises/")) return "Exercise Editor"
        if (pathname.startsWith("/admin/lessons/")) return "Lesson Editor"
        if (pathname.startsWith("/admin/users/")) return "User Statistics"
        if (pathname.startsWith("/admin/activity/")) return "Activity Detail"

        return "Admin Console"
    }

    const title = getTitle()

    return (
        <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none font-outfit uppercase">
                {title}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5 opacity-60 group">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] transition-colors group-hover:text-primary">
                    Admin Hub
                </span>
                <span className="text-[9px] font-bold text-slate-300">/</span>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                    {title}
                </span>
            </div>
        </div>
    )
}
