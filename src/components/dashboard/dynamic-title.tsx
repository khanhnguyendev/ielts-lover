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

    return <span>{getTitle()}</span>
}
