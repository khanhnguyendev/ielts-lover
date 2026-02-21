"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"

const ROUTE_MAP: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/reports": "My Reports",
    "/dashboard/writing": "Writing Tasks",
    "/dashboard/speaking": "Speaking Tasks",
    "/dashboard/rewriter": "IELTS Rewriter",
    "/dashboard/samples": "Sample Reports",
    "/dashboard/lessons": "Lessons Hub",
    "/dashboard/credits": "Buy Credits",
    "/dashboard/transactions": "Transactions",
    "/dashboard/settings": "Account Settings",
    "/dashboard/support": "Support",
    "/dashboard/improvement": "Improvement",
}

export function DynamicTitle() {
    const pathname = usePathname()

    const getBreadcrumbs = () => {
        const items = [
            { label: "Learning Hub", href: "/dashboard" }
        ]

        // Special case for dashboard root
        if (pathname === "/dashboard") {
            return items
        }

        // Handle path parts
        const parts = pathname.split("/").filter(Boolean)
        let currentPath = ""

        parts.forEach((part, index) => {
            currentPath += `/${part}`

            // Skip "dashboard" part as we already added "Learning Hub"
            if (part === "dashboard") return

            let label = ROUTE_MAP[currentPath] || part.charAt(0).toUpperCase() + part.slice(1)

            // Special cases for IDs/sub-routes
            if (currentPath.startsWith("/dashboard/reports/") && parts.length > 2 && index === 2) {
                label = "Report Detail"
            }
            if (currentPath.startsWith("/dashboard/writing/") && parts.length > 2 && index === 2) {
                label = "Writing Task"
            }
            if (currentPath.startsWith("/dashboard/speaking/") && parts.length > 2 && index === 2) {
                label = "Speaking Practice"
            }

            items.push({ label, href: currentPath })
        })

        return items
    }

    const breadcrumbs = getBreadcrumbs()
    const title = breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"

    return (
        <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none font-outfit uppercase">
                {title}
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
                {breadcrumbs.map((item, index) => (
                    <React.Fragment key={item.href}>
                        {index > 0 && (
                            <span className="text-[9px] font-bold text-slate-300">/</span>
                        )}
                        <Link
                            href={item.href}
                            className={cn(
                                "text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95",
                                index === breadcrumbs.length - 1
                                    ? "text-primary bg-primary/5 px-1.5 py-0.5 rounded"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {item.label}
                        </Link>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}
