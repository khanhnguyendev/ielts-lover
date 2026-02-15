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
import { PulseLoader } from "./PulseLoader"

export function UserProfileMenu() {
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 ring-offset-background transition-colors hover:ring-2 hover:ring-primary/20 hover:ring-offset-2">
                    <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                        <AvatarImage src="/avatar-placeholder.png" alt="User" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">KN</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[280px] mt-3 p-2 shadow-2xl border-slate-100 bg-white rounded-[24px]" align="end">
                <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-black text-slate-900 leading-none">aws.khanhnguyen</p>
                        <p className="text-[10px] font-bold leading-none text-muted-foreground uppercase tracking-widest pt-1">
                            aws.khanhnguyen@gmail.com
                        </p>
                    </div>
                </DropdownMenuLabel>
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
