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
        const traceId = this.getTraceId() || "no-trace";
        const now = new Date();
        const timestamp = now.toISOString();
        const localTime = now.toLocaleTimeString();

        // Handle error objects specifically for logging
        let formattedMeta = meta;
        if (meta && typeof meta === 'object') {
            formattedMeta = { ...meta };
            for (const key in formattedMeta) {
                if (formattedMeta[key] instanceof Error) {
                    const err = formattedMeta[key];
                    formattedMeta[key] = {
                        message: err.message,
                        stack: err.stack,
                    };
                }
            }
        }

        const metaStr = formattedMeta ? JSON.stringify(formattedMeta, null, 2) : "";

        // Pretty print for development
        if (process.env.NODE_ENV === "development") {
            const color = {
                info: "\x1b[32m", // Green
                warn: "\x1b[33m", // Yellow
                error: "\x1b[31m", // Red
                debug: "\x1b[34m", // Blue
            }[level] || "\x1b[0m";
            const reset = "\x1b[0m";
            const gray = "\x1b[90m";

            return `${color}[${localTime}] [${level.toUpperCase()}]${reset}${gray} [${this.context}] [${traceId}]${reset} ${message}${formattedMeta ? '\n' + metaStr : ''}`;
        }

        return JSON.stringify({
            timestamp,
            level,
            context: this.context,
            traceId,
            message,
            ...formattedMeta
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
