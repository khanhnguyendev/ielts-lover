import { getActivityDetail } from "@/app/admin/actions";
import { ActivityDetailView } from "@/components/admin/activity-detail-view";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/global/back-button";
import { notFound } from "next/navigation";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const detail = await getActivityDetail(id);

    if (!detail) notFound();

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6 pb-20">
            <div className="flex items-center gap-3">
                <BackButton href="/admin" label="Back to Dashboard" />
            </div>

            <ActivityDetailView detail={detail} />
        </div>
    );
}
