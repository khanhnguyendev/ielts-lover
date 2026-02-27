"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    PenTool,
    Mic2,
    BarChart3,
    History,
    Zap,
    Settings,
    HelpCircle,
    Menu,
    X,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    TrendingDown,
    Brain,
    Languages,
    LucideIcon
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const MENU_PRACTICE = [
    { icon: PenTool, label: "Writing Lab", href: "/dashboard/writing" },
    { icon: Mic2, label: "Speaking Lab", href: "/dashboard/speaking" },
    { icon: Languages, label: "Rewriter", href: "/dashboard/rewriter" },
]

const MENU_ANALYSIS = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: BarChart3, label: "Performance", href: "/dashboard/reports" },
    { icon: Brain, label: "Improvement", href: "/dashboard/improvement" },
    { icon: History, label: "History", href: "/dashboard/transactions" },
]

const MENU_ACCOUNT = [
    { icon: Zap, label: "StarCredits", href: "/dashboard/credits" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    { icon: HelpCircle, label: "Get Help", href: "/dashboard/support" },
]

export function DashboardSidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Toggle */}
            <div className="fixed top-4 left-4 z-[50] lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl"
                >
                    {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
            </div>

            {/* Main Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isCollapsed ? 88 : 280,
                    x: isMobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -300 : 0)
                }}
                className={cn(
                    "fixed inset-y-0 left-0 lg:relative z-[45] h-screen bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col transition-all duration-500 ease-in-out p-4",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center px-3 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                            <Sparkles size={20} className="animate-pulse" />
                        </div>
                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-xl font-black font-outfit tracking-tighter text-slate-900 dark:text-white"
                            >
                                IELTS<span className="text-primary truncate">LOVER</span>
                            </motion.span>
                        )}
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar px-1">
                    <nav className="space-y-1.5">
                        {!isCollapsed && (
                            <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Practice Lab</p>
                        )}
                        {MENU_PRACTICE.map((item) => (
                            <SidebarItem
                                key={item.href}
                                {...item}
                                active={pathname === item.href}
                                collapsed={isCollapsed}
                                onClick={() => setIsMobileOpen(false)}
                            />
                        ))}
                    </nav>

                    <nav className="space-y-1.5">
                        {!isCollapsed && (
                            <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Neural Analytics</p>
                        )}
                        {MENU_ANALYSIS.map((item) => (
                            <SidebarItem
                                key={item.href}
                                {...item}
                                active={pathname === item.href}
                                collapsed={isCollapsed}
                                onClick={() => setIsMobileOpen(false)}
                            />
                        ))}
                    </nav>

                    <nav className="space-y-1.5">
                        {!isCollapsed && (
                            <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Command Center</p>
                        )}
                        {MENU_ACCOUNT.map((item) => (
                            <SidebarItem
                                key={item.href}
                                {...item}
                                active={pathname === item.href}
                                collapsed={isCollapsed}
                                onClick={() => setIsMobileOpen(false)}
                            />
                        ))}
                    </nav>
                </div>

                {/* Collapse Toggle (Desktop) */}
                <div className="mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-800/50 hidden lg:block">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full h-11 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary transition-all duration-300"
                    >
                        <motion.div
                            animate={{ rotate: isCollapsed ? 180 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <ChevronRight size={20} />
                        </motion.div>
                    </button>
                </div>
            </motion.aside>
        </>
    )
}

function SidebarItem({ icon: Icon, label, href, active, collapsed, onClick }: {
    icon: LucideIcon,
    label: string,
    href: string,
    active: boolean,
    collapsed: boolean,
    onClick?: () => void
}) {
    return (
        <Link href={href} onClick={onClick} className="block relative group">
            <div className={cn(
                "h-11 flex items-center gap-3 px-3 rounded-xl transition-all duration-300 relative z-10",
                active
                    ? "text-primary font-black shadow-sm"
                    : "text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white"
            )}>
                {/* Active Indicator Background */}
                {active && (
                    <motion.div
                        layoutId="active-indicator"
                        className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10 dark:border-primary/20"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}

                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                    active ? "bg-primary/10 text-primary" : "bg-transparent"
                )}>
                    <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                </div>

                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm tracking-tight truncate"
                    >
                        {label}
                    </motion.span>
                )}

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-slate-100/50 dark:bg-slate-800/30 transition-opacity -z-10" />
            </div>
        </Link>
    )
}
