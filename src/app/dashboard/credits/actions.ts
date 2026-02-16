"use server"

import { getCurrentUser } from "@/app/actions";
import { CreditPackageRepository } from "@/repositories/credit-package.repository";

const creditPackageRepo = new CreditPackageRepository();

export async function createCheckoutSession(packageId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    console.log(`Creating checkout session for user ${user.id} and package ${packageId}`);

    // Placeholder for actual Stripe integration
    return { url: `/dashboard/credits` };
}

export async function getAvailablePackages() {
    return creditPackageRepo.listAll();
}
