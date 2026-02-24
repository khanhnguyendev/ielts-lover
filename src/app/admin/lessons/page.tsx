import { getLessons } from "@/app/actions";
import Link from "next/link";
import { Plus, Edit, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLessonsPage() {
    const lessons = await getLessons();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lessons</h1>
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{lessons.length} lessons</span>
                    </div>
                </div>
                <Link href="/admin/lessons/create">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Lesson
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Order</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Title</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Video</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {lessons.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No lessons found. Create your first one!
                                </td>
                            </tr>
                        ) : (
                            lessons.map((lesson) => (
                                <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">#{lesson.order_index}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{lesson.title}</div>
                                        <div className="text-xs text-gray-500 mt-0.5 max-w-md truncate">{lesson.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {lesson.video_url ? (
                                            <a href={lesson.video_url} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:underline">
                                                <Video className="w-3 h-3 mr-1.5" />
                                                View
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">No video</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/lessons/${lesson.id}`}>
                                            <Button variant="ghost" size="sm">
                                                <Edit className="w-4 h-4 text-gray-600" />
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
