import { Logger, withTrace } from "./logger";

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
