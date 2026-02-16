import { AsyncLocalStorage } from "node:async_hooks";
import { v4 as uuidv4 } from "uuid";

// Store trace context
const asyncLocalStorage = new AsyncLocalStorage<{ traceId: string }>();

type LogLevel = "info" | "warn" | "error" | "debug";

export class Logger {
    private context: string;

    constructor(context: string = "App") {
        this.context = context;
    }

    private getTraceId(): string | undefined {
        return asyncLocalStorage.getStore()?.traceId;
    }

    private formatMessage(level: LogLevel, message: string, meta?: any) {
        const traceId = this.getTraceId();
        const timestamp = new Date().toISOString();

        return JSON.stringify({
            timestamp,
            level,
            context: this.context,
            traceId,
            message,
            ...meta
        });
    }

    info(message: string, meta?: any) {
        console.log(this.formatMessage("info", message, meta));
    }

    warn(message: string, meta?: any) {
        console.warn(this.formatMessage("warn", message, meta));
    }

    error(message: string, meta?: any) {
        console.error(this.formatMessage("error", message, meta));
    }

    debug(message: string, meta?: any) {
        // Only log debug in dev or if explicitly enabled
        if (process.env.NODE_ENV === "development" || process.env.LOG_LEVEL === "debug") {
            console.debug(this.formatMessage("debug", message, meta));
        }
    }
}

// Default logger
export const logger = new Logger();

// Helper to run a function within a new trace context
export async function withTrace<T>(fn: () => Promise<T>, existingTraceId?: string): Promise<T> {
    const traceId = existingTraceId || uuidv4();
    return asyncLocalStorage.run({ traceId }, fn);
}

// Helper to get current trace ID (useful for error responses)
export function getCurrentTraceId(): string | undefined {
    return asyncLocalStorage.getStore()?.traceId;
}
