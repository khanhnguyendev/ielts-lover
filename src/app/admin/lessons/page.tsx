"use client";

import { useEffect, useState } from "react";
import { getLessons } from "@/app/actions";
import Link from "next/link";
import { Plus, Edit, Trash2, Video, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Lesson } from "@/types/lesson";
import { cn } from "@/lib/utils";

export default function AdminLessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const data = await getLessons();
                setLessons(data);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLessons();
    }, []);

    const filteredLessons = lessons.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DataTable
            data={filteredLessons}
            isLoading={isLoading}
            loadingText="Fetching Lessons..."
            rowKey={(l) => l.id}
            pageSize={10}
            toolbar={
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Lessons</h1>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{filteredLessons.length} lessons</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search lessons..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-6 py-2 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[10px] font-black uppercase tracking-widest w-64"
                            />
                        </div>
                        <Link href="/admin/lessons/create">
                            <Button className="bg-slate-900 dark:bg-primary text-white rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-black/10 text-[10px] gap-2 px-5 h-10 hover:bg-slate-800">
                                <Plus className="w-4 h-4" />
                                <span>Create Lesson</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            }
            columns={[
                {
                    key: "order",
                    header: "Order",
                    width: "w-[80px]",
                    align: "center",
                    render: (l) => (
                        <span className="text-sm font-black text-slate-400 dark:text-slate-600 font-mono">
                            #{l.order_index}
                        </span>
                    )
                },
                {
                    key: "content",
                    header: "Title & Description",
                    render: (l) => (
                        <div className="flex flex-col py-1">
                            <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">{l.title}</span>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-lg truncate">
                                {l.description || "No description provided"}
                            </span>
                        </div>
                    )
                },
                {
                    key: "video",
                    header: "Video",
                    width: "w-[120px]",
                    render: (l) => l.video_url ? (
                        <a
                            href={l.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                        >
                            <Video className="w-3.5 h-3.5" />
                            Watch
                        </a>
                    ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">No media</span>
                    )
                },
                {
                    key: "actions",
                    header: "Actions",
                    width: "w-[100px]",
                    align: "right",
                    render: (l) => (
                        <Link href={`/admin/lessons/${l.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                                <Edit className="w-4 h-4" />
                            </Button>
                        </Link>
                    )
                }
            ]}
            emptyState={{
                icon: <BookOpen className="h-10 w-10 text-slate-200" />,
                title: "No lessons found",
                description: searchQuery ? "No lessons match your search query." : "You haven't created any lessons yet."
            }}
        />
    );
}
