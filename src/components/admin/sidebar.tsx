import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, BarChart3, Settings } from "lucide-react";

export function Sidebar() {
    const navItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Exercises", href: "/admin/exercises", icon: BookOpen },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Attempts Audit", href: "/admin/attempts", icon: BarChart3 },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="p-6 text-2xl font-bold border-b border-gray-800">
                IELTS Admin
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <item.icon size={20} />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
                    Return to App
                </Link>
            </div>
        </div>
    );
}
