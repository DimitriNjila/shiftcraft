# Mise en Place Design Reference

Source: Claude Design project `f026ab87-c0aa-42cd-bd85-f3c8eb76c781` ("Mise En place").
Fetch any file via DesignSync: `get_file` with `projectId` + `path`.

## Files fetched during Stage 0
All content read into context — retrieve on demand via DesignSync if needed later.

### Foundation
- `src/tokens.css` — full color/type/spacing/shadow system, light + dark themes. **Saved locally at `design/src/tokens.css`.**
- `Mise en Place.html` — mounts React 18 UMD + all JSX modules via babel-standalone. Google Fonts: Manrope, Work Sans, Inter, JetBrains Mono, Newsreader.

### Screens
- `src/App.jsx` — router, tweaks state, applies data-attributes (`data-theme`, `data-radius`, `data-btn`, `data-ink`) and CSS vars for accent/density.
- `src/Auth.jsx` — LoginScreen (SSO + email/pw), SignupScreen (2-step), NotFoundScreen. AuthShell with EditorialPanel right side.
- `src/Dashboard.jsx` — Stat cards, TrendChart (SVG), AiPanel (ink), Heatmap, ShiftTable ("On the floor").
- `src/Shell.jsx` — Avatar (initials, oklch hue-hashed), Sidebar (workspace + flows sections), Topbar (search, tweaks, theme, bell).
- `src/Schedule.jsx` — ScheduleBuilder with weekly grid, drag/drop shifts, open-shift strip, AI autofill modal, ShiftBlock.
- `src/Templates.jsx` — TemplateCard grouped by day-range, TemplateModal (day picker + role picker + count stepper), empty state.
- `src/Screens.jsx` — StaffRoster (table/grid), EmployeeProfile (tabs), TimeOff, Settings (Locations/Roles/Rules/Integrations/Billing).
- `src/Share.jsx` — ExportMenu (dropdown), ShareModal (link + WhatsApp/Email/Text quick actions + revoke), PrintPreview (US Letter landscape sheet).
- `src/PublicView.jsx` — Employee-facing shared schedule, personal + week variants, fixed light palette, iOS device frame.
- `src/ImportFlow.jsx` — 3-step (Upload/Reading/Review), photo-first or split variant, scanline processing animation, editable preview table.
- `src/Tweaks.jsx` — TweaksPanel + ACCENTS list (emerald/midnight/ember/plum).
- `src/DesignDoc.jsx` — Design system doc route.

### Support
- `src/Icons.jsx` — line-icon set (~35 icons), 1.6 stroke width, 20px default.
- `src/mockData.jsx` — LOCATIONS, ROLES, STAFF, DAYS, DATES, SHIFTS_SEED, OPEN_SHIFTS_SEED, TIME_OFF, TEMPLATES, IMPORT_ROWS + helpers `getStaff`, `getRole`, `formatHour`, `hashHue`.
- `src/ios-frame.jsx` — iOS 26 device chrome (IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard). Used only for PublicView mockup.

### Assets (not saved locally — reference in project only)
- `assets/auth-clouds.png` — editorial panel background on auth screens (dithered).
- `assets/dither-peak.png`, `assets/hero-ridge.png`, `assets/hero-scape.png` — landing-page imagery (not needed for app routes).

## Key design decisions distilled

### Type system
- **Display**: `Newsreader` italic serif at `display-lg` (2.875rem/1.04) and `display-md` (2rem/1.1). Optical size 6..72.
- **Headline**: `Newsreader` at `headline-lg` (1.5rem/1.15) and `headline-md` (1.25rem/1.25).
- **Titles**: `Work Sans` 600 at `title-lg` (17px), `title-md` (15px), `title-sm` (13.5px).
- **Body**: `Work Sans` 400 at `body-md` (13.5px), `body-sm` (12.5px).
- **Labels**: `Inter` 550, uppercase, 0.07–0.09em tracking — `label-md` (10.5px), `label-sm` (9.75px).
- **Mono**: `JetBrains Mono`, tabular-nums, -0.01em tracking. Used everywhere numbers live.

### Color philosophy
- Warm off-white light palette (`#faf7f0` bg). Dark palette is warm neutral (`#131212`).
- **Depth = surface steps + hairlines**, never hard borders. Cards use `box-shadow: inset 0 0 0 1px var(--hairline), var(--shadow-ambient)`.
- Emerald `#006b47` is the sole action color. Amber `#b8620b` for attention. Coral `#ffb3af` for on-leave/tertiary.
- Ink panel (`#12291c`→`#0e2315`) for editorial dark surfaces (auth right, AI panel, billing, 404 art).
- Grain overlay via inline SVG turbulence.

### Buttons
- `.btn-primary`: ink `#12291c` bg, cream `#f5f2ea` text, small green-tinted shadow. In dark theme / ink-panel: flips to cream bg + ink text.
- `.btn-secondary`: surface-lowest + hairline-strong ring, minimal.
- `.btn-ghost`: transparent, muted.
- `.btn-icon`: 30×30 square.
- Radius controlled by `--btn-r` (9px default) or `[data-btn="pill"]` → 999px.
- All buttons have `:active { transform: scale(0.985); }` and hover translate/brighten.

### Radius scale
- `--r-sm: 5, --r-md: 8, --r-lg: 10, --r-xl: 12, --r-2xl: 16` (soft default).
- `[data-radius="crisp"]` scales down (3/6/8/10/12), `[data-radius="round"]` scales up (8/11/14/18/24).

### Component conventions
- Cards: `.card` (18px pad, `--r-xl`), `.section` (22px pad, `--r-2xl`).
- Chips: 999px radius, `label-md` font, `--surface-high` bg with subtle inset ring.
- Inputs: no border — `inset 0 0 0 1px var(--hairline-strong)` + focus ring 3px accent-mix.
- Avatars: color derived from `hashHue(name)` → `oklch(0.82 0.06 h)` bg + `oklch(0.28 0.08 h)` text.
- Role colors: hue-based in ROLES (barista=30, cashier=210, baker=280, lead=155). Chips use `oklch(0.88 0.04 hue)`.

### Layout
- App shell: `232px 1fr` grid (rail = `64px 1fr`, hidden = `0 1fr`).
- Page padding: `24px 36px 48px`.
- Topbar: `13px 36px` with inset-bottom hairline.
