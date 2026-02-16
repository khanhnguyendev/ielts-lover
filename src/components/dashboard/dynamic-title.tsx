"use client"

import { usePathname } from "next/navigation"

const ROUTE_MAP: Record<string, string> = {
    "/dashboard": "Home",
    "/dashboard/reports": "My Reports",
    "/dashboard/writing": "Writing Tasks",
    "/dashboard/speaking": "Speaking Tasks",
    "/dashboard/rewriter": "IELTS Rewriter",
    "/dashboard/samples": "Sample Reports",
    "/dashboard/lessons": "Lessons Hub",
    "/dashboard/credits": "Buy Credits",
    "/dashboard/support": "Support",
}

export function DynamicTitle() {
    const pathname = usePathname()

    const getTitle = () => {
        // Exact match
        if (ROUTE_MAP[pathname]) return ROUTE_MAP[pathname]

        // Handle sub-routes
        if (pathname.startsWith("/dashboard/reports/")) return "Report Detail"
        if (pathname.startsWith("/dashboard/writing/")) return "Writing Task"
        if (pathname.startsWith("/dashboard/speaking/")) return "Speaking Practice"

        return "Dashboard"
    }

    const title = getTitle()

    return (
        <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none font-outfit">
                {title}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5 opacity-60 group">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] transition-colors group-hover:text-primary">
                    Dashboard
                </span>
                <span className="text-[9px] font-bold text-slate-400">/</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                    {title}
                </span>
            </div>
        </div>
    )
}
