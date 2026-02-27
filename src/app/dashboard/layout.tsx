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
                <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100">
                    <DashboardSidebar />
                    <main className="flex-1 flex flex-col relative overflow-hidden">
                        {/* Premium Background Elements */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

                        <header className="h-16 border-b border-white/10 dark:border-white/5 bg-white/[0.2] dark:bg-slate-950/[0.1] backdrop-blur-3xl flex items-center justify-between px-6 lg:px-10 shrink-0 z-40 relative">
                            <div className="flex items-center gap-4">
                                <DynamicTitle />
                            </div>
                            <div className="flex items-center gap-5 lg:gap-8">
                                {user ? (
                                    <>
                                        <StarsBalance balance={user.credits_balance} />
                                        <div className="h-5 w-[1px] bg-slate-200/30 dark:bg-slate-700/30" />
                                        <div className="flex items-center gap-3 lg:gap-5">
                                            <NotificationOverlay />
                                            <UserProfileMenu user={user} />
                                        </div>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="premium-gradient flex items-center gap-3 h-10 px-6 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Initialize Protocol
                                    </Link>
                                )}
                            </div>
                        </header>
                        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
                            <div className="max-w-[1600px] mx-auto min-h-full flex flex-col pt-2">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </TitleProvider>
        </NotificationPollingProvider>
    )
}
