import { getAllCreditRequests } from "../actions";
import { CreditRequestAdmin } from "./credit-request-admin";

export default async function AdminCreditRequestsPage() {
    const requests = await getAllCreditRequests();

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-black font-outfit text-slate-900">Credit Requests</h1>
                <p className="text-muted-foreground font-medium">
                    Review and manage credit requests from teachers.
                </p>
            </div>

            <CreditRequestAdmin requests={requests} />
        </div>
    );
}
