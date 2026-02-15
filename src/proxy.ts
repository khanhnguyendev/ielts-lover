import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/onboarding"];

export default async function proxy(request: NextRequest) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // 1. Check if the route is explicitly public
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // 2. Handle Authentication Logic
    if (isPublicRoute) {
        // If user is already logged in, don't let them go to login/signup
        if (user && (pathname === "/login" || pathname === "/signup")) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.next();
    }

    // 3. Protected-by-Default: Redirect to login if no session exists
    if (!user) {
        const redirectUrl = new URL("/login", request.url);
        // Store the original destination to redirect back after login
        redirectUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - All files in the public folder (images, etc. - usually have extensions)
     */
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};
