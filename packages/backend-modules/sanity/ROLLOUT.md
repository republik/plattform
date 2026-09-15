# Sanity backend rollout plan

Pre-merge and pre-cutover checklist for `hd/sanity-backend-changes`. Covers what needs to be configured or run before/around merging this branch and before flipping the feature flags that make Sanity content live for real users.

## Required before merging — nothing works correctly without these

### Sanity connection config

Set in `apps/api/.env.example` / the real environment:

- `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_VERSION`, `SANITY_API_TOKEN` — without these the entire `sanity` module can't talk to Sanity at all. Lazily loaded (won't crash boot), but every webhook/worker that touches Sanity will fail at first use.
- `SANITY_WEBHOOK_TOKEN` — shared secret Studio's server-side Functions authenticate with when calling `POST /webhooks/sanity/*`. Must match Studio's `SANITY_STUDIO_API_TOKEN` exactly, or every one of those calls gets rejected.
- `SANITY_STUDIO_READ_TOKEN` — separate secret for the read-only `GET /webhooks/sanity/*` endpoints (e.g. subscriber-count), shipped into Studio's public browser bundle. Must match Studio's `SANITY_STUDIO_READ_TOKEN`. Kept distinct from `SANITY_WEBHOOK_TOKEN` so it can be rotated independently if it leaks.

### Migrations

Three new ones, must run in order as part of the deploy (not automatic):

1. `20260915100000-add-sanity-id-to-collection-document-items` — adds `collectionDocumentItems.sanityId` (nullable), drops `repoId`'s `NOT NULL`, adds a `CHECK (num_nonnulls("repoId", "sanityId") >= 1)` constraint `NOT VALID` (a row must have at least one of the two set — both may be set at once, see the dual-write note below). Written idempotently (`IF NOT EXISTS`/`DROP ... IF EXISTS` before re-adding) so it applies cleanly whether the table has none of this yet or already has an earlier, stricter version of the same constraint from before it was relaxed — no manual reconciliation needed on any environment, just a normal `migrate up`.
2. `20260915100001-validate-sanity-id-check-collection-document-items` — validates that constraint. **Must run as its own migration, not bundled into the file above** — db-migrate wraps each migration file in one transaction, so validating in the same file would still hold the `ACCESS EXCLUSIVE` lock from the `ALTER TABLE` for the whole scan. Splitting them is what lets the scan run under the lighter `SHARE UPDATE EXCLUSIVE` lock instead, on a table (`collectionDocumentItems`) written on essentially every article view.
3. `20260910120000-next-reads-sanity-views` — creates the `next_reads_sanity` schema/materialized views/`discussion_refs` table.

If these haven't run when the app deploys, `SanityReadingPositionRefreshWorker`/`SanityNextReadsFeedRefreshWorker` (scheduled unconditionally, see below) will fail their first cron job (45–60 min post-deploy) against a nonexistent schema — not a crash, just a failed/retried queue job, but land the migrations with the deploy rather than after.

## Feature flags — all default to disabled; decide the rollout order

All defined in `apps/api/.env.example`, all `false`/unset unless explicitly set to `"true"`:

| Flag | Gates | Disabled behavior |
|---|---|---|
| `SANITY_SYNC_FROM_PUBLIKATOR_ENABLED` | The whole publikatorSync mirror: commit/publish/unpublish → Sanity draft/published doc, including legacy Huebsch audio linking | No-op, nothing enqueued |
| `SANITY_PUBLISH_NOTIFICATIONS_ENABLED` | Real emails/push for Sanity article publishes | Webhook accepts the call, logs, enqueues nothing |
| `SANITY_REDIRECTS_ENABLED` | Writing real production redirects from Studio slug changes | Webhook accepts the call, logs, writes nothing |
| `SANITY_DISCUSSIONS_ENABLED` | Discussion create/update webhook | Returns an explicit 503 (not faked success — Studio only calls this once per discussion and relies on the returned id, so pretending to succeed would leave the link permanently missing) |
| `SANITY_AUDIO_GENERATION_ENABLED` | Billed Huebsch TTS generation | Webhook accepts the call, logs, starts no generation |
| `SANITY_DOCUMENT_REFS_ENABLED` | Whether `Notification.object`/`Subscription.object` can resolve to the `SanityDocumentRef` union member | Resolves to `null` instead (same as an already-deleted object) — keep off until the frontend has a fragment for it |

Two operational notes, both called out in the `.env.example` comments themselves:

- `SANITY_SYNC_FROM_PUBLIKATOR_ENABLED` and `SANITY_PUBLISH_NOTIFICATIONS_ENABLED` **must be set identically in both the web and scheduler processes** — one enqueues, the other performs. A mismatch means jobs get queued but never processed, or vice versa.
- These are independent, single-purpose switches, not one master toggle. Suggested order:
  1. `SANITY_SYNC_FROM_PUBLIKATOR_ENABLED=true` first — drafts start mirroring, can be previewed/tested without any user-facing effect.
  2. `SANITY_REDIRECTS_ENABLED`, `SANITY_DISCUSSIONS_ENABLED`, `SANITY_AUDIO_GENERATION_ENABLED` once Studio's production webhooks are confirmed live and the corresponding write paths have been smoke-tested.
  3. `SANITY_PUBLISH_NOTIFICATIONS_ENABLED` last, at or right before the actual cutover — this is the one that emails real subscribers.
  4. `SANITY_DOCUMENT_REFS_ENABLED` only once the frontend ships a `... on SanityDocumentRef` fragment.

## Recommended, not launch-blocking

- `yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-collection-items --confirm` — backfills bookmark/audio-queue/progress `sanityId`s for already-migrated content, so the new Sanity-oriented queries (`userCollectionItems`, `userDocumentProgress`, `userAudioQueue`) see them immediately instead of waiting for a user to re-interact. Self-heals over time even without running this (via `legacySanityId` resolution elsewhere), but nice to have ahead of time. Safe to run well before cutover, not just close to it: it's a dual-write (keeps `repoId`, adds `sanityId` alongside it), so the currently-deployed old frontend keeps seeing every backfilled item exactly as before — nothing disappears from old clients.
- `yarn workspace @orbiting/backend-modules-sanity run migrate-legacy-subscriptions --confirm` — no longer launch-critical (`resolveNotificationRecipients` already matches subscriptions on both the legacy repoId and the migrated Sanity ref), but still worth running eventually to normalize the stored rows ahead of the eventual Elasticsearch-resolution retirement.

## Outside this repo — needs confirmation from whoever owns Studio/infra

- **Studio deployment state**: is Studio actually pointed at production and calling these webhooks yet, or still dormant until cutover?
- **Fresh production data import**: the last verified full `import-wizard.sh` run (studio repo, `import/publikator/`) was targeted at the `development` dataset. Confirm a production-targeted run (fresh ES dump, production `discussions.json`, production Mailchimp segment ids — the wizard explicitly warns about using the wrong dataset's inputs for these) is planned close to cutover.
- **`backfill-discussion-settings` + `sync-discussion` undeploy/redeploy**: documented in the studio repo's own migration README as a required manual procedure (undeploy the `sync-discussion` Studio Function before running the backfill, redeploy after) to avoid duplicate-thread creation. Confirm it's on the cutover runbook.

## Verifying after deploy

1. Confirm the three migrations applied (`SELECT * FROM next_reads_sanity.discussion_refs LIMIT 1;` shouldn't error; `\d "collectionDocumentItems"` should show `sanityId` and the validated constraint).
2. With `SANITY_SYNC_FROM_PUBLIKATOR_ENABLED=true`, make a small Publikator edit and confirm a matching Sanity draft appears.
3. Trigger a `syntheticReadAloud` webhook completion (or wait for a real one) and confirm the resulting Sanity draft/published doc picks up `audioSourceMp3` without a manual re-edit.
4. Watch logs for `sanity sync: legacy audio link failed` / `syntheticReadAloud webhook: failed to enqueue Sanity resync` — these are expected to stay silent; any repeated occurrence means the audio side-channel is unhealthy (it won't block publishing, but audio linking silently won't happen either).
5. Before flipping `SANITY_PUBLISH_NOTIFICATIONS_ENABLED`, use the studio subscriber-count endpoint on a real article to sanity-check the recipient count looks right.
