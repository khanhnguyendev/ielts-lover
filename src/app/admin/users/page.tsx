"use client";

import { useState, useEffect } from "react";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import {
    Search,
    UserPlus,
    CreditCard,
    ShieldCheck,
    Plus,
    Minus,
    MoreHorizontal,
    User,
    History,
    Ban,
    GraduationCap,
    UserMinus,
} from "lucide-react";
import { getAdminUsers, adjustUserCredits, getAdminUserTransactions, getAdminUserAttempts, setUserRole, getUserLastActivityMap } from "../actions";
import { UserProfile } from "@/types";
import { USER_ROLES, ATTEMPT_STATES } from "@/lib/constants";
import { PulseLoader } from "@/components/global/pulse-loader";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { CreditTransaction } from "@/repositories/interfaces";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotification } from "@/lib/contexts/notification-context";
import { cn, formatCredits } from "@/lib/utils";
import Link from "next/link";
import { NOTIFY_MSGS } from "@/lib/constants/messages";

export default function UsersPage() {
    const { notifySuccess, notifyError } = useNotification();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Credit Adjustment Modal State
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState<string>("50");
    const [adjustmentReason, setAdjustmentReason] = useState<string>("Manual Top Up");
    const [isAdjusting, setIsAdjusting] = useState(false);

    // History & Details Modal State
    const [historyUser, setHistoryUser] = useState<UserProfile | null>(null);
    const [userTransactions, setUserTransactions] = useState<CreditTransaction[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [detailsUser, setDetailsUser] = useState<UserProfile | null>(null);

    // Attempts History Modal State
    const [attemptsUser, setAttemptsUser] = useState<UserProfile | null>(null);
    const [userAttempts, setUserAttempts] = useState<any[]>([]);
    const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);

    // Role filter
    const [roleFilter, setRoleFilter] = useState<string>("all");

    // Last activity map (derived from credit_transactions)
    const [lastActivityMap, setLastActivityMap] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (historyUser) {
            fetchUserTransactions(historyUser.id);
        }
    }, [historyUser]);

    async function fetchUserTransactions(userId: string) {
        setIsLoadingHistory(true);
        try {
            const data = await getAdminUserTransactions(userId);
            setUserTransactions(data);
        } catch (error) {
            notifyError(NOTIFY_MSGS.ERROR.LOAD_FAILED.title, NOTIFY_MSGS.ERROR.LOAD_FAILED.description);
        } finally {
            setIsLoadingHistory(false);
        }
    }

    async function fetchUsers() {
        setIsLoading(true);
        try {
            const [data, activityMap] = await Promise.all([
                getAdminUsers(),
                getUserLastActivityMap(),
            ]);
            setUsers(data);
            setLastActivityMap(activityMap);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            notifyError(NOTIFY_MSGS.ERROR.LOAD_FAILED.title, NOTIFY_MSGS.ERROR.LOAD_FAILED.description);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (attemptsUser) {
            fetchUserAttempts(attemptsUser.id);
        }
    }, [attemptsUser]);

    async function fetchUserAttempts(userId: string) {
        setIsLoadingAttempts(true);
        try {
            const data = await getAdminUserAttempts(userId);
            setUserAttempts(data);
        } catch (error) {
            notifyError(NOTIFY_MSGS.ERROR.LOAD_FAILED.title, NOTIFY_MSGS.ERROR.LOAD_FAILED.description);
        } finally {
            setIsLoadingAttempts(false);
        }
    }

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleSetRole = async (userId: string, role: string) => {
        try {
            await setUserRole(userId, role);
            notifySuccess(NOTIFY_MSGS.SUCCESS.ROLE_UPDATED.title, `User role changed to ${role}`);
            fetchUsers();
        } catch (error) {
            notifyError(NOTIFY_MSGS.ERROR.UPDATE_FAILED.title, error instanceof Error ? error.message : NOTIFY_MSGS.ERROR.UPDATE_FAILED.description);
        }
    };

    const handleAdjustCredits = async () => {
        if (!selectedUser) return;

        setIsAdjusting(true);
        try {
            await adjustUserCredits(
                selectedUser.id,
                parseInt(adjustmentAmount),
                adjustmentReason
            );
            notifySuccess(NOTIFY_MSGS.SUCCESS.CREDITS_ADJUSTED.title, `Successfully adjusted credits for ${selectedUser.email}`);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            notifyError(NOTIFY_MSGS.ERROR.UNEXPECTED.title, NOTIFY_MSGS.ERROR.UNEXPECTED.description);
        } finally {
            setIsAdjusting(false);
        }
    };

    const columns: DataTableColumn<UserProfile>[] = [
        {
            key: "profile",
            header: "User Profile",
            render: (user) => (
                <div className="flex items-center gap-3">
                    <Avatar size="lg" className="border border-slate-200 dark:border-white/10 shadow-sm transition-transform group-hover:scale-105 duration-500">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-slate-100 dark:bg-white/5 font-black text-slate-400 dark:text-slate-500 text-[10px] uppercase">
                            {user.email.substring(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                            {user.full_name && user.full_name.trim() !== "" ? user.full_name : user.email.split('@')[0]}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-500 leading-tight">
                            {user.email}
                        </p>
                    </div>
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            align: "center",
            render: (user) => (
                <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                    user.role === USER_ROLES.ADMIN
                        ? "bg-amber-100/50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                        : user.role === USER_ROLES.TEACHER
                            ? "bg-indigo-100/50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
                            : "bg-slate-100/50 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10"
                )}>
                    {user.role === USER_ROLES.ADMIN && <ShieldCheck size={12} />}
                    {user.role === USER_ROLES.TEACHER && <GraduationCap size={12} />}
                    {user.role === USER_ROLES.ADMIN ? "Admin" : user.role === USER_ROLES.TEACHER ? "Teacher" : "Student"}
                </div>
            )
        },
        {
            key: "activity",
            header: "Last Active",
            align: "center",
            render: (user) => {
                const lastActive = lastActivityMap[user.id];
                return (
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {lastActive ? new Date(lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "-"}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                            {lastActive ? new Date(lastActive).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : ""}
                        </span>
                    </div>
                );
            }
        },
        {
            key: "credits",
            header: "Credits",
            align: "center",
            render: (user) => (
                <div className="flex flex-col items-center gap-0.5 group/credit">
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono group-hover/credit:text-primary transition-colors">
                        {formatCredits(user.credits_balance ?? 0)}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">StarCredits</span>
                </div>
            )
        },
        {
            key: "joined",
            header: "Joined",
            align: "center",
            render: (user) => (
                <div className="flex flex-col items-center gap-0.5">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                        {new Date(user.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                </div>
            )
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (user) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg font-black text-[9px] uppercase tracking-widest gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                        onClick={() => setSelectedUser(user)}
                    >
                        <CreditCard size={14} className="text-primary" />
                        Top-Up
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary transition-colors">
                                <MoreHorizontal size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-2xl border-slate-100 dark:border-white/10 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 p-2">
                            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">User Control</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-50 dark:bg-white/5 mx-1 my-1" />
                            <DropdownMenuItem
                                className="gap-2 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl cursor-pointer focus:bg-slate-50 dark:focus:bg-white/5"
                                onClick={() => setDetailsUser(user)}
                            >
                                <User size={14} className="text-slate-400" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="gap-2 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl cursor-pointer focus:bg-slate-50 dark:focus:bg-white/5"
                                onClick={() => setHistoryUser(user)}
                            >
                                <History size={14} className="text-slate-400" />
                                Transaction History
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="gap-2 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl cursor-pointer focus:bg-slate-50 dark:focus:bg-white/5"
                                onClick={() => setAttemptsUser(user)}
                            >
                                <History size={14} className="text-slate-400" />
                                Attempt History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50 dark:bg-white/5 mx-1 my-1" />
                            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Role Authority</DropdownMenuLabel>
                            {user.role === USER_ROLES.USER && (
                                <DropdownMenuItem
                                    className="gap-2 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl text-indigo-600 dark:text-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-500/10 cursor-pointer"
                                    onClick={() => handleSetRole(user.id, USER_ROLES.TEACHER)}
                                >
                                    <GraduationCap size={14} />
                                    Promote to Teacher
                                </DropdownMenuItem>
                            )}
                            {user.role === USER_ROLES.TEACHER && (
                                <DropdownMenuItem
                                    className="gap-2 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl text-slate-600 dark:text-slate-400 focus:bg-slate-50 dark:focus:bg-white/5 cursor-pointer"
                                    onClick={() => handleSetRole(user.id, USER_ROLES.USER)}
                                >
                                    <UserMinus size={14} />
                                    Demote to Student
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-slate-50 dark:bg-white/5 mx-1 my-1" />
                            <DropdownMenuItem
                                disabled={user.role === USER_ROLES.ADMIN}
                                className="gap-2 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-500/10 cursor-pointer disabled:opacity-50"
                            >
                                <Ban size={14} />
                                Suspend Account
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 p-6">
            <DataTable
                data={filteredUsers}
                columns={columns}
                rowKey={(u) => u.id}
                isLoading={isLoading}
                loadingText="Syncing User Data..."
                pageSize={10}
                toolbar={
                    <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
                        <div className="flex bg-slate-100/50 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/60 dark:border-white/10 backdrop-blur-md">
                            {[
                                { label: "All", value: "all" },
                                { label: "Students", value: USER_ROLES.USER },
                                { label: "Teachers", value: USER_ROLES.TEACHER },
                                { label: "Admins", value: USER_ROLES.ADMIN },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setRoleFilter(opt.value)}
                                    className={cn(
                                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                        roleFilter === opt.value
                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg shadow-black/5 ring-1 ring-black/5"
                                            : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-6 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[10px] font-black uppercase tracking-widest w-64 shadow-inner"
                                />
                            </div>
                            <Button className="bg-slate-900 dark:bg-primary text-white rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-black/10 text-[10px] gap-2 px-5 h-10">
                                <UserPlus size={16} />
                                <span>Add User</span>
                            </Button>
                        </div>
                    </div>
                }
                emptyState={{
                    icon: <User className="h-8 w-8 text-slate-300" />,
                    title: "No users found",
                    description: "We couldn't find any users matching your current search or filter criteria."
                }}
            />

            {/* Credit Adjustment Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl overflow-hidden p-0">
                    <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <CreditCard className="h-12 w-12 text-primary mb-4 relative z-10" />
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black font-outfit text-white">Adjust Credits</DialogTitle>
                            <DialogDescription className="text-slate-400 font-medium flex items-center flex-wrap gap-1.5 mt-1">
                                Manually update StarCredits for <Badge variant="secondary" className="bg-white/10 text-white border-white/20 font-bold px-2 py-0.5 rounded-full text-[10px] ml-0.5 shadow-sm">{selectedUser?.email}</Badge>
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-xs font-black uppercase tracking-widest text-slate-400">Adjustment Amount</Label>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Input
                                            id="amount"
                                            type="number"
                                            value={adjustmentAmount}
                                            onChange={(e) => setAdjustmentAmount(e.target.value)}
                                            className="font-black text-lg py-6 pr-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all"
                                        />
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Stars</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100"
                                            onClick={() => setAdjustmentAmount(prev => (parseInt(prev || "0") + 50).toString())}
                                        >
                                            <Plus size={14} />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
                                            onClick={() => setAdjustmentAmount(prev => (parseInt(prev || "0") - 50).toString())}
                                        >
                                            <Minus size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-xs font-black uppercase tracking-widest text-slate-400">Reason for Adjustment</Label>
                                <Input
                                    id="reason"
                                    placeholder="e.g. Compensation, Marketing Gift..."
                                    value={adjustmentReason}
                                    onChange={(e) => setAdjustmentReason(e.target.value)}
                                    className="rounded-2xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-medium py-6"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedUser(null)}
                                className="rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px] py-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAdjustCredits}
                                disabled={isAdjusting || !adjustmentAmount}
                                className="rounded-2xl font-black py-6 px-8 bg-slate-900 border-none shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all min-w-[140px]"
                            >
                                {isAdjusting ? <PulseLoader size="sm" color="white" /> : "Confirm Update"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Transaction History Dialog */}
            <Dialog open={!!historyUser} onOpenChange={(open) => !open && setHistoryUser(null)}>
                <DialogContent className="sm:max-w-4xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-slate-900 p-8 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black font-outfit text-white flex items-center gap-3">
                                <History className="h-6 w-6 text-primary" />
                                Transaction History
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 font-medium flex items-center flex-wrap gap-1.5 mt-1">
                                Credit usage and top-up history for <Badge variant="secondary" className="bg-white/10 text-white border-white/20 font-bold px-2 py-0.5 rounded-full text-[10px] ml-0.5 shadow-sm">{historyUser?.email}</Badge>
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 max-h-[70vh] overflow-y-auto">
                        {isLoadingHistory ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <PulseLoader size="lg" color="primary" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Transactions...</p>
                            </div>
                        ) : (
                            <TransactionTable transactions={userTransactions} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* User Details Dialog */}
            <Dialog open={!!detailsUser} onOpenChange={(open) => !open && setDetailsUser(null)}>
                <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-primary p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black font-outfit text-white">User Profile</DialogTitle>
                            <DialogDescription className="text-indigo-100 font-medium">
                                Comprehensive overview of user account details.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
                            <Avatar size="lg" className="h-20 w-20 border-4 border-slate-100 shadow-sm">
                                <AvatarImage src={detailsUser?.avatar_url || undefined} />
                                <AvatarFallback className="text-xl">{detailsUser?.email.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 leading-none mb-1">{detailsUser?.full_name || "New User"}</h3>
                                <p className="text-sm font-medium text-slate-500">{detailsUser?.email}</p>
                                <div className="mt-2 flex gap-2">
                                    <Badge className={cn(
                                        "rounded-full text-[9px] font-black uppercase tracking-widest",
                                        detailsUser?.role === USER_ROLES.ADMIN
                                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                            : detailsUser?.role === USER_ROLES.TEACHER
                                                ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                                    )}>
                                        {detailsUser?.role === USER_ROLES.ADMIN ? "Admin" : detailsUser?.role === USER_ROLES.TEACHER ? "Teacher" : "Student"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Score</span>
                                <p className="text-lg font-black text-slate-900">{detailsUser?.target_score || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Test Type</span>
                                <p className="text-lg font-black text-slate-900 capitalize">{detailsUser?.test_type || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Member Since</span>
                                <p className="text-sm font-bold text-slate-700">
                                    {detailsUser && new Date(detailsUser.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Star Balance</span>
                                <p className="text-lg font-black text-primary font-mono">{formatCredits(detailsUser?.credits_balance ?? 0)}</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                className="w-full rounded-2xl font-black py-6 bg-slate-900"
                                onClick={() => {
                                    setSelectedUser(detailsUser);
                                    setDetailsUser(null);
                                }}
                            >
                                <CreditCard size={18} className="mr-2" />
                                Adjust User Credits
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Attempt History Dialog */}
            <Dialog open={!!attemptsUser} onOpenChange={(open) => !open && setAttemptsUser(null)}>
                <DialogContent className="sm:max-w-4xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-slate-900 p-8 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black font-outfit text-white flex items-center gap-3">
                                <History className="h-6 w-6 text-primary" />
                                Attempt History
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 font-medium flex items-center flex-wrap gap-1.5 mt-1">
                                Practice history and scores for <Badge variant="secondary" className="bg-white/10 text-white border-white/20 font-bold px-2 py-0.5 rounded-full text-[10px] ml-0.5 shadow-sm">{attemptsUser?.email}</Badge>
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-8 max-h-[70vh] overflow-y-auto">
                        {isLoadingAttempts ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <PulseLoader size="lg" color="primary" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Attempts...</p>
                            </div>
                        ) : userAttempts.length === 0 ? (
                            <div className="py-20 text-center text-slate-400 font-bold">No attempts found for this user.</div>
                        ) : (
                            <DataTable
                                data={userAttempts}
                                rowKey={(a) => a.id}
                                pageSize={5}
                                columns={[
                                    {
                                        key: "exercise",
                                        header: "Exercise",
                                        render: (attempt) => (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 leading-none">
                                                    {attempt.exercises?.type?.startsWith('writing') ? 'Writing Task' : 'Speaking Task'}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">
                                                    ID: {attempt.exercise_id?.substring(0, 8)}
                                                </span>
                                            </div>
                                        )
                                    },
                                    {
                                        key: "status",
                                        header: "Status",
                                        align: "center",
                                        render: (attempt) => (
                                            <Badge className={cn(
                                                "rounded-full text-[9px] font-black uppercase tracking-widest",
                                                attempt.state === ATTEMPT_STATES.EVALUATED ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                                            )}>
                                                {attempt.state}
                                            </Badge>
                                        )
                                    },
                                    {
                                        key: "score",
                                        header: "Score",
                                        align: "center",
                                        render: (attempt) => (
                                            <span className="font-black text-slate-900 font-mono italic">
                                                {attempt.score || "-"}
                                            </span>
                                        )
                                    },
                                    {
                                        key: "date",
                                        header: "Date",
                                        align: "center",
                                        render: (attempt) => (
                                            <span className="text-xs font-bold text-slate-500">
                                                {new Date(attempt.created_at).toLocaleDateString()}
                                            </span>
                                        )
                                    },
                                    {
                                        key: "action",
                                        header: "Action",
                                        align: "right",
                                        render: (attempt) => (
                                            <Link href={`/dashboard/reports/${attempt.id}`} target="_blank">
                                                <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest text-primary hover:bg-primary/5">
                                                    View
                                                </Button>
                                            </Link>
                                        )
                                    }
                                ]}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
