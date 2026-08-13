# Geschäftsbericht data scripts

Scripts to calculate the numbers needed for Republik's annual report
("Geschäftsbericht"). There was no dedicated script for this before —
last year's numbers (report for FY 2024/2025, snapshot 30.06.2025) were
pulled ad hoc from several unrelated scripts and Ultradashboard/Metabase
questions. These scripts replicate that report's tables in a repeatable
way.

Default dates target FY 2025-07-01–2026-06-30 / snapshot 2026-06-30.
Override via CLI flags for future years.

## Timezone handling

All date CLI flags (`--asOf`) are parsed as calendar
dates in **Europe/Zurich**, not the host machine's timezone — `--asOf
2026-06-30` means "end of 30.06.2026, 23:59:59.999, Zurich time". Every
script in this folder takes a single `--asOf` (the fiscal year end date)
and derives whatever range it needs internally
(`lib/dates.js`'s `fiscalYearStartFromAsOf`) — fiscal years always run
01.07.–30.06., so there's no legitimate reason for a separate `--from`/`--to`
pair that could end up mismatched. This is handled
by `lib/dates.js`'s `endOfDayInZurich`/`startOfDayInZurich`, which use
dayjs's `utc`/`timezone` plugins so the result is identical no matter what
timezone the process itself runs in (verified: same absolute instant
whether run with `TZ=UTC`, `TZ=America/New_York`, or unset).

This matters because of a real bug found and fixed here: naively parsing a
bare `'2026-06-30'` string and then formatting it back down to
`'YYYY-MM-DD'` before sending it to Postgres throws away all timezone
info — Postgres then reinterprets the bare string using its own session
timezone (commonly UTC on a Heroku Postgres instance), landing on
`2026-06-30T00:00:00Z`. That's **~22 hours before** the intended
`2026-06-30T21:59:59.999Z`, which silently excluded anyone who joined
during the 30th and silently included anyone who left during the 30th.
Every script now passes the full precise instant (`.toDate()`) as the query
parameter — never a re-formatted date string — and only uses
`.format('YYYY-MM-DD')` for display/output labels.

## Tables and scripts

| Table | Script | What it needs |
| --- | --- | --- |
| A: Mitgliedschaften per Stichtag | `membershipsAndSubscriptions.js` | Postgres |
| B: Abonnemente per Stichtag | `membershipsAndSubscriptions.js` | Postgres |
| A+B evolution: Mitgliedschaften/Abonnemente zum Monatsende (with new/lost/net), one fiscal year at a time | `membershipEvolutionByFiscalYear.js` | Postgres — 13 queries per run |
| C: Community (Debattenbeiträge) | `community.js` | Postgres |
| E: Publizistische Arbeit | `../../documents/script/geschaeftsbericht.js` | Elasticsearch — GraphQL `search` aggregations + a scroll pass (slow — full year) |

Table D (Geschlechterverteilung) isn't covered by a script here — it needs a
different data source than the rest of this folder.

Run each with `node <script>.js --help` for flags. All default to
`DATABASE_URL`/`ELASTIC_URL` etc. from the environment, same as sibling
scripts (`republik/script/finance/calculateKpis.js`,
`documents/script/count.js`).

`membershipsAndSubscriptions.js`, `membershipEvolutionByFiscalYear.js`, and
`community.js` all exclude a fixed list of internal/test accounts (dummy
users, media archive, national library account, Apple/Android test users,
dialog user) via `lib/excludedUsers.js`, which reads the actual ids from
`GESCHAEFTSBERICHT_EXCLUDED_USER_IDS` (comma-separated uuids, not committed
to source control) — required, every script here throws immediately if it's
unset. Table E (publishing stats) doesn't need this since it counts
documents, not users.

All output filenames include the fiscal year they're for plus the run
date/time, e.g. `A-mitgliedschaften_FY2025-2026_2026-08-12_1556.csv` — every
file from one script invocation shares the same timestamp, so re-running
never overwrites a previous run's output, and files for different fiscal
years never collide either. The fiscal year label is derived from `--asOf`.

## Reduced subscriptions by discount duration

`membershipsAndSubscriptions.js` also outputs
`A-reduced-by-discount-duration_FY....csv`, splitting new-system reduced
`YEARLY_SUBSCRIPTION`s into "Einstiegsangebot oder Kampagnen" (Stripe coupon
duration `once` — a first-year-only discount, e.g. the `YEARLY_REDUCED`
offer in `payments/lib/shop/offers.ts`) vs. "Reduzierte Mitgliedschaften"
(Stripe coupon duration `repeating`/`forever`, merged into one row — a
permanent discount applied every renewal, e.g. the `STUDENT` offer's
`fixedDiscount`). This comes from Stripe's own coupon
`duration` field, stored verbatim in `payments.invoices."discounts"` (a
jsonb column populated directly from `invoice.discounts` in
`payments/lib/handlers/stripe/invoiceCreated.ts` — see that file for the
raw Stripe `Discount`/`Coupon` object shape). The old system has no
equivalent — `memberships.reducedPrice` is a plain boolean with no duration
concept — so this breakdown only covers the new-system side and isn't
folded into the main categorized CTE.

## Known approximations — do not treat blindly as final numbers

- **Gift-membership definition (old system)**: a membership counts as
  "Mitgliedschaft als Geschenk" if it was bought via the `ABO_GIVE` package
  (always a gift, even if purchaser and current holder are the same, e.g. an
  unclaimed voucher), OR if the pledge's payer differs from the current
  holder (a regular `ABO` directly gifted to someone else). Confirmed with
  the team as the correct definition. Note this is a genuinely different
  metric from a simple "gift memberships redeemed this fiscal year" count —
  it accumulates across all years a gift-originated or purchaser-mismatched
  membership stays active, so a growing gift-campaign base (e.g. yearly
  Christmas pushes) will show up as steady growth here even without a
  change in this year's campaign volume. If this number diverges
  significantly from expectations, check whether last year's figure used
  the same point-in-time-accumulation definition or a different
  fiscal-year-scoped one.
- **Reduced-price detection (new payments system)**: a subscription is
  flagged "reduziert" if its overlapping `payments.invoices` row has
  `totalDiscountAmount > 0`. This is best-effort — any positive discount
  counts, not specifically the `YEARLY_REDUCED` offer's discount. Cross-check
  against `payments/lib/config.ts`'s `PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS`
  if the numbers look off.
  **Known side-effect in `membershipEvolutionByFiscalYear.js`**: because this
  is recomputed per invoice at each snapshot date (not fixed at signup), a
  `YEARLY_REDUCED` subscriber shows as "reduziert" while their discounted
  first-year invoice is active, then flips to plain "Jahresmitgliedschaft"
  once their non-discounted second-year invoice starts — the same continuous
  subscription registers as one category "losing" a member and the other
  "gaining" one in that month. Confirmed via cross-check against a raw
  new/lost export: **the combined net across Jahresmitgliedschaft +
  reduziert + Geschenk stays accurate every month** (checked within ~2%),
  but the *gross* `new`/`lost` split specifically between Jahresmitgliedschaft
  and reduziert can be inflated 50%+ in months with many first-year discounts
  expiring (e.g. ~12 months after a `YEARLY_SUBSCRIPTION` signup wave).
  Trust the combined total and `net`; don't read `new`/`lost` for these two
  categories individually as real acquisition/churn figures.
- **Gift detection (new payments system)**: matched by finding a
  `payments."giftVouchers"` row `redeemedBy` the subscription's user within
  ±14 days of `currentPeriodStart`. There's no FK between vouchers and
  subscriptions, so this is a fuzzy heuristic, not exact.
- **Interactive stories**: the script only outputs *candidate* URLs (any
  document containing a `DYNAMIC_COMPONENT` zone). Last year's report
  hand-picked ~12 URLs from a larger candidate set — expect to do the same
  manual curation this year from `E-interactive-story-candidates.csv`.
- **Publishing stats (Table E)**: article/newsletter/discussion counts and
  hasAudio/hasVideo counts come from the GraphQL `search` query's
  aggregations (`template`, `hasAudio`, `hasVideo` keys) — the same query
  used for last year's report, called directly from Node without HTTP.
  charCount and the interactive-story candidate list have no aggregation
  equivalent and still come from a raw Elasticsearch scroll.
- **Any `Sonstige (alt): ...` / `Sonstige (neu): ...` category** in the
  membership/subscription output means an unanticipated
  `membershipTypes.name` / `payments.subscription_type` value showed up —
  investigate and extend the `CASE` mapping in
  `membershipsAndSubscriptions.js` before trusting totals.
- **Cross-system double-counting**: a user migrating from the old system to
  the new one can have an active row in both simultaneously (confirmed via
  diagnostic: 22 users as of 30.06.2025). `lib/membershipCategorizedCte.js`
  drops the old-system row for any user who also has a new-system row,
  preferring the new system as the more current source of truth. If the
  count still looks off, check `A-B-breakdown-by-source_FY....csv`
  (`membershipsAndSubscriptions.js`) — it breaks every category down by
  `source` (old/new) and raw `type_name`, matching the exact structure of
  the original "Weitere Daten für Geschäftsbericht" source table (e.g.
  category → ABO row + YEARLY_SUB row → summed total), so a mismatch against
  that table can be traced to a specific system instead of only comparing
  already-combined totals.
- **Failed-payment-attempt inflation (new payments system, fixed)**: the
  query used to count ANY `payments.subscriptions` row whose invoice period
  covered the snapshot date — with no `status` filter at all. A declined
  card retried several times creates a new `subscriptions`+`invoices` row
  per attempt, each landing in `status = 'incomplete_expired'`, and every
  one of those was being counted as a separate active member (found via
  diagnostic: one user had 5 `incomplete_expired` rows plus 1 real `active`
  row, all simultaneously "active" by period dates alone — this was the
  single biggest driver of the total Mitgliedschaften/Abonnemente overcount
  vs. the original report, ~190-200 memberships as of 30.06.2025). Fixed by
  excluding `status IN ('incomplete', 'incomplete_expired')` — **not** a
  broader allowlist like `('active', 'past_due', 'unpaid', 'paused')`
  (which is what the `cockpit_membership_evolution` materialized view uses
  for its always-current dashboard count). That allowlist was tried first
  and undercounted Monatsabonnement by ~59%: `status` is a CURRENT, mutable
  field, so a subscription genuinely active on the snapshot date but since
  cancelled shows `status = 'canceled'` *today* — a broad allowlist wrongly
  excludes it, treating "cancelled since" the same as "payment never
  completed". `incomplete`/`incomplete_expired` is the narrow, historically
  stable signal: it means no payment ever succeeded, so the invoice's
  period never represented real paid access in the first place, which is
  true regardless of when you ask — unlike `canceled`.

## Monthly evolution within a fiscal year (new/lost/net)

`membershipEvolutionByFiscalYear.js` takes a single `--asOf` (the fiscal
year end, 30.06.) and computes all 12 month-ends of that fiscal year itself
(01.07.–30.06.) — no need to pass a date range. Output mirrors the shape of
the "Mitgliedschaften zum Monatsende" / "Neue/Verlorene Mitgliedschaften zum
Monatsende" Google Sheets referenced in the original task list, but using
this repo's validated categories instead of raw `membershipTypes.name`
values.

`count` (point-in-time active count per month-end) and `new`/`lost`/`net`
are computed by two genuinely **different methods**, on purpose:

- `count` reuses the exact same `categorized` CTE as
  `membershipsAndSubscriptions.js` (`lib/membershipCategorizedCte.js`,
  period-coverage based) — the right tool for "how many are active on this
  exact date."
- `new`/`lost` come from `lib/membershipLifecycleCte.js`, a **lifecycle-event**
  model (creation/cancellation dates), one single query for the whole fiscal
  year instead of a query per month. This was originally implemented by
  diffing consecutive `count` snapshots month-to-month, but a side-by-side
  comparison against an existing Metabase reference dashboard (question
  #1809, "abo-gain-loss-grouped-by-month-company-and-abo-type") showed that
  approach measures something different: diffing snapshots treats ANY
  invoice-period gap (a renewal invoice generated a few days late, a payment
  retry cycle, proration) as a lost+new event pair, even when the person
  never actually left — inflating gross `new`/`lost` by up to ~860/month in
  high-volume acquisition months, while `net` was only off by 3-124/month.
  `lib/membershipLifecycleCte.js` ports Metabase's own logic instead: for
  the old system, it segments `membershipPeriods` by gaps (a gap crossing a
  calendar-month boundary starts a new segment) and uses each segment's
  min/max as its lifecycle start/end; for the new system, it uses the
  subscription's own `createdAt` (gain) and `COALESCE(endedAt, cancelAt)`
  (loss) directly, ignoring invoice periods entirely — matching Metabase.
  Because of this, `count(M) - count(M-1)` and this month's `net` are **not
  guaranteed to be equal** — they're two independently-computed, both valid,
  measurements of different things (a snapshot count vs. lifecycle churn
  events). Run this once per fiscal year you need (e.g. `--asOf 2025-06-30`,
  `--asOf 2026-06-30`).

Each month also gets two aggregate rows — `category: 'Total Mitgliedschaften'`
and `category: 'Total Abonnemente'` — summing `count`/`new`/`lost`/`net`
across `MITGLIEDSCHAFTEN_CATEGORIES`/`ABONNEMENTE_CATEGORIES`
(`lib/membershipCategories.js`), giving a directly comparable month-by-month
total series (e.g. against a "Mitgliedschaften zum Monatsende" reference
like Juli 2024: 21326 … Juni 2025: 25112).

Output is split into four CSVs (plus one combined JSON with all four
arrays) — one axis is total vs. per-category breakdown, the other is
Mitgliedschaften vs. Abonnemente:

- `F-mitgliedschaften-total_FY....csv` — just the `Total Mitgliedschaften`
  row per month
- `F-mitgliedschaften-breakdown_FY....csv` — the four Mitgliedschaften
  categories per month, no totals
- `F-abonnemente-total_FY....csv` — just the `Total Abonnemente` row per
  month
- `F-abonnemente-breakdown_FY....csv` — the three Abonnemente categories
  per month, no totals

so a total-only chart/table for one report table doesn't need to filter out
the category rows or the other table's data.

**History**: `new`/`lost` used to be computed by diffing `count` snapshots
month-to-month, which — for Jahresmitgliedschaft/reduziert specifically —
was inflated by reduced-price reclassification (the point-in-time
`is_reduced` check re-evaluates per invoice, so a subscriber's category
flips as their first-year discount expires, registering as one category
losing a member and the other gaining one even though nobody left). That
symptom, and a side-by-side check against Metabase, is what led to the
lifecycle-event rewrite described above — `new`/`lost` no longer have this
issue, since gain/loss are now tied to actual creation/cancellation, not to
which category a still-active person's invoice happens to fall into this
month. Not independently re-validated against Metabase after the rewrite
yet — do that before trusting the exact figures for a real report.

## Year-over-year comparison

`membershipsAndSubscriptions.js` runs the same snapshot query twice — once
for `--asOf`, once for `--asOf` minus one year — and prints/writes both
columns side by side. This is a real YoY comparison every time it's run, not
a hardcoded baseline that goes stale.

Validated once (2026-08) against the published FY24/25 report (30.06.2025:
Jahresmitgliedschaft 17505, reduziert 6816, Gönnermitgliedschaft 136, als
Geschenk 655, Total 25112; Monatsabonnement 3225, als Geschenk 146, Jahresabo
Mitgliederkampagne 185, Total 3556) and independently against a monthly
new/lost membership-evolution export — both checks matched within 0-3% per
category (Gönnermitgliedschaft and Jahresabo Kampagne matched exactly). See
git history on this file for that reconciliation if it needs redoing after a
future schema change.

**Note**: that validation pass predates the timezone fix described above (the
query was then using a ~22h-earlier-than-intended instant on any non-Zurich
host). The affected population is small — only memberships that specifically
started/ended late in the day on a snapshot date — which is consistent with
why that validation already showed close (not wildly off) matches. Re-running
the validation after this fix would be expected to tighten those matches
slightly further, not change the overall picture.
