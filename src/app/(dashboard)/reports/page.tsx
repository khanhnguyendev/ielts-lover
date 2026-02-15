"use client"

import * as React from "react"
import Link from "next/link"
import {
    ChevronDown,
    Search,
    Globe,
    ArrowUpDown,
    Mic2,
    CheckCircle2,
    Video,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export default function ReportsPage() {
    const [activeTab, setActiveTab] = React.useState("Reports")

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-outfit">My Reports</h1>
            </div>

            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex bg-[#F9FAFB] p-2 m-4 rounded-xl w-fit border">
                    {["Reports", "Progress"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                activeTab === tab
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg text-xs font-bold border-muted-foreground/20">
                            <span className="mr-2 text-muted-foreground">+</span> Status
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg text-xs font-bold border-muted-foreground/20">
                            <span className="mr-2 text-muted-foreground">+</span> Tool
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border">
                            <Globe className="h-3.5 w-3.5" />
                            Feedback Language
                            <span className="text-foreground font-bold">English</span>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="p-0">
                    <Table>
                        <TableHeader className="bg-[#F9FAFB]">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="w-[200px] py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-6">
                                    <div className="flex items-center gap-1 cursor-pointer group">
                                        Time <ArrowUpDown className="h-3 w-3 group-hover:text-primary" />
                                    </div>
                                </TableHead>
                                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <div className="flex items-center gap-1 cursor-pointer group">
                                        Task <ArrowUpDown className="h-3 w-3 group-hover:text-primary" />
                                    </div>
                                </TableHead>
                                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <div className="flex items-center gap-1 cursor-pointer group">
                                        Task Description <ArrowUpDown className="h-3 w-3 group-hover:text-primary" />
                                    </div>
                                </TableHead>
                                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <div className="flex items-center gap-1 cursor-pointer group">
                                        Status <ArrowUpDown className="h-3 w-3 group-hover:text-primary" />
                                    </div>
                                </TableHead>
                                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <div className="flex items-center gap-1 cursor-pointer group">
                                        Score <ArrowUpDown className="h-3 w-3 group-hover:text-primary" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-right pr-6"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="group hover:bg-muted/30 border-b">
                                <TableCell className="py-5 pl-6 font-medium text-sm">2026-02-14 23:24:57</TableCell>
                                <TableCell className="py-5">
                                    <div className="flex items-center gap-2 text-sm font-bold">
                                        <Mic2 className="h-4 w-4 text-primary" />
                                        Speaking Part 1
                                    </div>
                                </TableCell>
                                <TableCell className="py-5 text-sm text-muted-foreground font-medium">No Description</TableCell>
                                <TableCell className="py-5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Completed
                                    </div>
                                </TableCell>
                                <TableCell className="py-5 text-sm font-black text-primary">1</TableCell>
                                <TableCell className="py-5 text-right pr-6">
                                    <Link href="/dashboard/reports/123">
                                        <Button variant="outline" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest border-muted-foreground/20 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                            View Report
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                {/* Footer info */}
                <div className="px-6 py-6 text-center border-t border-dashed">
                    <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">
                        Free users can see up to 5 completed records. <span className="text-primary cursor-pointer hover:underline">Upgrade</span> to see more results.
                    </p>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between bg-[#F9FAFB] border-t">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Rows per page</span>
                        <div className="flex items-center gap-2 bg-white border px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:border-primary transition-all">
                            20 <ChevronDown className="h-3 w-3" />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <span className="text-xs font-medium text-muted-foreground">Page 1 of 1</span>
                        <div className="flex items-center gap-1">
                            <PaginationButton icon={ChevronsLeft} disabled />
                            <PaginationButton icon={ChevronLeft} disabled />
                            <PaginationButton icon={ChevronRight} disabled />
                            <PaginationButton icon={ChevronsRight} disabled />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PaginationButton({ icon: Icon, disabled = false }: { icon: any, disabled?: boolean }) {
    return (
        <button
            disabled={disabled}
            className={cn(
                "p-1.5 rounded-lg border bg-white transition-all",
                disabled ? "opacity-30 cursor-not-allowed" : "hover:border-primary hover:text-primary"
            )}
        >
            <Icon className="h-4 w-4" />
        </button>
    )
}
