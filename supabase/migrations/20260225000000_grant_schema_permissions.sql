-- Fix: Grant schema usage permissions to Supabase roles
-- Without this, PostgREST returns "permission denied for schema ielts_lover_v1"
-- when using a non-public schema. This must be granted explicitly.
--
-- This affects:
--   - anon: unauthenticated API requests
--   - authenticated: logged-in user requests via server client
--   - service_role: service client (bypasses RLS)

GRANT USAGE ON SCHEMA ielts_lover_v1 TO anon,
authenticated,
service_role;

-- Also grant table-level permissions so PostgREST can read/write data.
-- RLS policies still control row-level access on top of this.
GRANT ALL ON ALL TABLES IN SCHEMA ielts_lover_v1 TO anon,
authenticated,
service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA ielts_lover_v1 TO anon,
authenticated,
service_role;

GRANT ALL ON ALL ROUTINES IN SCHEMA ielts_lover_v1 TO anon,
authenticated,
service_role;

-- Ensure future tables/sequences/routines also get these grants automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA ielts_lover_v1
GRANT ALL ON TABLES TO anon,
authenticated,
service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA ielts_lover_v1
GRANT ALL ON SEQUENCES TO anon,
authenticated,
service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA ielts_lover_v1
GRANT ALL ON ROUTINES TO anon,
authenticated,
service_role;