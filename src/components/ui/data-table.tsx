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
import { LoadMoreButton } from "@/components/global/load-more-button"

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
    /** Items per page (for internal paging) */
    pageSize?: number
    /** Total count of records (if server-side or filtered) */
    totalCount?: number
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
    /** Toolbar slot for filters/search */
    toolbar?: React.ReactNode
    /** Navigation configuration */
    navigation?: {
        type: "paged" | "load-more" | "none"
        onLoadMore?: () => void
        isLoadingMore?: boolean
        hasMore?: boolean
    }
}

// ─── Component ───────────────────────────────────────────
export function DataTable<T>({
    columns,
    data,
    rowKey,
    pageSize = 10,
    totalCount,
    isLoading = false,
    loadingRows = 5,
    loadingText = "Loading...",
    emptyState,
    rowClassName,
    contained = true,
    className,
    toolbar,
    navigation = { type: "paged" }
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = React.useState(1)

    // Reset page when data changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [data.length])

    const isPaged = navigation.type === "paged"
    const totalRecords = totalCount ?? data.length
    const totalPages = Math.ceil(totalRecords / pageSize)

    const paginatedData = isPaged && !totalCount
        ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : data

    const colSpan = columns.length

    return (
        <div className={cn(
            contained && "rounded-[2rem] border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900/50 backdrop-blur-3xl shadow-xl shadow-black/5 overflow-hidden",
            className
        )}>
            {/* Table Toolbar & Metrics */}
            <div className="px-6 py-5 border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                            {totalRecords} Total Records
                        </span>
                    </div>
                    {isPaged && (
                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                            Showing {Math.min(totalRecords, (currentPage - 1) * pageSize + 1)}-{Math.min(totalRecords, currentPage * pageSize)}
                        </div>
                    )}
                </div>

                {toolbar && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                        {toolbar}
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-white/5">
                        <TableRow className="hover:bg-transparent border-slate-100/50 dark:border-white/5">
                            {columns.map((col, i) => (
                                <TableHead
                                    key={col.key}
                                    className={cn(
                                        "py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400",
                                        col.width,
                                        col.width && "shrink-0 whitespace-nowrap",
                                        !col.width && "min-w-0",
                                        i === 0 && "pl-8",
                                        i === columns.length - 1 && "pr-8",
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
                        {isLoading && data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={colSpan} className="py-24">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="flex gap-1.5">
                                            {[0, 1, 2].map(i => (
                                                <div
                                                    key={i}
                                                    className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce"
                                                    style={{ animationDelay: `${i * 150}ms` }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 animate-pulse">
                                            {loadingText}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={colSpan} className="h-[300px] text-center">
                                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                                            {emptyState?.icon || <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-base font-black text-slate-900 dark:text-white font-outfit">
                                                {emptyState?.title || "No data found"}
                                            </p>
                                            {emptyState?.description && (
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
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
                                        "group hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] border-slate-50/50 dark:border-white/5 transition-colors duration-300",
                                        rowClassName?.(row)
                                    )}
                                >
                                    {columns.map((col, colIdx) => (
                                        <TableCell
                                            key={col.key}
                                            className={cn(
                                                "py-5",
                                                col.width && "whitespace-nowrap",
                                                !col.width && "min-w-0",
                                                colIdx === 0 && "pl-8",
                                                colIdx === columns.length - 1 && "pr-8",
                                                col.align === "right" && "text-right",
                                                col.align === "center" && "text-center",
                                            )}
                                        >
                                            <div className="transition-transform duration-300 group-hover:translate-x-0.5">
                                                {col.render(row, rowIdx)}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer: Pagination OR Load More */}
            <div className="px-8 py-5 border-t border-slate-50 dark:border-white/5 bg-slate-50/20 dark:bg-white/5">
                {navigation.type === "paged" && totalPages > 1 && !isLoading && (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
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
                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
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
                )}

                {navigation.type === "load-more" && navigation.hasMore && (
                    <div className="flex justify-center w-full py-2">
                        <LoadMoreButton
                            onClick={navigation.onLoadMore!}
                            isLoading={navigation.isLoadingMore || false}
                            remaining={totalRecords - data.length}
                        />
                    </div>
                )}

                {!navigation.hasMore && navigation.type === "load-more" && data.length > 0 && (
                    <div className="text-center py-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">
                            End of Records
                        </span>
                    </div>
                )}
            </div>
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
            variant="ghost"
            size="icon"
            disabled={disabled}
            onClick={onClick}
            className={cn(
                "w-9 h-9 rounded-xl transition-all duration-300",
                !disabled && "hover:bg-primary/10 hover:text-primary active:scale-95",
                disabled && "opacity-20 cursor-not-allowed"
            )}
        >
            <Icon size={16} strokeWidth={2.5} />
        </Button>
    )
}
