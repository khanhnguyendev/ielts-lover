import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, AlertCircle, Check, Info, XCircle, Hash, FileText, HelpCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ErrorDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    error: string | null;
    title?: string;
}

export function ErrorDetailsDialog({
    open,
    onOpenChange,
    error,
    title = "Action Failed"
}: ErrorDetailsDialogProps) {
    const [copied, setCopied] = useState(false);

    if (!error) return null;

    // --- Parsing Logic ---

    // 1. Extract Trace ID
    const traceIdMatch = error.match(/\(Trace ID: ([a-f0-9-]+)\)/);
    const traceId = traceIdMatch ? traceIdMatch[1] : null;

    // 2. Extract Status Code (e.g., [404], status: 429, 500 Internal Server Error)
    const statusMatch = error.match(/\[(\d{3})\]|status[:\s]+(\d{3})/i);
    const statusCode = statusMatch ? (statusMatch[1] || statusMatch[2]) : "500";

    // 3. Clean Details
    // Remove the trace ID part specific format we added
    let details = error.replace(/\(Trace ID: [a-f0-9-]+\)/, "").trim();
    // Optional: Strip common prefixes if they duplicate info
    details = details.replace(/^Error:\s*/i, "");

    // 4. Generate Hint based on Status
    let hint = "Please copy the error details and report to support.";
    if (statusCode === "429") {
        hint = "You have exceeded the AI rate limit. Please try again in a few minutes.";
    } else if (statusCode === "404") {
        hint = "The requested AI model or resource was not found. Please check configuration.";
    } else if (statusCode === "401" || statusCode === "403") {
        hint = "Authentication failed. Please check API keys and permissions.";
    } else if (statusCode === "500") {
        hint = "An internal server error occurred. Retrying might work.";
    }

    const handleCopy = () => {
        const copyText = `Status: ${statusCode}\nTrace ID: ${traceId || 'N/A'}\nDetails: ${details}\n\nHint: ${hint}`;
        navigator.clipboard.writeText(copyText);
        setCopied(true);
        toast.success("Error report copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="h-6 w-6" />
                        <DialogTitle className="text-lg">{title}</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Trace ID */}
                    {traceId && (
                        <div className="grid gap-1">
                            <LabelWithIcon icon={FileText} label="Trace ID" />
                            <div className="font-mono text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-100 break-all">
                                {traceId}
                            </div>
                        </div>
                    )}

                    {/* Details */}
                    <div className="grid gap-1">
                        <LabelWithIcon icon={AlertCircle} label="Error Details" />
                        <div className="text-sm text-red-900 bg-red-50 px-3 py-2 rounded-md border border-red-100 max-h-[150px] overflow-y-auto break-words">
                            {details}
                        </div>
                    </div>

                    {/* Hint */}
                    <div className="grid gap-1">
                        <LabelWithIcon icon={HelpCircle} label="Hint" />
                        <div className="text-sm text-blue-800 bg-blue-50 px-3 py-2 rounded-md border border-blue-100 flex items-start gap-2">
                            <Info className="h-4 w-4 mt-0.5 shrink-0" />
                            {hint}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={handleCopy} className={cn("text-white transition-all", copied ? "bg-green-600 hover:bg-green-700" : "bg-gray-900 hover:bg-gray-800")}>
                        {copied ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Report
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function LabelWithIcon({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <Icon className="h-3.5 w-3.5" />
            {label}
        </div>
    );
}
