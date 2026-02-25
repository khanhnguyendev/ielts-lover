import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Routes under /dashboard that require authentication.
 * All other /dashboard/* routes are publicly accessible.
 */
const PRIVATE_PATHS = [
    '/dashboard/settings',
    '/dashboard/credits',
    '/dashboard/transactions',
    '/dashboard/improvement',
    '/dashboard/reports',
    '/dashboard/speaking',
];

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired — required for Server Components to have up-to-date session
    const { data: { user } } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Protect private dashboard routes
    if (!user && PRIVATE_PATHS.some((p) => pathname.startsWith(p))) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Protect admin routes
    if (!user && pathname.startsWith('/admin')) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Protect teacher routes
    if (!user && pathname.startsWith('/teacher')) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect logged-in users away from auth pages
    if (user && (pathname === '/login' || pathname === '/signup')) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/dashboard';
        return NextResponse.redirect(dashboardUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static (static files)
         * - _next/image (image optimisation)
         * - favicon.ico, icons, images
         * - api routes (handled separately)
         * - auth/callback (OAuth redirect)
         */
        '/((?!_next/static|_next/image|favicon.ico|icon|api/|auth/callback).*)',
    ],
};
