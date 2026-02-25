import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { NotificationOverlay } from "@/components/global/notification-overlay"
import { NotificationPollingProvider } from "@/lib/contexts/notification-polling-context"
import { UserProfileMenu } from "@/components/global/user-profile-menu"
import { DynamicTitle } from "@/components/dashboard/dynamic-title"
import { StarsBalance } from "@/components/dashboard/stars-balance"
import { getCurrentUser } from "@/app/actions"
import { TitleProvider } from "@/lib/contexts/title-context"
import Link from "next/link"
import { LogIn } from "lucide-react"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // null for guests — layout is accessible without login
    const user = await getCurrentUser()

    return (
        <NotificationPollingProvider userId={user?.id ?? null}>
            <TitleProvider>
                <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
                    <DashboardSidebar />
                    <main className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-30">
                            <div className="flex items-center gap-2">
                                <DynamicTitle />
                            </div>
                            <div className="flex items-center gap-3">
                                {user ? (
                                    <>
                                        <StarsBalance balance={user.credits_balance} />
                                        <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
                                        <NotificationOverlay />
                                        <UserProfileMenu user={user} />
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-900 hover:bg-primary text-white text-xs font-black uppercase tracking-widest transition-all duration-200 shadow-sm hover:shadow-primary/20"
                                    >
                                        <LogIn className="w-3.5 h-3.5" />
                                        Sign In
                                    </Link>
                                )}
                            </div>
                        </header>
                        <div className="flex-1 overflow-y-auto flex flex-col pt-2 lg:pt-4">
                            {children}
                        </div>
                    </main>
                </div>
            </TitleProvider>
        </NotificationPollingProvider>
    )
}
