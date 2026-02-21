import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Logger } from '@/lib/logger';
import { UserRepository } from '@/repositories/user.repository';

const logger = new Logger("AuthCallback");

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/dashboard';

    if (code) {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const userRepo = new UserRepository();
                const metadata = user.user_metadata;
                try {
                    await userRepo.syncOAuthProfile(user.id, {
                        id: user.id,
                        email: user.email!,
                        full_name: metadata.full_name || metadata.name || null,
                        avatar_url: metadata.avatar_url || metadata.picture || null,
                        last_seen_at: new Date().toISOString(),
                    });
                } catch (syncError) {
                    logger.error("Failed to sync user profile during OAuth", { error: syncError, userId: user.id });
                }
            }

            return NextResponse.redirect(`${origin}${next}`);
        } else {
            logger.error("OAuth Exchange Error", { error });
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
