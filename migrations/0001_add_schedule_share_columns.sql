-- ============================================================================
-- 0001 · Shareable schedule links
--
-- Adds three columns to `schedules` so the backend can issue and validate the
-- unauthenticated /public/schedules/:token links used by the ShareModal.
--
-- Backend contract (from the Stage 3 handoff):
--   POST   /api/v1/schedules/:id/share     rotates share_token, sets
--                                          share_enabled = true, and pushes
--                                          share_expires_at to now() + 7 days.
--   DELETE /api/v1/schedules/:id/share     sets share_enabled = false
--                                          (token is left in place until the
--                                          next rotation).
--   GET    /api/v1/public/schedules/:token 200 iff share_enabled = true
--                                          AND share_expires_at > now()
--                                          AND share_token = :token
--                                          -- otherwise 404 (never leaks
--                                          which of the three failed).
--
-- Safe to run more than once — every statement is IF NOT EXISTS-guarded.
-- ============================================================================

ALTER TABLE public.schedules
  ADD COLUMN IF NOT EXISTS share_token      text,
  ADD COLUMN IF NOT EXISTS share_enabled    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_expires_at timestamptz;

-- Partial unique index — enforce uniqueness of live tokens without forcing
-- every row (including those that have never been shared) to be non-null.
CREATE UNIQUE INDEX IF NOT EXISTS schedules_share_token_key
  ON public.schedules (share_token)
  WHERE share_token IS NOT NULL;

-- The public GET route is a hot path when a link is passed around; index the
-- lookup so it stays cheap.
CREATE INDEX IF NOT EXISTS schedules_share_active_idx
  ON public.schedules (share_token)
  WHERE share_enabled = true AND share_expires_at IS NOT NULL;

COMMENT ON COLUMN public.schedules.share_token IS
  'Opaque token embedded in the /public/schedules/:token URL. Rotated on every POST /share; nullable until the schedule has ever been shared.';
COMMENT ON COLUMN public.schedules.share_enabled IS
  'Set to true when a link is active; DELETE /share flips this to false without clearing the token.';
COMMENT ON COLUMN public.schedules.share_expires_at IS
  'Expiry timestamp of the current share_token (typically now() + 7 days). Public reads must check this against now() and return 404 if past.';
