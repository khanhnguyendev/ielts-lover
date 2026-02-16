"use server"

import { getCurrentUser } from "@/app/actions";
import { CreditPackageRepository } from "@/repositories/credit-package.repository";
import { Logger } from "@/lib/logger";

const logger = new Logger("CreditsActions");
const creditPackageRepo = new CreditPackageRepository();

export async function createCheckoutSession(packageId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const pkg = await creditPackageRepo.getById(packageId);

    logger.info(`Creating checkout session for user ${user.id}`, {
        userId: user.id,
        packageId: packageId,
        packageName: pkg?.name || "Unknown Package",
        amount: pkg?.price,
        credits: (pkg?.credits || 0) + (pkg?.bonus_credits || 0)
    });

    // Placeholder for actual Stripe integration
    return { url: `/dashboard/credits` };
}

export async function getAvailablePackages() {
    return creditPackageRepo.listAll();
}
