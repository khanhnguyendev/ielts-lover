-- =============================================================
-- Notification System — Phase 1
-- Persistent notifications with real-time delivery via
-- Supabase Realtime and unread counter cached in Upstash Redis
-- =============================================================

-- 1. Notifications table
CREATE TABLE IF NOT EXISTS ielts_lover_v1.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES ielts_lover_v1.user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    group_key TEXT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    deep_link TEXT,
    entity_id TEXT,
    entity_type TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes (read-path optimized)

-- Unread feed: "my unread notifications, newest first"
CREATE INDEX idx_notifications_recipient_unread
    ON ielts_lover_v1.notifications (recipient_id, created_at DESC)
    WHERE is_read = false;

-- Full feed: "all my notifications, newest first" (cursor pagination)
CREATE INDEX idx_notifications_recipient_created
    ON ielts_lover_v1.notifications (recipient_id, created_at DESC);

-- Phase 2 aggregation prep: group_key lookup
CREATE INDEX idx_notifications_recipient_group
    ON ielts_lover_v1.notifications (recipient_id, group_key)
    WHERE group_key IS NOT NULL;

-- 3. RLS
ALTER TABLE ielts_lover_v1.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
    ON ielts_lover_v1.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update own notifications"
    ON ielts_lover_v1.notifications FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

CREATE POLICY "Service role can insert notifications"
    ON ielts_lover_v1.notifications FOR INSERT
    WITH CHECK (true);

-- 4. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION ielts_lover_v1.set_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_set_updated_at
    BEFORE UPDATE ON ielts_lover_v1.notifications
    FOR EACH ROW EXECUTE FUNCTION ielts_lover_v1.set_notification_updated_at();

-- 5. Supabase Realtime
-- Publication is already FOR ALL TABLES, so notifications are included automatically.
