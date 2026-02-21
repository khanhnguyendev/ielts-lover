import { UserProfile } from "@/types";
import { USER_ROLES } from "@/lib/constants";

export class AdminPolicy {
    static canAccessAdmin(user: UserProfile | null): boolean {
        return user?.role === USER_ROLES.ADMIN;
    }

    static canAccessTeacher(user: UserProfile | null): boolean {
        return user?.role === USER_ROLES.TEACHER || user?.role === USER_ROLES.ADMIN;
    }

    static canManageCreditsDirectly(user: UserProfile | null): boolean {
        return user?.role === USER_ROLES.ADMIN;
    }

    static canAssignTeachers(user: UserProfile | null): boolean {
        return user?.role === USER_ROLES.ADMIN;
    }

    static canCreateExercises(user: UserProfile | null): boolean {
        return user?.role === USER_ROLES.TEACHER || user?.role === USER_ROLES.ADMIN;
    }
}
