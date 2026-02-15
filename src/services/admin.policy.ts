import { UserProfile } from "@/types";

export class AdminPolicy {
    static canAccessAdmin(user: UserProfile | null): boolean {
        return user?.role === "admin";
    }
}
