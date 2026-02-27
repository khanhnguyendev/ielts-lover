"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useTitle } from "@/lib/contexts/title-context"

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
    const { title: dynamicTitle } = useTitle()

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

        const breadcrumbs = items

        // If we have a dynamic title, update the last item's label
        if (dynamicTitle && breadcrumbs.length > 0) {
            breadcrumbs[breadcrumbs.length - 1].label = dynamicTitle
        }

        return breadcrumbs
    }

    const breadcrumbs = getBreadcrumbs()
    const title = dynamicTitle || breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"

    return (
        <div className="flex items-center gap-1.5 py-1">
            {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.href}>
                    {index > 0 && (
                        <span className="text-[8px] font-black text-slate-300 dark:text-slate-700 select-none">/</span>
                    )}
                    <Link
                        href={item.href}
                        className={cn(
                            "text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95",
                            index === breadcrumbs.length - 1
                                ? "text-primary/70 dark:text-primary/50 bg-primary/[0.03] dark:bg-primary/[0.02] px-2 py-0.5 rounded-lg border border-primary/5 dark:border-primary/10"
                                : "text-slate-400/60 dark:text-slate-500/40 hover:text-slate-600 dark:hover:text-slate-300"
                        )}
                    >
                        {item.label}
                    </Link>
                </React.Fragment>
            ))}
        </div>
    )
}
