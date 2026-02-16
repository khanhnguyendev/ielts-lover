"use client"

import * as React from "react"
import { LogOut, User, CreditCard, Settings } from "lucide-react"
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
import { signOut } from "@/app/actions"
import { useState } from "react"
import { UserProfile } from "@/types"
import { PulseLoader } from "./PulseLoader"

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
                <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 ring-offset-background transition-colors hover:ring-2 hover:ring-primary/20 hover:ring-offset-2">
                    <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                        <AvatarImage src={user.avatar_url} alt={user.full_name || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {getInitials()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[280px] mt-3 p-2 shadow-2xl border-slate-100 bg-white rounded-[24px]" align="end">
                <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-900 leading-none">
                                {user.full_name || user.email.split("@")[0]}
                            </p>
                            {user.is_premium && (
                                <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-tighter shadow-sm animate-in fade-in duration-700">Premium</span>
                            )}
                        </div>
                        <p className="text-[10px] font-bold leading-none text-muted-foreground uppercase tracking-widest pt-1">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-2 bg-slate-50" />
                <div className="px-4 py-3 mx-2 my-1 rounded-2xl bg-yellow-50/50 border border-yellow-100/50 group hover:bg-yellow-50 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-sm shadow-yellow-200 group-hover:scale-110 transition-transform">
                                <span className="text-white text-sm">⭐</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest leading-none mb-1">Balance</p>
                                <p className="text-sm font-black text-yellow-700 leading-none">{user.credits_balance} StarCredits</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100/50 p-0 px-2 rounded-lg">Top Up</Button>
                    </div>
                </div>
                <DropdownMenuSeparator className="mx-2 bg-slate-50" />
                <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem className="rounded-xl cursor-pointer py-3 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:bg-slate-50 transition-colors">
                        <User className="mr-3 h-4 w-4 text-slate-600" />
                        <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl cursor-pointer py-3 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:bg-slate-50 transition-colors">
                        <CreditCard className="mr-3 h-4 w-4 text-slate-600" />
                        <span>My Plan</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="mx-2 bg-slate-50" />
                <DropdownMenuItem
                    className="rounded-xl cursor-pointer py-3 px-4 text-xs font-black text-red-500 hover:bg-red-50 focus:bg-red-50 transition-colors disabled:opacity-50"
                    onClick={handleSignOut}
                    disabled={isLoading}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="flex items-center gap-2">
                        {isLoading ? (
                            <>
                                <PulseLoader size="sm" color="red" className="flex-row gap-1" />
                                <span>Logging out...</span>
                            </>
                        ) : (
                            "Log out"
                        )}
                    </span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
