# Geschäftsbericht data scripts

Scripts to calculate the numbers needed for Republik's annual report
("Geschäftsbericht"). There was no dedicated script for this before —
last year's numbers (report for FY 2024/2025, snapshot 30.06.2025) were
pulled ad hoc from several unrelated scripts and Ultradashboard/Metabase
questions. These scripts replicate that report's tables in a repeatable
way.

Default dates target FY 2025-07-01–2026-07-01 / snapshot 2026-06-30.
Override via CLI flags for future years.

## Tables and scripts

| Table | Script | What it needs |
| --- | --- | --- |
| A: Mitgliedschaften per Stichtag | `membershipsAndSubscriptions.js` | Postgres |
| B: Abonnemente per Stichtag | `membershipsAndSubscriptions.js` | Postgres |
| C: Community (Debattenbeiträge) | `community.js` | Postgres |
| D: Geschlechterverteilung | `gender.js` | Postgres |
| E: Publizistische Arbeit | `../../documents/script/geschaeftsbericht.js` | Elasticsearch — GraphQL `search` aggregations + a scroll pass (slow — full year) |

Run each with `node <script>.js --help` for flags. All default to
`DATABASE_URL`/`ELASTIC_URL` etc. from the environment, same as sibling
scripts (`republik/script/finance/calculateKpis.js`,
`documents/script/count.js`).

## Known approximations — do not treat blindly as final numbers

- **Reduced-price detection (new payments system)**: a subscription is
  flagged "reduziert" if its overlapping `payments.invoices` row has
  `totalDiscountAmount > 0`. This is best-effort — any positive discount
  counts, not specifically the `YEARLY_REDUCED` offer's discount. Cross-check
  against `payments/lib/config.ts`'s `PROJECT_R_REDUCED_MEMBERSHIP_DISCOUNTS`
  if the numbers look off.
- **Gift detection (new payments system)**: matched by finding a
  `payments."giftVouchers"` row `redeemedBy` the subscription's user within
  ±14 days of `currentPeriodStart`. There's no FK between vouchers and
  subscriptions, so this is a fuzzy heuristic, not exact.
- **Gender distribution**: reflects *currently* active members (as of
  whenever the script is run), not a true point-in-time snapshot as of the
  fiscal year-end. Making it point-in-time would require reusing the
  min/max begin/end-date logic from `membershipsAndSubscriptions.js`.
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

## Reconciliation baseline (30.06.2025, last year's report)

Mitgliedschaften: Jahresmitgliedschaft 17505, reduziert 6816,
Gönnermitgliedschaft 136, als Geschenk 655, Total 25112.

Abonnemente: Monatsabonnement 3225, als Geschenk 146, Jahresabo
(Mitgliederkampagne) 185, Total 3556.

`membershipsAndSubscriptions.js` prints these alongside this year's numbers
as a sanity check. Before trusting a fresh year's run, it's worth first
re-running with `--asOf 2025-06-30` and confirming the script reproduces
these exact figures against the current data model.
