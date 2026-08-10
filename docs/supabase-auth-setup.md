# Supabase auth configuration

Two things need to be set in the Supabase project so signup + email flows
don't dump users at `localhost:3000` and so new accounts land straight
inside the app.

## 1. URL configuration — fixes the `localhost:3000` redirect

**Dashboard path:** Authentication → **URL Configuration**.

- **Site URL:** the app's home. Set to the URL you actually visit:
  - Dev: `http://localhost:5173`
  - Production: whatever domain you deploy to (e.g. `https://miseenplace.app`)
- **Redirect URLs:** add every domain the app runs on. Wildcards are
  allowed. Suggested list:
  ```
  http://localhost:5173/**
  https://miseenplace.app/**
  ```
  (Add more entries if you have a staging domain.)

**Why this matters:** when Supabase sends a confirmation or password-reset
email, the link inside it uses these settings to pick a return URL.
Without setting them, Supabase falls back to its built-in default
(`http://localhost:3000`) — the source of the "why did I land on port
3000?" behaviour.

The frontend also now passes `emailRedirectTo` explicitly (see
`src/contexts/AuthContext.tsx`) so even if the dashboard settings
haven't been updated yet, links go back to `{origin}/setup` for signup
and `{origin}/reset-password/confirm` for password resets.

## 2. Turn off "Confirm email" — makes signup log the user in

**Dashboard path:** Authentication → **Sign In / Providers → Email** →
uncheck **Confirm email**.

- **With Confirm email ON** (default): `supabase.auth.signUp` does NOT
  return a session. The user has to click the link in the confirmation
  email before they can sign in. The frontend routes them to `/login`
  with a "check your email" toast.
- **With Confirm email OFF** (recommended for launch): `signUp` returns
  a session immediately. The frontend routes them straight into
  `/setup` for onboarding — no separate login step.

The frontend detects which mode is active via
`SignUpResult.signedIn` (returned from `AuthContext.signUp`), so both
modes work — but "instant sign-in" only kicks in with Confirm email OFF.

Trade-off: with confirmation off, anyone can create an account with a
throwaway email. That's fine for the trial launch; re-enable it later
if abuse becomes an issue.

## 3. Sanity check

After changing the dashboard settings:

1. Sign out completely (`/login`).
2. Sign up with a fresh email.
3. Expected outcomes:
   - **Confirm email OFF:** you land on `/setup` immediately, signed in.
   - **Confirm email ON:** you land on `/login` with a "check your email"
     toast; the confirmation link in the email opens `{origin}/setup`.
4. Password reset from `/reset-password` should send an email whose
   link opens `{origin}/reset-password/confirm`, not localhost:3000.
