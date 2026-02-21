import { getMyStudents } from "../actions";
import { StudentCard } from "@/components/teacher/student-card";
import { Users } from "lucide-react";

export default async function TeacherStudentsPage() {
    const students = await getMyStudents();

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-black font-outfit text-slate-900">My Students</h1>
                <p className="text-muted-foreground font-medium">
                    {students.length} student{students.length !== 1 ? "s" : ""} linked to your account.
                </p>
            </div>

            {students.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold">No students assigned yet.</p>
                    <p className="text-sm text-slate-400 mt-1">Ask your admin to link students to your account.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                        <StudentCard key={student.id} student={student} />
                    ))}
                </div>
            )}
        </div>
    );
}
