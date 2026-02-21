"use client"

import { UserProfileMenu } from "../global/user-profile-menu";
import { UserProfile } from "@/types";
import { TeacherDynamicTitle } from "./dynamic-title";
import { GraduationCap } from "lucide-react";

export function TeacherHeader({ user }: { user: UserProfile }) {
    return (
        <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center justify-between px-8 transition-all">
            <div className="flex items-center gap-8">
                <TeacherDynamicTitle />
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 pr-6 border-r border-slate-100">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">Teacher</span>
                    </div>
                </div>

                <div className="flex items-center">
                    <UserProfileMenu user={user} />
                </div>
            </div>
        </header>
    );
}
