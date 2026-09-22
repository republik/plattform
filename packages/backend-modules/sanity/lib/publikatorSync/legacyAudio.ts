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
// users today, no auth) rather than downloading and re-uploading the file
// as a Sanity asset via uploadAudioAsset/recordAudioVersion -- that richer,
// versioned mechanism exists for the new Huebsch-generated-in-Sanity flow,
// and re-hosting files that the real cutover import (studio's transform.ts)
// already handles for historical content would be pure scope creep here.
import type { PgDb } from '@orbiting/backend-modules-types'
import { fetchAudioContentHash } from '../audio'
import type { DraftArticleDoc } from './articleDoc'

export async function linkLegacySyntheticAudio(
  doc: DraftArticleDoc,
  commitId: string | undefined,
  sanityDocId: string,
  pgdb: PgDb,
): Promise<DraftArticleDoc> {
  if (!commitId) return doc

  // Never overwrite a real Sanity-native generation: audioContentHash is
  // only ever set there (see huebschWebhook.ts), never by this link.
  const existingHash = await fetchAudioContentHash(sanityDocId)
  if (existingHash) return doc

  const link = await pgdb.publikator.commitsWithSynthReadAloud.findOne({
    commitId,
  })
  if (!link) return doc

  const derivative = await pgdb.publikator.derivatives.findOne({
    id: link.derivativeId,
    status: 'Ready',
  })

  // Same guards as SyntheticReadAloud.processMeta's own, so this matches
  // exactly what old clients already see for this same commit.
  const { audioDuration, s3 } = derivative?.result ?? {}
  if (!audioDuration || !s3?.bucket || !s3?.key) return doc

  const durationMs = Math.round(1000 * audioDuration)

  return {
    ...doc,
    audioSourceMp3: `${process.env.ASSETS_SERVER_BASE_URL}/s3/${s3.bucket}/${s3.key}`,
    audioDurationMs: durationMs,
    estimatedConsumptionMinutes: Math.round(durationMs / 60000),
  }
}
