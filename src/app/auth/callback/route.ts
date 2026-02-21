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
                const metadata = user.user_metadata;
                const profileUpdates = {
                    id: user.id,
                    email: user.email!,
                    full_name: metadata.full_name || metadata.name || null,
                    avatar_url: metadata.avatar_url || metadata.picture || null,
                };

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
                                ...profileUpdates,
                                target_score: 7.0,
                                test_type: TEST_TYPES.ACADEMIC,
                                role: USER_ROLES.USER,
                                created_at: new Date().toISOString()
                            });

                        if (insertError) throw insertError;
                    } catch (createError) {
                        logger.error("Failed to create user profile during OAuth", { error: createError, userId: user.id });
                    }
                } else {
                    // Update existing profile with latest metadata
                    try {
                        const { error: updateError } = await serviceSupabase
                            .from(DB_TABLES.USER_PROFILES)
                            .update({
                                full_name: profileUpdates.full_name,
                                avatar_url: profileUpdates.avatar_url,
                            })
                            .eq("id", user.id);

                        if (updateError) throw updateError;
                    } catch (syncError) {
                        logger.error("Failed to sync user metadata during login", { error: syncError, userId: user.id });
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
