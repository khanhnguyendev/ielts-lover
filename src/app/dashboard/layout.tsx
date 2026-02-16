import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { NotificationOverlay } from "@/components/global/notification-overlay"
import { UserProfileMenu } from "@/components/global/user-profile-menu"
import { DynamicTitle } from "@/components/dashboard/dynamic-title"
import { getCurrentUser } from "@/app/actions"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getCurrentUser()
    if (!user) {
        redirect("/login")
    }

    return (
        <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="bg-muted px-3 py-1 rounded text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                            <DynamicTitle />
                        </div>
                        <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100 shadow-sm animate-in fade-in zoom-in duration-500">
                            <span className="text-[10px] font-black text-yellow-600">⭐ STARCREDITS:</span>
                            <span className="text-xs font-black text-yellow-700">{user.credits_balance}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationOverlay />
                        <UserProfileMenu user={user} />
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="max-w-[1280px] mx-auto p-8 lg:p-12">
                        {children}
                    </div>
                    <footer className="mt-auto py-8 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] border-t bg-white/30">
                        © 2026 IELTS Lover. &nbsp; Terms · Privacy · Contact us
                    </footer>
                </div>
            </main>
        </div>
    )
}
