import { getActivityDetail } from "@/app/admin/actions";
import { ActivityDetailView } from "@/components/admin/activity-detail-view";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const detail = await getActivityDetail(id);

    if (!detail) notFound();

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6 pb-20">
            <div className="flex items-center gap-3">
                <Link href="/admin">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <span className="text-sm font-bold text-slate-400">Back to Dashboard</span>
            </div>

            <ActivityDetailView detail={detail} />
        </div>
    );
}
