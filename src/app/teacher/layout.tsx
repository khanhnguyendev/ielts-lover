import { TeacherSidebar } from "@/components/teacher/sidebar";
import { TeacherHeader } from "@/components/teacher/header";
import { NotificationPollingProvider } from "@/lib/contexts/notification-polling-context";
import { getCurrentUser } from "@/app/actions";
import { AdminPolicy } from "@/services/admin.policy";
import { redirect } from "next/navigation";

export default async function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!AdminPolicy.canAccessTeacher(user)) {
        redirect("/dashboard");
    }

    return (
        <NotificationPollingProvider userId={user!.id}>
            <div className="flex h-screen bg-gray-50">
                <TeacherSidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <TeacherHeader user={user!} />
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </NotificationPollingProvider>
    );
}
