import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/onboarding", "/auth/callback"];

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log(`[Proxy] Requesting: ${pathname}`);

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

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (isPublicRoute) {
        if (user && (pathname === "/login" || pathname === "/signup")) {
            console.log(`[Proxy] User exists, redirecting ${pathname} -> /dashboard`);
            const url = new URL("/dashboard", request.url);
            const redirectResponse = NextResponse.redirect(url);

            // IMPORTANT: Copy refreshed cookies to the redirect response
            response.cookies.getAll().forEach((cookie) => {
                const { name, value, ...options } = cookie;
                redirectResponse.cookies.set(name, value, options);
            });

            return redirectResponse;
        }
        return response;
    }

    if (!user) {
        console.log(`[Proxy] No user, redirecting ${pathname} -> /login`);
        const url = new URL("/login", request.url);
        url.searchParams.set("from", pathname);
        const redirectResponse = NextResponse.redirect(url);

        // Sync response cookies to the redirect
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
