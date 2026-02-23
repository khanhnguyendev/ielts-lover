-- Seed MAINTENANCE_MODE flag into system_settings
INSERT INTO ielts_lover_v1.system_settings (setting_key, setting_value, description)
VALUES ('MAINTENANCE_MODE', 'false'::jsonb, 'When enabled, non-admin users see a maintenance page')
ON CONFLICT (setting_key) DO NOTHING;
