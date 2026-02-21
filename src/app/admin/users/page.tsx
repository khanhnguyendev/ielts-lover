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
    Ban
} from "lucide-react";
import { getAdminUsers, adjustUserCredits, getAdminUserTransactions, getAdminUserAttempts } from "../actions";
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
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { useNotification } from "@/lib/contexts/notification-context";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
            notifyError("Fetch Failed", "Could not load transaction history.");
        } finally {
            setIsLoadingHistory(false);
        }
    }

    async function fetchUsers() {
        setIsLoading(true);
        try {
            const data = await getAdminUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            notifyError("Fetch Failed", "Could not load user profiles.");
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
            notifyError("Fetch Failed", "Could not load attempt history.");
        } finally {
            setIsLoadingAttempts(false);
        }
    }

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdjustCredits = async () => {
        if (!selectedUser) return;

        setIsAdjusting(true);
        try {
            await adjustUserCredits(
                selectedUser.id,
                parseInt(adjustmentAmount),
                adjustmentReason
            );
            notifySuccess("Credits Adjusted", `Successfully adjusted credits for ${selectedUser.email}`);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            notifyError("Adjustment Failed", "Failed to update user credits.");
        } finally {
            setIsAdjusting(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-end items-center">
                <div className="flex space-x-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition shadow-sm text-sm">
                        <UserPlus size={18} />
                        <span>Add User</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">User Profile</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Last Active</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Current Credits</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Joined</TableHead>
                            <TableHead className="text-right pr-6 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <PulseLoader size="lg" color="primary" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Syncing User Data...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-20 text-center text-slate-400 font-bold">
                                    No users match your search criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar size="lg" className="border border-slate-200">
                                                <AvatarImage src={user.avatar_url || undefined} />
                                                <AvatarFallback className="bg-slate-100 font-black text-slate-400 text-[10px] uppercase">
                                                    {user.email.substring(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <p className="text-sm font-black text-slate-900 leading-tight">
                                                    {user.full_name && user.full_name.trim() !== "" ? user.full_name : user.email.split('@')[0]}
                                                </p>
                                                <p className="text-[11px] font-medium text-slate-500 leading-tight">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            user.role === USER_ROLES.ADMIN
                                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                : "bg-slate-100 text-slate-600 border border-slate-200"
                                        )}>
                                            {user.role === USER_ROLES.ADMIN && <ShieldCheck size={12} />}
                                            {user.role === USER_ROLES.ADMIN ? "Admin" : "Member"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-xs font-bold text-slate-500">
                                                {user.last_seen_at ? new Date(user.last_seen_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "-"}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {user.last_seen_at ? new Date(user.last_seen_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : ""}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-sm font-black text-slate-900 font-mono">{user.credits_balance ?? 0}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">StarCredits</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <p className="text-xs font-bold text-slate-500">
                                                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {new Date(user.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={user.role === USER_ROLES.ADMIN}
                                                className="h-8 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 bg-white border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                onClick={() => setSelectedUser(user)}
                                            >
                                                <CreditCard size={14} className={cn(user.role === USER_ROLES.ADMIN ? "text-slate-300" : "text-primary")} />
                                                Manual Top-Up
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary transition-colors">
                                                        <MoreHorizontal size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl">
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">User Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="gap-2 font-bold text-sm py-2.5 cursor-pointer"
                                                        onClick={() => setDetailsUser(user)}
                                                    >
                                                        <User size={14} className="text-slate-400" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="gap-2 font-bold text-sm py-2.5 cursor-pointer"
                                                        onClick={() => setHistoryUser(user)}
                                                    >
                                                        <History size={14} className="text-slate-400" />
                                                        Transaction History
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="gap-2 font-bold text-sm py-2.5 cursor-pointer"
                                                        onClick={() => setAttemptsUser(user)}
                                                    >
                                                        <History size={14} className="text-slate-400" />
                                                        Attempt History
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        disabled={user.role === USER_ROLES.ADMIN}
                                                        className="gap-2 font-bold text-sm py-2.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Ban size={14} />
                                                        Suspend User
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

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
                                        detailsUser?.role === USER_ROLES.ADMIN ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                                    )}>
                                        {detailsUser?.role === USER_ROLES.ADMIN ? "Admin" : "Member"}
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
                                <p className="text-lg font-black text-primary font-mono">{detailsUser?.credits_balance ?? 0}</p>
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
                            <div className="rounded-xl border border-slate-100 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest pl-4">Exercise</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Score</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Date</TableHead>
                                            <TableHead className="text-right pr-4 text-[10px] font-black uppercase tracking-widest">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {userAttempts.map((attempt) => (
                                            <TableRow key={attempt.id} className="hover:bg-slate-50/50 border-slate-50">
                                                <TableCell className="pl-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900 leading-none">
                                                            {attempt.exercises?.type?.startsWith('writing') ? 'Writing Task' : 'Speaking Task'}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">
                                                            ID: {attempt.exercise_id?.substring(0, 8)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={cn(
                                                        "rounded-full text-[9px] font-black uppercase tracking-widest",
                                                        attempt.state === ATTEMPT_STATES.EVALUATED ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                                                    )}>
                                                        {attempt.state}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center font-black text-slate-900 font-mono">
                                                    {attempt.score || "-"}
                                                </TableCell>
                                                <TableCell className="text-center text-xs font-bold text-slate-500">
                                                    {new Date(attempt.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right pr-4">
                                                    <Link href={`/dashboard/reports/${attempt.id}`} target="_blank">
                                                        <Button variant="ghost" size="sm" className="h-8 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest text-primary hover:bg-primary/5">
                                                            View
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
