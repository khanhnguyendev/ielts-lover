"use client"

import { UserProfileMenu } from "../global/user-profile-menu";
import { NotificationOverlay } from "../global/notification-overlay";
import { UserProfile } from "@/types";
import { AdminDynamicTitle } from "./dynamic-title";
import { Search, ShieldCheck } from "lucide-react";

export function Header({ user }: { user: UserProfile }) {
    return (
        <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center justify-between px-8 transition-all">
            <div className="flex items-center gap-8">
                <AdminDynamicTitle />

                {/* Desktop Search Placeholder */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl w-80 group cursor-text transition-all hover:bg-slate-100/80">
                    <Search className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="text-xs font-bold text-slate-400">Search users, exercises...</span>
                    <div className="ml-auto flex items-center gap-1">
                        <kbd className="h-5 px-1.5 rounded border border-slate-200 bg-white text-[10px] font-black text-slate-400 uppercase">⌘</kbd>
                        <kbd className="h-5 px-1.5 rounded border border-slate-200 bg-white text-[10px] font-black text-slate-400 uppercase">K</kbd>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 pr-6 border-r border-slate-100">
                    <NotificationOverlay />
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Super Admin</span>
                    </div>
                </div>

                <div className="flex items-center">
                    <UserProfileMenu user={user} />
                </div>
            </div>
        </header>
    );
}
