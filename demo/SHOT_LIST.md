# Mise en Place — product demo shot list

**Target length: 70–90 seconds.** Not longer. Every second past 90s halves completion rate.

**Tool stack (recommended):**
- Screen Studio (Mac) or Arcade — capture with cursor smoothing + auto-zoom
- ElevenLabs voice "Adam" or "Rachel" — if you don't want to record your own voice
- Descript — final trim; if you fluff a word, delete it in the transcript
- Music: [Blue Dot Sessions](https://www.sessions.blue) → "Kinship Moor" or "The Consulate". Warm acoustic piano, editorial pacing. Free with attribution.

**Environment prep (do this before hitting record):**
1. Open the deployed site in a **clean incognito window** (no autocomplete, no old sessions).
2. Zoom the browser to **110%** — clicks and typography look bigger on video without breaking the layout.
3. Kill notifications (macOS: Focus mode → Do Not Disturb).
4. **Have the CSV ready on your Desktop.** File is `demo/meridian-schedule.csv` in the repo. Open it in Excel/Numbers once so it looks lived-in, then close.
5. Pre-plan the fake email you'll use: `demo@meridiancoffee.com` is fine. Use a real password you'll remember for this take only.

---

## The cast (memorize these — you'll type them in step 3)

| Name | Role | Rate |
|---|---|---|
| Amelia Ortega | Lead | $28 |
| Jude Nakamura | Barista | $22 |
| Helena Reyes | Baker | $26 |
| Marcus Lee | Cashier | $19 |
| Theo Vance | Barista | $22 |

The spreadsheet uses these exact names — if you fat-finger any of them during onboarding step 2, the import in step 3 will flag "no matching employee" and you'll have to redo the take.

---

## Shot list (10 shots)

### Shot 1 — Landing hero (3 sec)

**Action:** Static shot of the landing page. Cursor parked. Let the "Full crews, calm shifts." headline breathe. The hero mock (day card + AI review annotation) should be fully visible.

**Voice / caption:** *"Restaurant scheduling that starts from where you already are."*

**Editing note:** Slow zoom-in on the hero card during this beat. Screen Studio does this automatically if you scroll — but here you want NO scroll. Add a manual `scale 1.0 → 1.05` over 3 seconds in post.

---

### Shot 2 — Cut to signup (4 sec, sped up 2x)

**Action:** Click **Start free trial** → type email → password → café name ("Meridian Coffee") → **Create account**. Speed up 2x in edit.

**Voice / caption:** *"Sign up in under a minute."*

---

### Shot 3 — Onboarding step 1 (4 sec, sped up 2x)

**Action:** Store details step. Name is pre-filled. Pick "Pacific · Los Angeles" from the timezone dropdown. Click **Continue**.

**Voice / caption:** *(silent — let the visuals speak)*

**Editing note:** This step is dull. Cut hard to the next shot the moment "Continue" clicks.

---

### Shot 4 — Add the team (12 sec, sped up 3x)

**Action:** Onboarding step 2. Click **Add a team member**. Type Amelia's name, pick Lead, rate 28. Click **Add Amelia**. Repeat for Jude, Helena, Marcus, Theo. Click **Continue with 5 people**.

**Voice / caption:** *"Add your team once. Roles and wages live with them."*

**Editing note:** Compress heavily. Screen Studio's auto-zoom will punch in on each **Add** button click — you can crop the montage down to just those five confirmation moments.

---

### Shot 5 — The wedge moment (5 sec)

**Action:** Land on the templates step. Cursor hovers over **"Import a spreadsheet"** — DON'T click yet. Hold for 1.5 sec on the three options so the viewer registers what's on offer.

**Voice / caption:** *"You've been keeping a schedule somewhere already. Bring it in."*

**Editing note:** This is the most important shot in the whole video. It's where you separate yourself from 7shifts, Homebase, etc. Give it the pause.

---

### Shot 6 — Import spreadsheet, real speed (18 sec)

**Action:**
1. Click **Import a spreadsheet**.
2. Drag `meridian-schedule.csv` from the Desktop into the drop zone.
3. Watch the reading animation (~2 sec).
4. The preview table appears — all 32 rows, all matched, all green.
5. Scroll slowly through the preview so viewers can see it's real data.
6. Click **Save 32 templates**.

**Voice / caption:** *"Excel, CSV, whatever you have. We read the rows, match your staff, and every recurring shift becomes a template."*

**Editing note:** This shot is the money. Do NOT speed it up. Viewers need to see the parse-and-match happen at real time or they won't believe it. If your take has any dead time between drag and preview, that's fine — the reading animation is the "trust me, it's working" moment.

---

### Shot 7 — Auto-land on schedules (4 sec)

**Action:** Toast: "Saved 32 templates. Let's compose the week." The page transitions to `/schedules`. Empty state for the current week visible.

**Voice / caption:** *(silent, or a soft "and you're in.")*

---

### Shot 8 — Generate the schedule (6 sec)

**Action:** Click **Generate schedule**. Brief spinner. The weekly grid fills with the shifts from your templates, colored by role. Camera catches the "moment of magic."

**Voice / caption:** *"One click. Next week is drafted from your templates."*

**Editing note:** Add a subtle sound design cue on the fill — a soft chime or paper-rustle. Screen Studio has a library.

---

### Shot 9 — Share (10 sec)

**Action:**
1. Hover over the schedule grid — a manager might drag a shift to demonstrate that things are editable (optional; skip if it slows the pace).
2. Click **Share** in the top-right.
3. Menu opens: **Copy link**, **Download PDF**, **Add to calendar**. Click **Copy link**.
4. Toast: "Link copied."
5. (Optional) Cut to a phone frame showing the shared view.

**Voice / caption:** *"One link. Everyone sees their week. No app to install."*

---

### Shot 10 — Outro (5 sec)

**Action:** Cut back to the landing page hero. Overlay: **mise.app** and **Start free — no card required**.

**Voice / caption:** *"Mise en place. Every station in its place, before service begins."*

---

## Full voice-over script (one take, no cuts)

If you want to record VO once from top to bottom rather than shot-by-shot:

> Restaurant scheduling that starts from where you already are.
>
> Sign up in under a minute. Add your team once — roles and wages live with them.
>
> You've been keeping a schedule somewhere already. Bring it in.
>
> Excel, CSV, whatever you have. We read the rows, match your staff, and every recurring shift becomes a template.
>
> One click. Next week is drafted from your templates.
>
> One link. Everyone sees their week. No app to install.
>
> Mise en place. Every station in its place, before service begins.

**Word count:** 87. At a natural pace that's ~35 seconds of speech. Space it out with 2-second pauses between beats and you land at ~65 seconds of narration inside a 75-second video. Perfect.

---

## Pitfalls to watch for

- **Don't say "AI-powered."** The word triggers a mental discount in this category. "We read the rows and match your staff" is the same claim without the trigger.
- **Don't demo image upload.** It doesn't work reliably yet. If the icon is visible on the import screen, crop or blur it in post, or cover it with a caption card.
- **Don't scroll fast during the preview shot.** Slow scrolling reads as "look how much real data there is." Fast scrolling reads as "hiding something."
- **Don't zoom into pricing.** The pricing page has fabricated social proof ("1,240+ cafés"). If you scroll to it during shot 1, cut around it.
- **Don't include the "Generate schedule" button label if you can help it.** The button is fine, but the *word* "Generate" cues buyers to think about the commodity feature. Just show the fill happen; the visual tells the story.

---

## If you want a 30-second cut for social

Trim to shots **1 → 5 → 6 → 8 → 9**. Skip signup, team, and outro. Open on the wedge line ("You've been keeping a schedule somewhere already"), cut to the import happening, cut to the schedule filling, cut to the share link. 30 seconds, one wedge, one shot of every payoff. This is the version that works on Twitter/X and LinkedIn.
