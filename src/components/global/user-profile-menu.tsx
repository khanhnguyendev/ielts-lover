"use client"

import * as React from "react"
import { LogOut, User, CreditCard, Settings, ChevronRight, Zap } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { signOut } from "@/app/actions"
import { useState } from "react"
import { UserProfile } from "@/types"
import { PulseLoader } from "./PulseLoader"
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ring-offset-background transition-all hover:scale-105 active:scale-95">
                    <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm ring-2 ring-transparent transition-all group-hover:ring-primary/20">
                        <AvatarImage src={user.avatar_url} alt={user.full_name || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-[10px]">
                            {getInitials()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[300px] mt-4 p-0 shadow-2xl border-none bg-white rounded-[32px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                align="end"
            >
                {/* Header with Gradient */}
                <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="flex items-center gap-4 relative z-10">
                        <Avatar className="h-14 w-14 border-2 border-white/20 shadow-xl">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-white/10 text-white font-black">{getInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-black truncate text-white">{user.full_name || user.email.split("@")[0]}</h3>
                                {user.is_premium && (
                                    <Badge className="bg-amber-400 text-slate-900 text-[8px] font-black h-4 px-1.5 border-none shadow-sm uppercase tracking-tighter">Pro</Badge>
                                )}
                            </div>
                            <p className="text-[10px] font-medium text-slate-300 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="p-3 pt-4">
                    {/* StarCredits Card */}
                    <div className="relative group overflow-hidden">
                        <Link href="/dashboard/pricing" className="block">
                            <div className="px-5 py-4 rounded-[24px] bg-slate-50 border border-slate-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <span className="text-xl">⭐</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">StarCredits</p>
                                            <p className="text-lg font-black text-slate-900 leading-none">{user.credits_balance}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-primary/30 group-hover:text-primary transition-all">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="mt-3 space-y-1">
                        <DropdownMenuGroup>
                            <Link href="/dashboard/settings">
                                <DropdownMenuItem className="rounded-2xl cursor-pointer py-3.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 focus:bg-slate-50 transition-all border border-transparent whitespace-nowrap overflow-hidden">
                                    <User className="mr-3 h-4 w-4 text-slate-400" />
                                    <span className="flex-1">Account Settings</span>
                                    <Badge variant="outline" className="ml-auto text-[8px] font-black uppercase text-slate-400 border-slate-200">Edit</Badge>
                                </DropdownMenuItem>
                            </Link>
                            <Link href="/dashboard/transactions">
                                <DropdownMenuItem className="rounded-2xl cursor-pointer py-3.5 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 focus:bg-slate-50 transition-all border border-transparent">
                                    <CreditCard className="mr-3 h-4 w-4 text-slate-400" />
                                    <span>Transactions</span>
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator className="mx-2 bg-slate-50 my-2" />

                        <DropdownMenuItem
                            className="rounded-2xl cursor-pointer py-3.5 px-4 text-xs font-black text-rose-500 hover:bg-rose-50 focus:bg-rose-50 transition-all disabled:opacity-50"
                            onClick={handleSignOut}
                            disabled={isLoading}
                        >
                            <LogOut className="mr-3 h-4 w-4" />
                            <span className="flex-1">
                                {isLoading ? "Logging out..." : "Sign Out"}
                            </span>
                            {isLoading && <PulseLoader size="sm" color="red" />}
                        </DropdownMenuItem>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
