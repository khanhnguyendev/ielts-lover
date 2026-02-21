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

export function UserProfileMenu({ user }: { user: UserProfile }) {
    const [isLoading, setIsLoading] = useState(false)

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
                className="w-[320px] mt-4 p-0 shadow-2xl border border-slate-100 bg-white rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in-95 duration-300"
                align="end"
            >
                {/* 1. Premium Header */}
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full -mr-20 -mt-20 blur-[60px]" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full -ml-12 -mb-12 blur-[40px]" />

                    <div className="flex items-center gap-5 relative z-10">
                        <div className="relative group/avatar">
                            <Avatar className="h-16 w-16 border-2 border-white/10 shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-white/10 text-white font-black text-xs">{getInitials()}</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 rounded-full bg-primary/20 blur opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-white tracking-tight italic">
                                    {user.full_name || user.email.split("@")[0]}
                                </h3>
                                {isAdmin && (
                                    <Badge className="bg-amber-400 text-amber-950 font-black text-[8px] uppercase tracking-widest px-1.5 py-0 border-none">Admin</Badge>
                                )}
                                {isTeacher && !isAdmin && (
                                    <Badge className="bg-purple-400 text-purple-950 font-black text-[8px] uppercase tracking-widest px-1.5 py-0 border-none">Tutor</Badge>
                                )}
                            </div>
                            <p className="text-[10px] font-medium text-slate-400 tracking-wide">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 pt-6">
                    {/* 2. StarCredits Wallet Card */}
                    <div className="relative group mb-6">
                        <Link href="/dashboard/credits" className="block">
                            <div className="px-6 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <Zap className="w-16 h-16 text-primary fill-primary" />
                                </div>

                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-all duration-500 border border-slate-50 group-hover:border-primary/10">
                                            <Sparkles className="w-6 h-6 text-primary fill-primary/10" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Your Balance</p>
                                            <div className="flex items-baseline gap-1.5">
                                                <p className="text-2xl font-black text-slate-900 tracking-tight">{user.credits_balance}</p>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Stars</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-primary/30 group-hover:text-primary transition-all duration-500 -rotate-45 group-hover:rotate-0">
                                        <ChevronRight size={18} />
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

                        <div className="py-2">
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
                                description="Billing & history"
                            />
                        </DropdownMenuGroup>

                        <div className="py-2">
                            <DropdownMenuSeparator className="bg-slate-50 opacity-50" />
                        </div>

                        <DropdownMenuItem
                            className="rounded-[1.5rem] cursor-pointer py-4 px-6 text-xs font-black text-rose-500 hover:bg-rose-50 focus:bg-rose-50 transition-all disabled:opacity-50 group/logout border border-transparent"
                            onClick={handleSignOut}
                            disabled={isLoading}
                        >
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center mr-4 group-hover/logout:scale-110 transition-transform">
                                <LogOut className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="font-black uppercase tracking-widest text-[10px]">
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
                "rounded-[1.5rem] cursor-pointer py-3.5 px-6 transition-all border border-transparent flex items-center gap-4",
                bgColor
            )}>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover/item:scale-110 group-hover/item:bg-white transition-all duration-300">
                    <Icon className="h-4 w-4 text-slate-400 group-hover/item:text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-xs font-bold tracking-tight", color)}>{label}</p>
                        {badge && (
                            <Badge variant="outline" className="text-[7px] font-black uppercase tracking-tighter text-slate-400 border-slate-200 px-1 py-0">{badge}</Badge>
                        )}
                    </div>
                    {description && (
                        <p className="text-[9px] font-medium text-slate-400 tracking-wide">{description}</p>
                    )}
                </div>
            </DropdownMenuItem>
        </Link>
    )
}
