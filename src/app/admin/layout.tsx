import { Sidebar } from "../../components/admin/sidebar";
import { Header } from "../../components/admin/header";
import { NotificationPollingProvider } from "@/lib/contexts/notification-polling-context";
import { getCurrentUser } from "@/app/actions";
import { AdminPolicy } from "@/services/admin.policy";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!AdminPolicy.canAccessAdmin(user)) {
        redirect("/dashboard");
    }

    return (
        <NotificationPollingProvider userId={user!.id}>
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <Header user={user!} />
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </NotificationPollingProvider>
    );
}
