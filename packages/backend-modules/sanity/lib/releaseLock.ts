// Once a release's `schedule` action has run (state "scheduled"/"scheduling"),
// Content Lake locks every document in it server-side — "Documents in release
// ... can not be mutated" — and rejects ANY mutation, from ANY client/token,
// until it's unscheduled or published. There is no bypass flag. Studio's
// Terminieren calls `releases.schedule()` synchronously right after stamping a
// version, so by the time this backend's Huebsch webhook writes the finished
// audio back (often minutes later), the lock is routinely already in effect.
//
// withReleaseUnlock briefly unschedules a genuinely locked release, runs the
// mutation, and re-schedules it to the SAME publishAt in a `finally` — so a
// relock is always attempted even if the mutation itself throws. A release
// that isn't actually locked (no release at all, or state "active" — not yet
// scheduled, or paused because its version was edited) is left exactly as
// found: this must never schedule a release that wasn't already scheduled.
//
// Twin implementation: republik/studio's functions/shared/releaseLock.ts —
// the two repos can't share code, so keep them in sync by hand if this logic
// changes.
import type { SanityClient } from '@sanity/client'
import { releaseIdFromVersionId } from './document'

const LOCKED_STATES = new Set(['scheduled', 'scheduling'])

export async function withReleaseUnlock<T>(
  client: SanityClient,
  documentId: string,
  mutate: () => Promise<T>,
): Promise<T> {
  const releaseId = releaseIdFromVersionId(documentId)
  if (!releaseId) return mutate()

  const release = await client.releases.get({ releaseId })
  if (!release || !LOCKED_STATES.has(release.state)) return mutate()

  const publishAt = release.publishAt ?? release.metadata.intendedPublishAt
  await client.releases.unschedule({ releaseId })

  try {
    return await mutate()
  } finally {
    if (publishAt) {
      try {
        await client.releases.schedule({ releaseId, publishAt })
      } catch (relockErr) {
        // Deliberately not rethrown — must not mask mutate()'s own outcome.
        // This IS the failure mode that needs a human: the release is now
        // sitting unscheduled with nothing else watching it.
        console.error(
          `RELEASE STUCK UNSCHEDULED: ${releaseId} could not be re-locked ` +
            `after patching ${documentId} (was due to publish at ${publishAt}). ` +
            `Needs manual recovery.`,
          relockErr,
        )
      }
    }
  }
}
