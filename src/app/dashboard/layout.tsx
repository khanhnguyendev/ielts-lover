import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { NotificationOverlay } from "@/components/global/notification-overlay"
import { NotificationPollingProvider } from "@/lib/contexts/notification-polling-context"
import { UserProfileMenu } from "@/components/global/user-profile-menu"
import { DynamicTitle } from "@/components/dashboard/dynamic-title"
import { StarsBalance } from "@/components/dashboard/stars-balance"
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
        <NotificationPollingProvider userId={user.id}>
            <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
                <DashboardSidebar />
                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-30">
                        <div className="flex items-center gap-2">
                            <DynamicTitle />
                        </div>
                        <div className="flex items-center gap-3">
                            <StarsBalance balance={user.credits_balance} />
                            <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
                            <NotificationOverlay />
                            <UserProfileMenu user={user} />
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto flex flex-col pt-2 lg:pt-4">
                        {children}
                    </div>
                </main>
            </div>
        </NotificationPollingProvider>
    )
}
