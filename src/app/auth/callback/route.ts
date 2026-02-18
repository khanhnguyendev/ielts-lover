import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';
import { DB_TABLES, TEST_TYPES, USER_ROLES } from '@/lib/constants';
import { Logger } from '@/lib/logger';

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
                // Ensure user profile exists using SERVICE ROLE to bypass initial RLS sync delays
                const serviceSupabase = await createServiceSupabaseClient();
                const { data: existingProfile } = await serviceSupabase
                    .from(DB_TABLES.USER_PROFILES)
                    .select("id")
                    .eq("id", user.id)
                    .single();

                if (!existingProfile) {
                    try {
                        logger.info(`Creating profile for ${user.email}`, { userId: user.id });
                        const { error: insertError } = await serviceSupabase
                            .from(DB_TABLES.USER_PROFILES)
                            .insert({
                                id: user.id,
                                email: user.email!,
                                target_score: 7.0,
                                test_type: TEST_TYPES.ACADEMIC,
                                role: USER_ROLES.USER,
                                is_premium: false,
                                daily_quota_used: 0,
                                last_quota_reset: new Date().toISOString(),
                                created_at: new Date().toISOString()
                            });

                        if (insertError) throw insertError;
                    } catch (createError) {
                        logger.error("Failed to create user profile during OAuth", { error: createError, userId: user.id });
                        // We still redirect, but maybe with an error param if you have a way to show it
                    }
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
