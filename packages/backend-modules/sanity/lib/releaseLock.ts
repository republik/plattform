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
// Both the unschedule and the relock are retried, not just the relock —
// confirmed live: "scheduling" is genuinely a transient in-between state, not
// just a name — a release still settling into it rejects `unschedule()`
// outright ("is not permitted to transition from state 'scheduling' to
// 'unscheduling'"), a real validationError, not the lock-rejection this whole
// guard exists to route around. Both actions get a few retries with a short
// backoff before giving up, since both can hit this same kind of transient
// state-machine rejection depending on which side of the race they land on.
//
// Twin implementation: republik/studio's functions/shared/releaseLock.ts —
// the two repos can't share code, so keep them in sync by hand if this logic
// changes.
import type { SanityClient } from '@sanity/client'
import { releaseIdFromVersionId } from './document'

const LOCKED_STATES = new Set(['scheduled', 'scheduling'])

// Thrown instead of attempting the mutation when a release is in a state
// this guard has no recovery path for — confirmed live: a "published"
// release's documents are rejected with "Documents in release ... (state:
// published) can not be mutated", a validationError, not the
// documentNotFoundError this module otherwise expects once a release is
// done with. Unlike "scheduled"/"scheduling" there's no unscheduling a
// published (or archived, or a release transitioning toward either) release
// back into a mutable state — callers should treat this the same as a
// vanished document and fall back to the draft (see audio.ts's
// isUnrecoverableVersionError).
export class ReleaseNotMutableError extends Error {
  constructor(releaseId: string, state: string) {
    super(
      `release "${releaseId}" is in state "${state}" and its documents can ` +
        'not be mutated (only "active", "scheduled" and "scheduling" ' +
        'releases can be) — there is no unscheduling/relocking this back ' +
        'into a mutable state',
    )
    this.name = 'ReleaseNotMutableError'
  }
}

const ACTION_ATTEMPTS = 3
const ACTION_RETRY_DELAY_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function withRetries<T>(action: () => Promise<T>): Promise<T> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= ACTION_ATTEMPTS; attempt++) {
    try {
      return await action()
    } catch (err) {
      lastErr = err
      if (attempt < ACTION_ATTEMPTS) await sleep(ACTION_RETRY_DELAY_MS)
    }
  }
  throw lastErr
}

async function relock(client: SanityClient, releaseId: string, publishAt: string): Promise<void> {
  try {
    await withRetries(() => client.releases.schedule({ releaseId, publishAt }))
  } catch (err) {
    // Deliberately not rethrown — must not mask mutate()'s own outcome.
    // This IS the failure mode that needs a human: the release is now
    // sitting unscheduled with nothing else watching it.
    console.error(
      `RELEASE STUCK UNSCHEDULED: ${releaseId} could not be re-locked ` +
        `after ${ACTION_ATTEMPTS} attempts (was due to publish at ${publishAt}). ` +
        `Needs manual recovery.`,
      err,
    )
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
    if (!release) return mutate()
    if (!LOCKED_STATES.has(release.state)) {
      if (release.state !== 'active') {
        throw new ReleaseNotMutableError(releaseId, release.state)
      }
      return mutate()
    }

    const publishAt = release.publishAt ?? release.metadata.intendedPublishAt
    if (!publishAt) return mutate() // can't relock without a target time — don't unlock either

    await withRetries(() => client.releases.unschedule({ releaseId }))
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
