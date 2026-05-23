-- =============================================================================
-- NoQueue Civic Platform — Row Level Security (RLS) Policies
-- =============================================================================
-- Purpose: Enforce ownership-scoped access on all tables containing user data.
-- Apply via: Supabase SQL Editor → Run once per environment.
-- Migration-safe: Uses IF NOT EXISTS and conditional policy creation.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: Enable RLS on a table if not already enabled
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all user-data tables
ALTER TABLE "UserPrivateProfile"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IdentitySecret"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GeneratedDocument"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GoogleDriveConnection"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsentLog"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExportJob"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Case"                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AppointmentWatch"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"                ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- UserPrivateProfile
-- =============================================================================
DROP POLICY IF EXISTS "user_can_manage_own_profile" ON "UserPrivateProfile";
CREATE POLICY "user_can_manage_own_profile"
  ON "UserPrivateProfile"
  FOR ALL
  USING (auth.uid()::text = user_id OR auth.uid()::text = created_by)
  WITH CHECK (auth.uid()::text = user_id OR auth.uid()::text = created_by);

-- =============================================================================
-- IdentitySecret — highest sensitivity, strict ownership
-- =============================================================================
DROP POLICY IF EXISTS "user_can_manage_own_secret" ON "IdentitySecret";
CREATE POLICY "user_can_manage_own_secret"
  ON "IdentitySecret"
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- No service-role reads outside explicit backend functions
DROP POLICY IF EXISTS "no_anonymous_secret_access" ON "IdentitySecret";
CREATE POLICY "no_anonymous_secret_access"
  ON "IdentitySecret"
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid()::text = user_id);

-- =============================================================================
-- GeneratedDocument
-- =============================================================================
DROP POLICY IF EXISTS "user_owns_generated_docs" ON "GeneratedDocument";
CREATE POLICY "user_owns_generated_docs"
  ON "GeneratedDocument"
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- =============================================================================
-- GoogleDriveConnection
-- =============================================================================
DROP POLICY IF EXISTS "user_owns_drive_connection" ON "GoogleDriveConnection";
CREATE POLICY "user_owns_drive_connection"
  ON "GoogleDriveConnection"
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- =============================================================================
-- ConsentLog — append-only for users, read own
-- =============================================================================
DROP POLICY IF EXISTS "user_reads_own_consents" ON "ConsentLog";
CREATE POLICY "user_reads_own_consents"
  ON "ConsentLog"
  FOR SELECT
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "user_inserts_own_consents" ON "ConsentLog";
CREATE POLICY "user_inserts_own_consents"
  ON "ConsentLog"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- ConsentLog rows are immutable — no UPDATE or DELETE by users
-- (Only service role can amend for legal compliance)

-- =============================================================================
-- ExportJob
-- =============================================================================
DROP POLICY IF EXISTS "user_owns_export_jobs" ON "ExportJob";
CREATE POLICY "user_owns_export_jobs"
  ON "ExportJob"
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- =============================================================================
-- Case
-- =============================================================================
DROP POLICY IF EXISTS "user_owns_cases" ON "Case";
CREATE POLICY "user_owns_cases"
  ON "Case"
  FOR ALL
  USING (auth.uid()::text = created_by)
  WITH CHECK (auth.uid()::text = created_by);

-- =============================================================================
-- AppointmentWatch
-- =============================================================================
DROP POLICY IF EXISTS "user_owns_watches" ON "AppointmentWatch";
CREATE POLICY "user_owns_watches"
  ON "AppointmentWatch"
  FOR ALL
  USING (auth.uid()::text = created_by)
  WITH CHECK (auth.uid()::text = created_by);

-- =============================================================================
-- AuditLog — insert-only, read own, NO updates or deletes
-- =============================================================================
DROP POLICY IF EXISTS "user_inserts_audit" ON "AuditLog";
CREATE POLICY "user_inserts_audit"
  ON "AuditLog"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "user_reads_own_audit" ON "AuditLog";
CREATE POLICY "user_reads_own_audit"
  ON "AuditLog"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- AuditLog is append-only — no UPDATE or DELETE ever (immutable compliance log)

-- =============================================================================
-- STORAGE BUCKET POLICIES (run in Supabase Dashboard → Storage → Policies)
-- =============================================================================

-- Bucket: identity-documents-private
-- INSERT: authenticated user, file path must start with uid
-- SELECT: authenticated user, file path must start with uid
-- DELETE: authenticated user, file path must start with uid
-- NO PUBLIC READ

-- Example bucket policies (adapt to actual Supabase storage bucket names):
/*
CREATE POLICY "owner_upload_identity"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'identity-documents-private'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "owner_read_identity"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'identity-documents-private'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "owner_delete_identity"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'identity-documents-private'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Signed URL expiry: 60 seconds (set in application layer, not SQL)
-- Use: supabase.storage.from('identity-documents-private').createSignedUrl(path, 60)
*/

-- =============================================================================
-- NOTES
-- =============================================================================
-- 1. Frontend must NEVER use the SERVICE_ROLE key. Only ANON_KEY + auth JWT.
-- 2. Service role is reserved for server-side backend functions only.
-- 3. Signed URLs for identity documents expire in 60s (application enforced).
-- 4. All sensitive fields (CNP, ID series/number) are AES-256-GCM encrypted
--    at application layer BEFORE insertion — DB sees only ciphertext.
-- =============================================================================