import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isMaintenanceMode } from "@/lib/maintenance";

/**
 * Routes that are freely accessible without authentication.
 * Guests can browse these pages.
 */
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/onboarding", "/auth/callback", "/maintenance"];

/**
 * Dashboard sub-routes that require authentication.
 * All other /dashboard/* routes are publicly browsable.
 */
const PRIVATE_DASHBOARD_PATHS = [
    '/dashboard/settings',
    '/dashboard/credits',
    '/dashboard/transactions',
    '/dashboard/improvement',
    '/dashboard/reports',
    '/dashboard/speaking',
];

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            db: {
                schema: 'ielts_lover_v1'
            },
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // 1. Update REQUEST cookies for subsequent server components
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

                    // 2. Refresh the response to pass the updated request forward
                    response = NextResponse.next({
                        request,
                    });

                    // 3. Update RESPONSE cookies for the browser
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // This refreshes the session if needed and triggers setAll
    const { data: { user } } = await supabase.auth.getUser();

    // Helper: redirect with refreshed cookies so session tokens are preserved
    const redirectWithCookies = (to: string) => {
        const url = new URL(to, request.url);
        const redirectResponse = NextResponse.redirect(url);
        response.cookies.getAll().forEach((cookie) => {
            const { name, value, ...options } = cookie;
            redirectResponse.cookies.set(name, value, options);
        });
        return redirectResponse;
    };

    // --- Maintenance mode gate ---
    if (pathname !== "/maintenance" && !pathname.startsWith("/admin")) {
        const maintenance = await isMaintenanceMode();
        if (maintenance) {
            let isAdmin = false;
            if (user) {
                const { data: profile } = await supabase
                    .from("user_profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();
                isAdmin = profile?.role === "admin";
            }

            if (!isAdmin) {
                return redirectWithCookies("/maintenance");
            }
        }
    }

    // --- Redirect authenticated users away from auth pages ---
    if (user && (pathname === "/login" || pathname === "/signup")) {
        console.log(`[Proxy] User exists, redirecting ${pathname} -> /dashboard`);
        return redirectWithCookies("/dashboard");
    }

    // --- Allow all PUBLIC_ROUTES through without further checks ---
    if (PUBLIC_ROUTES.includes(pathname)) {
        return response;
    }

    // --- Protect admin routes ---
    if (!user && pathname.startsWith("/admin")) {
        console.log(`[Proxy] No user, redirecting ${pathname} -> /login`);
        const url = new URL("/login", request.url);
        url.searchParams.set("from", pathname);
        const redirectResponse = NextResponse.redirect(url);
        response.cookies.getAll().forEach((cookie) => {
            const { name, value, ...options } = cookie;
            redirectResponse.cookies.set(name, value, options);
        });
        return redirectResponse;
    }

    // --- Protect teacher routes ---
    if (!user && pathname.startsWith("/teacher")) {
        const url = new URL("/login", request.url);
        url.searchParams.set("from", pathname);
        const redirectResponse = NextResponse.redirect(url);
        response.cookies.getAll().forEach((cookie) => {
            const { name, value, ...options } = cookie;
            redirectResponse.cookies.set(name, value, options);
        });
        return redirectResponse;
    }

    // --- Protect specific private dashboard paths ---
    // All other /dashboard/* routes are freely browsable by guests
    if (!user && PRIVATE_DASHBOARD_PATHS.some((p) => pathname.startsWith(p))) {
        console.log(`[Proxy] No user, redirecting private path ${pathname} -> /login`);
        const url = new URL("/login", request.url);
        url.searchParams.set("from", pathname);
        const redirectResponse = NextResponse.redirect(url);
        response.cookies.getAll().forEach((cookie) => {
            const { name, value, ...options } = cookie;
            redirectResponse.cookies.set(name, value, options);
        });
        return redirectResponse;
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
