import { Request, Response } from 'express'
// Importing this brings pino-http's global Express Request.log
// augmentation into scope for this module's compilation.
import type {} from '@orbiting/backend-modules-logger'
import {
  fetchAudioContentHash,
  fetchPendingVersionKey,
  markPendingVersionError,
  recordAudioVersion,
  reportAudioGenerationError,
  reportAudioGenerationSuccess,
  uploadAudioAsset,
} from '../lib/audio'
import {
  compactTimestamp,
  titleSlugFrom,
  parseHuebschResult,
  verifyWebhookSignature,
  mirrorToS3,
} from '../tts'

export const huebschWebhookHandler = async (req: Request, res: Response) => {
  const documentId = req.params.documentId
  const expires = req.query.expires as string | undefined
  const titleSlugParam = req.query.titleSlug as string | undefined
  const contentHash = req.query.contentHash as string | undefined
  const signature = req.query.signature as string | undefined

  if (
    !documentId ||
    !expires ||
    !titleSlugParam ||
    !contentHash ||
    !signature ||
    !verifyWebhookSignature(
      documentId,
      expires,
      titleSlugParam,
      contentHash,
      signature,
    )
  ) {
    return res.status(403).send('forbidden')
  }

  const body = req.body
  if (!body) {
    await reportAudioGenerationError(
      documentId,
      'received an empty or invalid webhook payload from Huebsch',
    )
    return res.status(400).send('bad request')
  }

  const titleSlug = titleSlugFrom(titleSlugParam, documentId)

  // ack immediately, process in the background — mirrors the old service's
  // res.sendStatus(204) + await publish() split, so Huebsch doesn't have to
  // wait on our Sanity/S3 round trips.
  processResult(req, documentId, titleSlug, contentHash, body).catch(
    async (e: unknown) => {
      await reportAudioGenerationError(documentId, e)
    },
  )

  return res.status(204).end()
}

// Exported for direct unit testing — in particular the idempotency check at
// the top, which the handler above never awaits (it's fire-and-forget), so
// exercising it through the handler would mean racing a background promise.
export const processResult = async (
  req: Request,
  documentId: string,
  titleSlug: string,
  contentHash: string,
  body: unknown,
) => {
  // Idempotency: a webhook provider retrying a delivery (at-least-once
  // semantics, or just not seeing our 204 fast enough) resends the exact
  // same signed request — nothing here would otherwise notice, and
  // recordAudioVersion has no dedup of its own, so each delivery would
  // append its own "new" audio version for what is actually one generation.
  // If this contentHash is already recorded, a previous delivery already
  // handled this result — skip before doing any of the (wasteful) work
  // below.
  const existingHash = await fetchAudioContentHash(documentId)
  if (existingHash === contentHash) {
    req.log.info(
      { documentId, contentHash },
      'huebsch webhook: already recorded this generation, skipping duplicate delivery',
    )
    return
  }

  // Identifies the "pending" placeholder claimAudioGeneration inserted for
  // this exact content hash, so the finished entry below can replace it in
  // place instead of being appended alongside it. undefined when no such
  // placeholder exists (a generation kicked off before this mechanism
  // existed, or one whose placeholder was already marked as an error) —
  // recordAudioVersion falls back to appending in that case.
  const pendingKey = await fetchPendingVersionKey(documentId, contentHash)

  // Huebsch reporting a failed generation (parseHuebschResult throws on
  // `{ ok: false }`), or anything failing between here and recording the
  // result, means this specific attempt didn't produce audio — mark its
  // placeholder as failed (so it's identifiable in the history, not just
  // silently stuck looking "pending") in addition to the general status.
  // This function owns reporting its own failures fully and does not
  // rethrow; the fire-and-forget caller's own .catch() is a last-resort
  // safety net for a bug in this handling itself, not the normal path.
  try {
    const { audioFile, chapters, durationMs } = await parseHuebschResult(body)
    const buffer = Buffer.from(audioFile)
    const generatedAt = new Date().toISOString()
    const filename = `${titleSlug}-${compactTimestamp(generatedAt)}.mp3`

    const asset = await uploadAudioAsset(buffer, filename)

    // only present when ENABLE_CHAPTER_MARKERS requested marker nodes and
    // Huebsch resolved them back into timestamps.
    const keyedChapters = chapters?.map(
      (chapter: { name: string; at: number }, index: number) => ({
        _key: `chapter-${index}`,
        name: chapter.name,
        at: chapter.at,
      }),
    )

    // every generation is kept (never overwritten) so an editor can browse or
    // restore an older version later. audioContentHash is only written here,
    // on confirmed success — never optimistically when generation merely
    // starts — so a request that fails after this point can't be mistaken for
    // one that succeeded and get silently skipped on the next attempt.
    await recordAudioVersion(
      documentId,
      {
        audioSourceMp3: asset.url,
        audioContentHash: contentHash,
        ...(durationMs && {
          audioDurationMs: durationMs,
          estimatedConsumptionMinutes: Math.round(durationMs / 60000),
        }),
      },
      {
        file: { _type: 'file', asset: { _type: 'reference', _ref: asset._id } },
        url: asset.url,
        durationMs,
        generatedAt,
        ...(keyedChapters?.length && { chapters: keyedChapters }),
      },
      pendingKey,
    )

    // A failed S3 mirror is an internal backup-copy concern, not something
    // that should surface as a failed generation on the Sanity document —
    // the audio itself (the asset of record) is already saved at this point.
    try {
      await mirrorToS3(documentId, buffer)
    } catch (e) {
      req.log.error({ error: e }, `S3 mirror failed for ${documentId}`)
    }

    await reportAudioGenerationSuccess(documentId)
  } catch (e) {
    await markPendingVersionError(documentId, contentHash, e)
    await reportAudioGenerationError(documentId, e)
  }
}
