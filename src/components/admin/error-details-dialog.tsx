import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, AlertCircle, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

    // Extract Trace ID if present in the error string
    // Format: "AI Generation failed: ... (Trace ID: ...)"
    const traceIdMatch = error?.match(/\(Trace ID: ([a-f0-9-]+)\)/);
    const traceId = traceIdMatch ? traceIdMatch[1] : null;

    // Remove the trace ID part from the message for cleaner display
    const displayError = error?.replace(/\(Trace ID: [a-f0-9-]+\)/, "").trim();

    const handleCopy = () => {
        if (!error) return;
        navigator.clipboard.writeText(error);
        setCopied(true);
        toast.success("Error details copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertCircle className="h-6 w-6" />
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription>
                        An error occurred while processing your request. Please copy the details below and report it to the support team.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-red-50 p-4 rounded-md border border-red-100 space-y-3">
                    <p className="text-sm text-red-900 font-medium break-words overflow-auto max-h-[200px]">
                        {displayError}
                    </p>
                    {traceId && (
                        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100/50 p-2 rounded">
                            <span className="font-semibold">Trace ID:</span>
                            <span className="font-mono">{traceId}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={handleCopy} className="bg-red-600 hover:bg-red-700 text-white">
                        {copied ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Error
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
