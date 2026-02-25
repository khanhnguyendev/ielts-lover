import { Logger, withTrace } from "./logger";
import { isRedirectError } from "next/dist/client/components/redirect-error";

/**
 * AOP utility to automatically wrap service methods with tracing and error logging.
 * Uses a Proxy to intercept method calls.
 */
export function traceService<T extends object>(instance: T, serviceName: string): T {
    const logger = new Logger(serviceName);

    return new Proxy(instance, {
        get(target, propKey, receiver) {
            const originalMethod = Reflect.get(target, propKey, receiver);

            // Only wrap functions, excluding constructor and private properties (starting with _)
            if (typeof originalMethod === 'function' && typeof propKey === 'string' && !propKey.startsWith('_')) {
                return async (...args: any[]) => {
                    return withTrace(async () => {
                        try {
                            // Standard logger debug for initial call context
                            logger.debug(`Calling ${propKey}`, { args });

                            const result = await originalMethod.apply(target, args);
                            return result;
                        } catch (error) {
                            // Re-throw Next.js redirect signals without logging them as errors
                            if (isRedirectError(error)) throw error;
                            // Unified error logging with metadata
                            logger.error(`Method ${propKey} failed`, { error, args });
                            throw error;
                        }
                    });
                };
            }

            return originalMethod;
        }
    });
}

/**
 * Higher-order function to wrap a standalone action with tracing and error handling.
 */
export function traceAction<T extends any[], R>(name: string, action: (...args: T) => Promise<R>): (...args: T) => Promise<R> {
    const logger = new Logger(name);
    return async (...args: T) => {
        return withTrace(async () => {
            try {
                return await action(...args);
            } catch (error) {
                // Re-throw Next.js redirect signals without logging them as errors
                if (isRedirectError(error)) throw error;
                logger.error(`Action ${name} failed`, { error });
                throw error;
            }
        }, `ACT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    };
}
