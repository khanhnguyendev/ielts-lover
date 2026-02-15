"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Search, UserPlus, CreditCard, ShieldCheck, Edit } from "lucide-react";
import { getAllUsers } from "@/app/actions";
import { UserProfile } from "@/types";
import { PulseLoader } from "@/components/global/PulseLoader";

export default function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            setIsLoading(true);
            try {
                const data = await getAllUsers();
                setUsers(data as any);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUsers();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-500">Monitor users, track usage, and manage subscriptions.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                        <UserPlus size={20} />
                        <span>Add User</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Daily Usage</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <PulseLoader size="lg" color="primary" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Scanning users...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-gray-500">No users found.</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>
                                        <span className={`flex items-center space-x-1.5 px-2 py-1 rounded-full text-xs font-medium w-fit ${user.is_premium ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {user.is_premium ? <ShieldCheck size={12} /> : null}
                                            <span>{user.is_premium ? "Premium" : "Free"}</span>
                                        </span>
                                    </TableCell>
                                    <TableCell>{user.target_score}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex-1 h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${user.daily_quota_used >= 5 ? "bg-red-500" : "bg-purple-500"}`}
                                                    style={{ width: `${(user.daily_quota_used / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500">{user.daily_quota_used}/5</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.created_at}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors" title="Manage Subscription">
                                                <CreditCard size={18} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Edit size={18} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
