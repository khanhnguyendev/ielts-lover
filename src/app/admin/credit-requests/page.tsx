import { getAllCreditRequests } from "../actions";
import { CreditRequestAdmin } from "./credit-request-admin";

export default async function AdminCreditRequestsPage() {
    const requests = await getAllCreditRequests();

    return (
        <div className="space-y-6 p-6">
            <CreditRequestAdmin requests={requests} />
        </div>
    );
}
