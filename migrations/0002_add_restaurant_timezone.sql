-- ============================================================================
-- 0002 · Restaurant timezone column
--
-- Adds a `timezone` column to `restaurants` so the onboarding wizard's
-- step 1 (Store details) can save it, and the Settings page can read/edit
-- it later. Frontend already reads and writes this field; without the
-- column, PostgREST returns 400 on any SELECT that lists it.
--
-- Default is `America/New_York` — a sensible fallback so existing rows
-- have a valid IANA timezone once the column is added.
--
-- Safe to run more than once — every statement is IF NOT EXISTS-guarded.
-- ============================================================================

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL
    DEFAULT 'America/New_York';

COMMENT ON COLUMN public.restaurants.timezone IS
  'IANA timezone identifier (e.g. America/Los_Angeles). Used to render schedule times in the restaurant''s local wall clock and to stamp the iCal export.';
