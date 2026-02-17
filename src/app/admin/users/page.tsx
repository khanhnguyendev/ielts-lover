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
    MoreHorizontal
} from "lucide-react";
import { getAdminUsers, adjustUserCredits } from "../actions";
import { UserProfile } from "@/types";
import { PulseLoader } from "@/components/global/PulseLoader";
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
import { useNotification } from "@/lib/contexts/notification-context";
import { cn } from "@/lib/utils";

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

    useEffect(() => {
        fetchUsers();
    }, []);

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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black font-outfit text-slate-900">User Management</h1>
                    <p className="text-muted-foreground font-medium">Manage user accounts and credit balances.</p>
                </div>
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
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 uppercase text-xs">
                                                {user.email.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 leading-tight mb-0.5">{user.full_name || "New User"}</p>
                                                <p className="text-[11px] font-medium text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            user.is_premium
                                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                                : "bg-slate-100 text-slate-600 border border-slate-200"
                                        )}>
                                            {user.is_premium && <ShieldCheck size={12} />}
                                            {user.is_premium ? "Premium" : "Free Tier"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-sm font-black text-slate-900 font-mono">{user.credits_balance ?? 0}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">StarCredits</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <p className="text-xs font-bold text-slate-500">
                                            {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 bg-white border-slate-200 hover:bg-slate-50"
                                                onClick={() => setSelectedUser(user)}
                                            >
                                                <CreditCard size={14} className="text-primary" />
                                                Manual Top-Up
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                <MoreHorizontal size={16} />
                                            </Button>
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
                            <DialogDescription className="text-slate-400 font-medium">
                                Manually update StarCredits for <b>{selectedUser?.email}</b>.
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
        </div>
    );
}
