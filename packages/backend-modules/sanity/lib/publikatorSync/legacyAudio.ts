// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// Links a Publikator article's legacy synthesized read-aloud audio
// (publikator.derivatives, type 'SyntheticReadAloud' -- a separate, older
// TTS system from the new Sanity-native Huebsch pipeline in ../../tts/)
// onto the mirrored Sanity document. `meta.audioSource` -- the field old
// clients already play this from -- is computed on read by
// SyntheticReadAloud.processMeta (documents/graphql/resolvers/Document.js),
// not stored on the commit row articleDoc.ts reads, so without this the
// mirrored draft/published doc would simply have no audio at all.
//
// Deliberately a *link*, not a re-generation: audioSourceMp3 is set to the
// existing assets-server URL directly (the same URL already served to end
// users today, no auth) rather than downloading and re-uploading the file as
// a Sanity asset -- that would just be re-hosting content the real cutover
// import (studio's transform.ts) already handles for historical content.
// It's still recorded as a real `audioVersions` entry though (via
// recordAudioVersion, ../audio), so editors get the same browsable/
// restorable history as Huebsch-generated audio -- just a `url`-only entry
// with no `file` asset, the same shape Studio's own backfill-audio-versions
// migration already established as a supported case for pre-Sanity audio.
import type { PgDb } from '@orbiting/backend-modules-types'
import { fetchAudioLinkState } from '../audio'
import type { DraftArticleDoc } from './articleDoc'

export interface LegacyAudioLink {
  doc: DraftArticleDoc
  // Set only when this is a new or changed link that should also be
  // recorded in `audioVersions` -- undefined when nothing changed (already
  // linked, same URL) or there's simply nothing to link. Recording this
  // requires its own patch, applied AFTER the createOrReplace that writes
  // `doc` -- createOrReplace is a full-document overwrite and `doc` doesn't
  // carry `audioVersions`, so writing it any earlier would just get wiped
  // out again by that same sync's own createOrReplace call. See worker.ts.
  newVersion?: { audioSourceMp3: string; durationMs: number; generatedAt: string }
}

export async function linkLegacySyntheticAudio(
  doc: DraftArticleDoc,
  commitId: string | undefined,
  sanityDocId: string,
  pgdb: PgDb,
): Promise<LegacyAudioLink> {
  if (!commitId) return { doc }

  // Never overwrite a real Sanity-native generation: audioContentHash is
  // only ever set there (see huebschWebhook.ts), never by this link.
  const { audioContentHash, audioSourceMp3: existingAudioSourceMp3 } =
    await fetchAudioLinkState(sanityDocId)
  if (audioContentHash) return { doc }

  const link = await pgdb.publikator.commitsWithSynthReadAloud.findOne({
    commitId,
  })
  if (!link) return { doc }

  const derivative = await pgdb.publikator.derivatives.findOne({
    id: link.derivativeId,
    status: 'Ready',
  })

  // Same guards as SyntheticReadAloud.processMeta's own, so this matches
  // exactly what old clients already see for this same commit.
  const { audioDuration, s3 } = derivative?.result ?? {}
  if (!audioDuration || !s3?.bucket || !s3?.key) return { doc }

  const durationMs = Math.round(1000 * audioDuration)
  const audioSourceMp3 = `${process.env.ASSETS_SERVER_BASE_URL}/s3/${s3.bucket}/${s3.key}`

  const linkedDoc = {
    ...doc,
    audioSourceMp3,
    audioDurationMs: durationMs,
    estimatedConsumptionMinutes: Math.round(durationMs / 60000),
  }

  // Already linked and unchanged — this handler reruns on essentially every
  // autosave-triggered commit sync (debounced to ~15s while someone is
  // editing), so without this guard the same legacy audio would grow a new
  // audioVersions entry on every single one of those syncs.
  if (audioSourceMp3 === existingAudioSourceMp3) return { doc: linkedDoc }

  return {
    doc: linkedDoc,
    newVersion: {
      audioSourceMp3,
      durationMs,
      // readyAt is when the synthesis actually finished -- closer to a real
      // "generatedAt" than the moment this sync happened to run.
      generatedAt: (derivative?.readyAt ?? new Date()).toISOString(),
    },
  }
}
