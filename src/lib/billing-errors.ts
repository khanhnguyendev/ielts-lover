import { APP_ERROR_CODES } from "@/lib/constants";

/**
 * Maps a billing error code from a server action response to a user-friendly message.
 * Returns null if the code is not a billing error.
 */
export function getBillingErrorMessage(code: string | undefined | null): { title: string; message: string } | null {
    if (!code) return null;

    switch (code) {
        case APP_ERROR_CODES.INSUFFICIENT_CREDITS:
            return {
                title: "Insufficient StarCredits",
                message: "You don't have enough StarCredits for this action. Earn more through daily login or practice.",
            };
        case APP_ERROR_CODES.MONTHLY_LIMIT_REACHED:
            return {
                title: "Monthly Limit Reached",
                message: "You've reached your monthly usage limit. It will reset at the start of next month.",
            };
        default:
            return null;
    }
}

/**
 * Checks a server action result for billing error codes.
 * Looks in both `reason` and `error` fields for backwards compatibility.
 */
export function extractBillingError(result: Record<string, any>): { title: string; message: string } | null {
    return getBillingErrorMessage(result.reason) || getBillingErrorMessage(result.error);
}
