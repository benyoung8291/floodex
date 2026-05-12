
# FloodEx Workflow Redesign — Holistic Plan

## First-principles framing

A flood restoration job is a **lifecycle**, not a folder of tabs. Every screen should answer one of three questions for whoever is looking at it:

1. **What needs my attention right now?** (triage)
2. **What's the fastest way to capture what I just did?** (capture)
3. **Is this job progressing / billable / closeable?** (status)

The current app exposes data structure (10 tabs, 3 nav layers, scattered pages) instead of those questions. This plan reorganizes around them.

```text
INTAKE  →  SETUP   →  MONITOR    →  DRYOUT     →  CLOSE       →  BILL
(wizard)  (chambers) (readings)    (decisions)   (forms+sigs)   (estimate→invoice)
                     equipment
                     photos
```

---

## Phase 1 — Navigation & shell (foundation)

**Goal:** every primary action ≤ 2 taps from anywhere.

1. **Replace the Dashboard concept with a "Today" home**
   - Default landing route shows: jobs needing attention (overdue readings, stalled drying, unsigned forms), today's scheduled visits, and quick actions.
   - Keep `/dashboard` route, repurpose page contents.

2. **Persistent global FAB ("+ Capture")** on mobile + keyboard shortcut on desktop
   - One-tap to: New Reading, New Photo, New Job, New Work Log. Context-aware (inside a job → defaults to that job).
   - Removes the current pattern of drilling into JobDetail → tab → button.

3. **Mobile bottom nav: 5 items, lifecycle-ordered**
   - Today · Jobs · Capture (FAB-center) · Equipment · More
   - Drop the current Map/Photos slots from primary; Map becomes a Jobs view toggle, Photos becomes a job-level tab.

4. **Desktop: collapsible shadcn `Sidebar`**
   - Replace fixed 256px sidebar with `collapsible="icon"`, grouped by Field / Management / Platform.
   - Adds command palette (⌘K) for jump-to-job, jump-to-action.

5. **Global search + recents in TopHeader**
   - Type "smith" → jumps to job; type "rdg" → opens reading capture. Indexed client-side over already-cached jobs.

---

## Phase 2 — Job lifecycle redesign

**Goal:** replace 10-tab JobDetail with a job workspace that mirrors the lifecycle.

### 2a. Collapse 10 tabs → 4 sections + an action bar

Current: Overview, Chambers, Readings, Logs, Damage, Costing, Forms, Plans, Safety, Photos.

Proposed:
- **Summary** — header + KPIs + next-action card + Customer/Claim/Loss in one scrollable view (merges Overview + Safety + Plans preview).
- **Drying** — Chambers, Readings, Equipment, Floor plan (the "live work" section, single view with sub-toggles).
- **Documentation** — Photos, Work Logs, Damage, Forms (everything written/recorded).
- **Billing** — Costing, Estimates, Invoice readiness.

Each section uses internal segmented control rather than top-level tabs to reduce cognitive load.

### 2b. "Next best action" card

Top of Summary, computed from job state. Examples:
- "No reading in 26 hrs — log readings for 3 chambers" → opens Multi-Chamber Quick Log directly.
- "Drying complete in Chamber 2 — mark dry?" → one-tap state change.
- "Job ready to close — generate Final Report".

### 2c. Sticky job header with status pill + share

Current header already exists; add `cancel_at_period_end`-style state chips: Drying day 3/7 · 2 chambers below target · 1 unsigned form. Replaces hunting through tabs to learn status.

### 2d. Job timeline

Single chronological feed merging readings, work logs, photos, signatures, status changes. Becomes the default "Documentation" landing view. Filters by type. This is the artifact insurers actually want.

---

## Phase 3 — Capture flow optimization (the "tedious entry" fix)

**Goal:** 3-tap reading capture from anywhere; offline-first.

1. **Multi-Chamber Quick Log becomes the default capture flow** for monitoring visits, accessed from FAB → "Log Visit". Auto-advances chambers, remembers last equipment, prefills temp/RH from previous reading with delta input ("+0.5°").

2. **Numeric stepper inputs everywhere** (reuse `StepperInput.tsx`) — replace text inputs for °C, RH, GPP, MC. Long-press for keyboard fallback.

3. **Voice-to-note** for Work Logs and Damage notes (browser SpeechRecognition where available).

4. **Photo capture**: single-tap rear camera, auto-tag to chamber if launched from chamber context, background upload queue (already exists — surface its state in the header so techs know it's syncing).

5. **Smart defaults**
   - New job → infer loss class from source-of-loss selection.
   - New chamber → suggest dimensions from previous chambers in same job.
   - New equipment assignment → default to chambers without coverage.

6. **Bulk actions**
   - Select multiple readings → mark as outdoor / delete.
   - Select multiple chambers → assign equipment / mark dry.

---

## Phase 4 — Performance & responsiveness

1. **Route-level code splitting**
   - Lazy-load JobDetail, Reports, Floor Plan editor (Fabric.js is heavy), Admin pages.

2. **Query strategy audit**
   - JobDetail currently calls 10+ hooks on mount. Convert to a single `useJobWorkspace(id)` aggregator that fetches in one round trip, hydrates React Query caches per-entity. Subsequent tab switches are instant.
   - Add `staleTime` for tenant/equipment lookups (rarely change).

3. **List virtualization**
   - `ReadingsList`, `PhotoGallery`, `JobsList` get `@tanstack/react-virtual` once they cross 50 items.

4. **Optimistic mutations** for: create reading, assign/unassign equipment, mark chamber dry, work log create. Already partial; standardize.

5. **Skeleton → content transitions** with stable layout (no jank). Audit existing skeletons for height matching.

6. **Image pipeline**
   - Confirm existing 1920px client resize. Add WebP encoding fallback. Lazy-load gallery thumbs with `loading="lazy"` + `decoding="async"`.

7. **Mobile feel**
   - Add tap feedback (`active:scale-[0.98]`) to all primary actions.
   - Replace hover-only states with focus-visible.
   - Audit `overflow-x-hidden` per memory rule; replace global instances with scoped containers.

---

## Phase 5 — Findability

1. **Jobs list upgrades**
   - Saved filters (Mine / Active / Drying / Ready to bill).
   - Sort by days drying, last reading, alphabetical.
   - Map view toggle reuses geocoded addresses.

2. **Cross-entity search** (command palette + header) — jobs, customers, claim IDs, chamber names.

3. **Empty-state CTAs everywhere** — every empty list links to the action that fills it.

---

## Technical details

**Files added**
- `src/components/layout/CommandPalette.tsx` (⌘K, fuzzy over jobs/customers).
- `src/components/layout/CaptureFAB.tsx` (context-aware floating button).
- `src/components/jobs/NextActionCard.tsx`.
- `src/components/jobs/JobTimeline.tsx`.
- `src/hooks/useJobWorkspace.ts` (single aggregator).
- `src/hooks/useNextAction.ts` (rule engine for next-best-action).
- `src/lib/jobLifecycle.ts` (state machine: intake→setup→monitor→dryout→close→bill).

**Files restructured**
- `src/pages/JobDetail.tsx` → split into `JobSummary`, `JobDrying`, `JobDocumentation`, `JobBilling` route children under `/jobs/:id/*`.
- `src/pages/Dashboard.tsx` → "Today" home.
- `src/components/layout/MobileBottomNav.tsx` → 5 items + center FAB.
- `src/components/layout/DesktopSidebar.tsx` → migrate to shadcn `Sidebar` w/ `collapsible="icon"`.

**Files unchanged (data layer preserved)**
- All hooks in `src/hooks/useJob*`, `useEquipment`, `useDamageAssessments`, etc., remain. We compose, not rewrite.
- Database schema: no migrations needed.
- Edge functions: untouched.

**Routing**
- New nested routes under `/jobs/:id/{summary|drying|docs|billing}` with redirect from `/jobs/:id` → `/jobs/:id/summary`. Old deep links (e.g. `?tab=photos`) get redirect shims.

**Performance instrumentation**
- Add `web-vitals` reporter writing to console in dev, plus React Query devtools in dev only.

**Accessibility & touch**
- Keep 44px min touch targets per memory rule.
- All new interactive elements get keyboard handlers + `aria-label`.

---

## Out of scope (explicit non-goals)

- Backend/business logic changes. Pricing, billing, RLS, edge functions all untouched.
- Visual brand refresh — keeps current Cream/Tan + Primary Blue + Coral palette and Figtree typography.
- Reports PDF templates — the report content stays as-is; only access paths change.

---

## Sequencing

Build in this order so each phase ships value independently:
1. Phase 4 perf wins + Phase 1 nav shell → instant feel improvement.
2. Phase 2 JobDetail restructure → biggest workflow gain.
3. Phase 3 capture refinements → daily-use polish.
4. Phase 5 findability → scales with job volume.

Estimated effort: ~2 build sessions for Phases 1+4, ~2 for Phase 2, ~1 each for 3 and 5.
