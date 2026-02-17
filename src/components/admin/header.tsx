import { UserProfileMenu } from "../global/user-profile-menu";
import { UserProfile } from "@/types";

export function Header({ user }: { user: UserProfile }) {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
            <h1 className="text-xl font-semibold text-gray-800">Admin Console</h1>
            <div className="flex items-center">
                <UserProfileMenu user={user} />
            </div>
        </header>
    );
}
