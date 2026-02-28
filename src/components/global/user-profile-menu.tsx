"use client"

import * as React from "react"
import { LogOut, User, CreditCard, ChevronRight, Zap, GraduationCap, ShieldCheck, Sparkles } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { signOut } from "@/app/actions"
import { useState } from "react"
import { UserProfile } from "@/types"
import { USER_ROLES } from "@/lib/constants"
import { PulseLoader } from "./pulse-loader"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CreditBadge } from "@/components/ui/credit-badge"

export function UserProfileMenu({ user }: { user: UserProfile }) {
    const [isLoading, setIsLoading] = React.useState(false)
    const [displayBalance, setDisplayBalance] = React.useState(user.credits_balance)

    // Sync display balance when prop changes from parent (server sync)
    React.useEffect(() => {
        setDisplayBalance(user.credits_balance)
    }, [user.credits_balance])

    React.useEffect(() => {
        const handleCreditChange = (e: any) => {
            const { amount } = e.detail
            // Optimistic update of the displayed number
            setDisplayBalance(prev => prev + amount)
        }

        window.addEventListener('credit-change', handleCreditChange)
        return () => window.removeEventListener('credit-change', handleCreditChange)
    }, [])

    const handleSignOut = async () => {
        setIsLoading(true)
        try {
            await signOut()
        } catch (error) {
            console.error(error)
            setIsLoading(false)
        }
    }

    // Generate initials from name or email
    const getInitials = () => {
        if (user.full_name) {
            return user.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2)
        }
        return user.email.substring(0, 2).toUpperCase()
    }

    const isAdmin = user.role === USER_ROLES.ADMIN
    const isTeacher = user.role === USER_ROLES.TEACHER

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ring-offset-background transition-all hover:scale-105 active:scale-95 group">
                    <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm ring-2 ring-transparent transition-all group-hover:ring-primary/20">
                        <AvatarImage src={user.avatar_url} alt={user.full_name || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-[10px]">
                            {getInitials()}
                        </AvatarFallback>
                    </Avatar>
                    {isAdmin && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                            <ShieldCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[280px] mt-4 p-0 shadow-2xl border border-slate-100 bg-white rounded-[2rem] overflow-hidden animate-in fade-in zoom-in-95 duration-300"
                align="end"
            >
                {/* 1. Premium Header (Compacted) */}
                <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-[50px]" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/10 rounded-full -ml-10 -mb-10 blur-[30px]" />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="relative group/avatar">
                            <Avatar className="h-12 w-12 border-2 border-white/10 shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-white/10 text-white font-black text-[10px]">{getInitials()}</AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <h3 className="text-base font-black text-white tracking-tight truncate">
                                    {user.full_name || user.email.split("@")[0]}
                                </h3>
                                {isAdmin && (
                                    <Badge className="bg-amber-400 text-amber-950 font-black text-[7px] uppercase tracking-widest px-1 py-0 border-none shrink-0">Admin</Badge>
                                )}
                            </div>
                            <p className="text-[9px] font-medium text-slate-400 tracking-wide truncate">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="p-3 pt-4">
                    {/* 2. StarCredits Wallet Card (Compacted) */}
                    <div className="relative group mb-4">
                        <Link href="/dashboard/credits" className="block">
                            <div className="px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <Zap className="w-12 h-12 text-primary fill-primary" />
                                </div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <CreditBadge
                                            amount={displayBalance || 0}
                                            size="lg"
                                            className="h-14 rounded-2xl border-none bg-white shadow-xl shadow-slate-200/50"
                                        />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Your Balance</p>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active Stars</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-primary/30 group-hover:text-primary transition-all duration-500 -rotate-45 group-hover:rotate-0">
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* 3. High-Density Menu Items */}
                    <div className="space-y-1">
                        {(isTeacher || isAdmin) && (
                            <MenuLink
                                href="/teacher"
                                icon={GraduationCap}
                                label="Teacher Dashboard"
                                description="Manage students & tasks"
                                color="text-indigo-600"
                                bgColor="hover:bg-indigo-50/50"
                            />
                        )}
                        {isAdmin && (
                            <MenuLink
                                href="/admin"
                                icon={ShieldCheck}
                                label="Admin Console"
                                description="System controls & data"
                                color="text-amber-600"
                                bgColor="hover:bg-amber-50/50"
                            />
                        )}

                        <div className="py-1">
                            <DropdownMenuSeparator className="bg-slate-50 opacity-50" />
                        </div>

                        <DropdownMenuGroup className="space-y-1">
                            <MenuLink
                                href="/dashboard/settings"
                                icon={User}
                                label="Account Settings"
                                description="Profile & preferences"
                                badge="Security"
                            />
                            <MenuLink
                                href="/dashboard/transactions"
                                icon={CreditCard}
                                label="Transactions"
                                description="Billing & transactions"
                            />
                        </DropdownMenuGroup>

                        <div className="py-1">
                            <DropdownMenuSeparator className="bg-slate-50 opacity-50" />
                        </div>

                        <DropdownMenuItem
                            className="rounded-xl cursor-pointer py-3 px-4 text-xs font-black text-rose-500 hover:bg-rose-50 focus:bg-rose-50 transition-all disabled:opacity-50 group/logout border border-transparent"
                            onClick={handleSignOut}
                            disabled={isLoading}
                        >
                            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center mr-3 group-hover/logout:scale-110 transition-transform">
                                <LogOut className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black uppercase tracking-widest text-[9px]">
                                    {isLoading ? "Logging out..." : "Sign Out"}
                                </p>
                            </div>
                            {isLoading && <PulseLoader size="sm" color="red" />}
                        </DropdownMenuItem>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function MenuLink({
    href,
    icon: Icon,
    label,
    description,
    badge,
    color = "text-slate-600",
    bgColor = "hover:bg-slate-50"
}: {
    href: string,
    icon: React.ElementType,
    label: string,
    description?: string,
    badge?: string,
    color?: string,
    bgColor?: string
}) {
    return (
        <Link href={href} className="block group/item">
            <DropdownMenuItem className={cn(
                "rounded-xl cursor-pointer py-2.5 px-4 transition-all border border-transparent flex items-center gap-3",
                bgColor
            )}>
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover/item:scale-110 group-hover/item:bg-white transition-all duration-300">
                    <Icon className="h-3.5 w-3.5 text-slate-400 group-hover/item:text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                        <p className={cn("text-xs font-bold tracking-tight truncate", color)}>{label}</p>
                        {badge && (
                            <Badge variant="outline" className="text-[6px] font-black uppercase tracking-tighter text-slate-400 border-slate-200 px-1 py-0">{badge}</Badge>
                        )}
                    </div>
                    {description && (
                        <p className="text-[8px] font-medium text-slate-400 tracking-wide truncate">{description}</p>
                    )}
                </div>
            </DropdownMenuItem>
        </Link>
    )
}
