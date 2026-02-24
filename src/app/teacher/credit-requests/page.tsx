import { getMyCreditRequests, getMyStudents } from "../actions";
import { CreditRequestForm } from "@/components/teacher/credit-request-form";
import { CreditRequestList } from "@/components/teacher/credit-request-list";

export default async function TeacherCreditRequestsPage() {
    const [requests, students] = await Promise.all([
        getMyCreditRequests(),
        getMyStudents(),
    ]);

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-black font-outfit text-slate-900">Credit Requests</h1>
                <p className="text-muted-foreground font-medium">
                    Request StarCredits for your students. Admin will review and approve.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <CreditRequestForm students={students} />
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Request History</h2>
                        <div className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{requests.length} items</span>
                        </div>
                    </div>
                    <CreditRequestList requests={requests} />
                </div>
            </div>
        </div>
    );
}
