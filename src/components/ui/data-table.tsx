"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    FileText
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────
export interface DataTableColumn<T> {
    /** Unique key for the column */
    key: string
    /** Header label text */
    header: string
    /** Whether the header is sortable (shows sort icon) — visual only for now */
    sortable?: boolean
    /** Width class (e.g. "w-[180px]") */
    width?: string
    /** Alignment for this column's cells */
    align?: "left" | "center" | "right"
    /** Render function for each cell */
    render: (row: T, index: number) => React.ReactNode
}

export interface DataTableProps<T> {
    /** Column definitions */
    columns: DataTableColumn<T>[]
    /** Data rows */
    data: T[]
    /** Unique key extractor for each row */
    rowKey: (row: T) => string
    /** Items per page (default: 10) */
    pageSize?: number
    /** Show loading skeleton */
    isLoading?: boolean
    /** Number of skeleton rows to show */
    loadingRows?: number
    /** Loading text */
    loadingText?: string
    /** Empty state configuration */
    emptyState?: {
        icon?: React.ReactNode
        title: string
        description?: string
    }
    /** Custom row className */
    rowClassName?: (row: T) => string
    /** Whether the table is contained in a card (adds rounded border) */
    contained?: boolean
    /** Custom className */
    className?: string
}

// ─── Component ───────────────────────────────────────────
export function DataTable<T>({
    columns,
    data,
    rowKey,
    pageSize = 10,
    isLoading = false,
    loadingRows = 5,
    loadingText = "Loading...",
    emptyState,
    rowClassName,
    contained = true,
    className,
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = React.useState(1)

    // Reset page when data changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [data.length])

    const totalPages = Math.ceil(data.length / pageSize)
    const paginatedData = data.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    const colSpan = columns.length

    return (
        <div className={cn(
            contained && "rounded-xl border bg-white shadow-sm overflow-hidden",
            className
        )}>
            <Table>
                <TableHeader className="bg-[#F9FAFB]">
                    <TableRow className="hover:bg-transparent border-slate-100">
                        {columns.map((col, i) => (
                            <TableHead
                                key={col.key}
                                className={cn(
                                    "py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground",
                                    col.width,
                                    col.width && "shrink-0 whitespace-nowrap",
                                    !col.width && "min-w-0",
                                    i === 0 && "pl-6",
                                    i === columns.length - 1 && "pr-6",
                                    col.align === "right" && "text-right",
                                    col.align === "center" && "text-center",
                                )}
                            >
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={colSpan} className="py-20">
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map(i => (
                                            <div
                                                key={i}
                                                className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                                                style={{ animationDelay: `${i * 150}ms` }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
                                        {loadingText}
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : paginatedData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={colSpan} className="h-[200px] text-center">
                                <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                                        {emptyState?.icon || <FileText className="h-6 w-6 text-slate-300" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-slate-700">
                                            {emptyState?.title || "No data found"}
                                        </p>
                                        {emptyState?.description && (
                                            <p className="text-[10px] font-medium">
                                                {emptyState.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedData.map((row, rowIdx) => (
                            <TableRow
                                key={rowKey(row)}
                                className={cn(
                                    "group hover:bg-slate-50/50 border-slate-50 transition-colors",
                                    rowClassName?.(row)
                                )}
                            >
                                {columns.map((col, colIdx) => (
                                    <TableCell
                                        key={col.key}
                                        className={cn(
                                            "py-3.5",
                                            col.width && "whitespace-nowrap",
                                            !col.width && "min-w-0",
                                            colIdx === 0 && "pl-6",
                                            colIdx === columns.length - 1 && "pr-6",
                                            col.align === "right" && "text-right",
                                            col.align === "center" && "text-center",
                                        )}
                                    >
                                        {col.render(row, rowIdx)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Showing {paginatedData.length} of {data.length} results
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                            <PaginationButton
                                icon={ChevronsLeft}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(1)}
                            />
                            <PaginationButton
                                icon={ChevronLeft}
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            />
                            <PaginationButton
                                icon={ChevronRight}
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            />
                            <PaginationButton
                                icon={ChevronsRight}
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(totalPages)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Sub-components ──────────────────────────────────────
function PaginationButton({
    icon: Icon,
    disabled = false,
    onClick
}: {
    icon: any
    disabled?: boolean
    onClick?: () => void
}) {
    return (
        <Button
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "p-1.5",
                disabled && "opacity-30"
            )}
        >
            <Icon className="h-4 w-4" />
        </Button>
    )
}
