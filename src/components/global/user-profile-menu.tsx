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

export function UserProfileMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src="/avatar-placeholder.png" alt="User" />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">KN</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 p-1 shadow-xl border-border bg-card rounded-[16px]" align="end">
                <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">aws.khanhnguyen</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            aws.khanhnguyen@gmail.com
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-1" />
                <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem className="rounded-[8px] cursor-pointer py-2 text-sm">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-[8px] cursor-pointer py-2 text-sm">
                        <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>My Plan</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-[8px] cursor-pointer py-2 text-sm">
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="mx-1" />
                <DropdownMenuItem className="rounded-[8px] cursor-pointer py-2 text-sm text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
