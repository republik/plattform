// Once a release's `schedule` action has run (state "scheduled"/"scheduling"),
// Content Lake locks every document in it server-side — "Documents in release
// ... can not be mutated" — and rejects ANY mutation, from ANY client/token,
// until it's unscheduled or published. There is no bypass flag. Studio's
// Terminieren calls `releases.schedule()` synchronously right after stamping a
// version, so by the time this backend's Huebsch webhook writes the finished
// audio back (often minutes later), the lock is routinely already in effect.
//
// withReleaseUnlock briefly unschedules a genuinely locked release, runs the
// mutation, and re-schedules it to the SAME publishAt once nothing else is
// still using the unlock. A release that isn't actually locked (no release at
// all, or state "active" — not yet scheduled, or paused because its version
// was edited) is left exactly as found: this must never schedule a release
// that wasn't already scheduled.
//
// Reentrant by design: calling this twice for the SAME release before the
// first call has relocked it reuses the first call's unlock instead of each
// independently unscheduling/rescheduling. That's not a hypothetical — the
// studio side of this exact guard caused a real incident: two call sites
// patching the same version in sequence within one handler (bracketing some
// other async work) each independently ran their own unlock→patch→relock
// cycle, seconds apart, and raced each other (Sanity's schedule action isn't
// instantaneous — there's a transitional "scheduling" state), leaving the
// release stuck unscheduled once the second cycle's own relock ran against
// state the first cycle had already changed. This backend's own
// generateAudioHandler has the same shape (claimAudioGeneration, then later
// markPendingVersionError/reportAudioGenerationError/reportAudioGenerationSuccess
// on the same documentId, including from a fire-and-forget async catch after
// the response was already sent) — tracking an in-flight session per release
// and only relocking once the LAST caller is done closes that race regardless
// of how many call sites end up touching the same document, without having
// to restructure every branch of that handler to coordinate by hand.
//
// Twin implementation: republik/studio's functions/shared/releaseLock.ts —
// the two repos can't share code, so keep them in sync by hand if this logic
// changes.
import type { SanityClient } from '@sanity/client'
import { releaseIdFromVersionId } from './document'

const LOCKED_STATES = new Set(['scheduled', 'scheduling'])

// Retried, not just logged: a bare one-shot relock attempt is fragile for the
// one step that must not fail — Sanity's schedule action can genuinely reject
// a request that lands right as the matching unschedule is still propagating.
const RELOCK_ATTEMPTS = 3
const RELOCK_RETRY_DELAY_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function relock(client: SanityClient, releaseId: string, publishAt: string): Promise<void> {
  for (let attempt = 1; attempt <= RELOCK_ATTEMPTS; attempt++) {
    try {
      await client.releases.schedule({ releaseId, publishAt })
      return
    } catch (err) {
      if (attempt === RELOCK_ATTEMPTS) {
        // Deliberately not rethrown — must not mask mutate()'s own outcome.
        // This IS the failure mode that needs a human: the release is now
        // sitting unscheduled with nothing else watching it.
        console.error(
          `RELEASE STUCK UNSCHEDULED: ${releaseId} could not be re-locked ` +
            `after ${RELOCK_ATTEMPTS} attempts (was due to publish at ${publishAt}). ` +
            `Needs manual recovery.`,
          err,
        )
        return
      }
      await sleep(RELOCK_RETRY_DELAY_MS)
    }
  }
}

interface UnlockSession {
  refCount: number
  publishAt: string
}

// Per-release-id sessions — only meaningful within this long-lived Express
// process, which is exactly the scope where the race above actually happens
// (multiple calls within, or close together during, one request).
const activeSessions = new Map<string, UnlockSession>()

export async function withReleaseUnlock<T>(
  client: SanityClient,
  documentId: string,
  mutate: () => Promise<T>,
): Promise<T> {
  const releaseId = releaseIdFromVersionId(documentId)
  if (!releaseId) return mutate()

  let session = activeSessions.get(releaseId)
  if (session) {
    session.refCount++
  } else {
    const release = await client.releases.get({ releaseId })
    if (!release || !LOCKED_STATES.has(release.state)) return mutate()

    const publishAt = release.publishAt ?? release.metadata.intendedPublishAt
    if (!publishAt) return mutate() // can't relock without a target time — don't unlock either

    await client.releases.unschedule({ releaseId })
    session = { refCount: 1, publishAt }
    activeSessions.set(releaseId, session)
  }

  try {
    return await mutate()
  } finally {
    session.refCount--
    if (session.refCount <= 0) {
      // Remove before awaiting the relock: a call arriving in that window
      // sees the release as "active" (not yet relocked) and just runs its
      // own mutation directly — correct, since the document genuinely still
      // is mutable at that instant — rather than starting a second session.
      activeSessions.delete(releaseId)
      await relock(client, releaseId, session.publishAt)
    }
  }
}
