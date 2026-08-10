-- ============================================================================
-- 0003 · Rename onboarding_completed → setup_started
--
-- The old name misrepresented what the flag meant. The wizard flips it as
-- soon as store details are saved (step 1 of 3) so the manager can hop
-- between /employees, /templates and /schedules without OnboardedRoute
-- punting them back to /setup. It does NOT mean the user finished setup;
-- the SetupChecklist tracks the remaining steps as gentle guidance.
--
-- Renaming brings the column in line with reality and avoids future code
-- reading it as "user finished everything" (e.g. to hide welcome tips or
-- empty-state hints).
--
-- Safe to run more than once — the DO block skips if the target column
-- already exists.
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'restaurants'
      AND column_name = 'onboarding_completed'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'restaurants'
      AND column_name = 'setup_started'
  ) THEN
    ALTER TABLE public.restaurants
      RENAME COLUMN onboarding_completed TO setup_started;
  END IF;
END$$;

COMMENT ON COLUMN public.restaurants.setup_started IS
  'True once the user has saved basic store details (step 1 of the setup wizard). Not a "setup finished" flag — the SetupChecklist tracks remaining steps.';
