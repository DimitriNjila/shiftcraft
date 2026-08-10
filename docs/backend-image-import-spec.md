# Backend spec: name-based image import for shift templates

**Status:** Requested for Stage 6 (AI image import).
**Owner:** Frontend implemented Stage 5 (CSV/Excel) with the name-based
model. Image parsing is blocked on a small change to the existing
`POST /api/v1/shift-templates/import/image/parse` endpoint.

## Context

The frontend now imports shift templates by parsing **names** out of a
schedule, then joining those names against the restaurant's employee
roster to derive roles. This matches how managers actually keep their
schedules — they know Mya is a Server, so a whiteboard that says
"Mya · Tue · 11a–4p" is enough to produce the template `{ day=Tue,
start=11:00, end=16:00, role=Server, count=1 }`.

The current parse response includes `role` but not `name`, so it only
works when the source file explicitly labels roles. Please extend it to
support name-based sources.

## Change requested

### `POST /api/v1/shift-templates/import/image/parse`

Add a `name` field to each parsed row.

```jsonc
// Response shape — additions marked ← ADD
{
  "column_mapping": { /* always {} for image imports */ },
  "rows": [
    {
      "row_number": 1,
      "name": "Mya Ferrari",             // ← ADD  string | null
      "day_of_week": 2,                  // ISO Mon=1 … Sun=7
      "start_time": "11:00:00",
      "end_time": "16:00:00",
      "role": null,                      // may be null (frontend derives)
      "count": 1,                        // usually 1 per parsed row
      "confidence": "high",
      "errors": [],
      "warnings": [],
      "is_valid": true
    }
  ],
  "valid_count": 12,
  "error_count": 0
}
```

**Rules:**
- `name` may be `null` when the model can't extract one — the frontend
  will surface it as an error for manual entry.
- `role` remains optional. If the Vision model recognizes an explicit
  role label on the schedule, include it; otherwise leave `null` and
  let the frontend look it up.
- `count` for image imports should default to `1` per parsed shift row.
  Frontend aggregates by (day, start, end, role) to produce the final
  template counts.
- Everything else on the response stays the same — no other fields
  change, no new endpoints.

### `POST /api/v1/shift-templates/import/parse` (CSV / Excel)

Same addition. The frontend can do CSV/Excel parsing itself (currently
does), but adding `name` here too would let us stop shipping the ~250KB
xlsx dependency in the browser bundle. **Nice to have; not blocking.**

### `POST /api/v1/shift-templates/import/confirm`

**No change needed.** Frontend already groups rows into the correct
`{ day_of_week, start_time, end_time, role, count }` shape before
posting.

## Prompt guidance for the Vision model

When a schedule photo doesn't explicitly show roles (whiteboards
usually don't), the Vision model should:

1. Extract each cell as `{ name, day_of_week, start_time, end_time }`.
2. Set `count: 1` — the frontend aggregates.
3. Leave `role: null` unless a role label is *obviously* present next
   to the name (e.g. "(Server)" or a colored badge).

## Frontend integration

Once this ships:

- I'll enable the "Photo" tile on `/templates/import` (currently
  disabled with a "Coming soon" badge).
- The frontend calls the image endpoint, receives rows with `name` +
  `null` roles, joins against employees to fill in roles, and reuses
  the existing preview UI.
- No new frontend endpoint or type — same `PreviewRow` shape as the
  CSV flow.

## Testing

Curl the endpoint against a photo where names are visible but roles
aren't:

```bash
curl -X POST /api/v1/shift-templates/import/image/parse \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@whiteboard.jpg"
```

Expect the response to include `name` on each row and (typically)
`role: null`.

## Contact

Frontend Stage 6 will pick this up as soon as the endpoint returns
`name` — no other coordination needed.
