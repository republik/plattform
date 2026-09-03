import { Request, Response } from 'express'
import {
  fetchArticle,
  reportAudioGenerationSuccess,
  reportAudioGenerationError,
  errorMessage,
} from '../lib/audio'
import {
  buildSpeakableContent,
  plainText,
  plainTitle,
  hashSpeakableContent,
  buildSignedWebhookPath,
  uploadToHuebsch,
  titleSlugFrom,
  deriveSlug,
} from '../tts'
import { errorBody } from './respond'

// Handles the request sent by the studio repo's functions/sync-audio
// Blueprint Function: POST { documentId }.
//
// The response only confirms the request was valid and generation was
// *started*; the actual audio arrives later via the Huebsch webhook (see
// ./huebschWebhook). Any failure — here or later — is also written onto the
// article's audioGenerationResult field so it's visible in Studio, not just
// in server logs.

export const generateAudioHandler = async (req: Request, res: Response) => {
  const documentId = req.body?.documentId
  if (!documentId || typeof documentId !== 'string') {
    return res.status(400).json(errorBody('missing documentId'))
  }

  const article = await fetchArticle(documentId)
  if (!article) {
    return res.status(404).json(errorBody(`document ${documentId} not found`))
  }

  // sync-audio has its own copy of this same check and is meant to skip
  // calling this endpoint at all when content is unchanged — but that check
  // has proven unreliable in practice (a Blueprint Function redeploy isn't
  // always reflected the way a normal deploy is, and it's occasionally
  // missed a genuine match). Re-checking here means a request that shouldn't
  // have been sent still self-heals a wrong/stuck status instead of costing
  // a full Huebsch generation, regardless of what sync-audio decided.
  const contentHash = hashSpeakableContent(article)
  if (article.audioContentHash && article.audioContentHash === contentHash) {
    if (article.audioGenerationResult?.status !== 'success') {
      await reportAudioGenerationSuccess(documentId)
    }
    return res.json({ success: true, unchanged: true })
  }

  if (article.syntheticVoiceEnabled === false) {
    const message = 'synthetic voice is disabled for this document'
    await reportAudioGenerationError(documentId, message)
    return res.status(422).json(errorBody(message))
  }

  if (!article.syntheticVoice) {
    const message = 'no synthetic voice configured'
    await reportAudioGenerationError(documentId, message)
    return res.status(422).json(errorBody(message))
  }

  let speakableContent: unknown[]
  try {
    speakableContent = buildSpeakableContent(article, article.syntheticVoice, {
      chapterMarkers: process.env.ENABLE_CHAPTER_MARKERS === 'true',
    })
  } catch (e) {
    await reportAudioGenerationError(documentId, e)
    return res.status(422).json(errorBody(errorMessage(e)))
  }

  // A draft with no slug yet (e.g. an automatic-slug article, deliberately
  // left empty until it's actually published — see studio's
  // sharedFields.ts) has nothing to offer here, but Huebsch's intake API
  // requires attrs.slug regardless (omitting it, tried first, got a
  // "Required" validation error back). So derive the same preview a
  // publish would eventually freeze — title (+ Spitzmarke heading segment,
  // per its template) date-prefixed and slugified, matching
  // slug-freeze-publish's own algorithm (see tts/lib/deriveSlug.ts for why
  // this isn't byte-identical, and why that's fine: this is only ever a
  // preview, corrected for real at actual publish time). Only as a last
  // resort — a title-less article, deriving nothing usable — fall back to
  // a sanitized id, same as titleSlugFrom's own fallback below.
  const titleText = plainTitle(article.title)
  const slug =
    article.slug?.current ??
    deriveSlug(titleText, article.publishDate, new Date(), article.heading) ??
    `/${titleSlugFrom(undefined, article._id)}`
  const titleSlug = titleSlugFrom(slug, article._id)
  const publicUrl = process.env.PUBLIC_URL
  if (!publicUrl) {
    // Routed the same way as every other failure in this handler, so it shows
    // up on the article in Studio rather than only as an unhandled rejection.
    const message = 'PUBLIC_URL is not set'
    await reportAudioGenerationError(documentId, message)
    return res.status(500).json(errorBody(message))
  }
  const webhookUrl = `${publicUrl}${buildSignedWebhookPath(
    article._id,
    titleSlug,
    contentHash,
  )}`
  const description = plainText(article.description)
  const source = article.slug?.current
    ? `https://www.republik.ch${article.slug.current}`
    : undefined

  // fire-and-forget: Huebsch reports back asynchronously via the webhook above
  uploadToHuebsch(
    speakableContent,
    article._id,
    slug,
    plainTitle(article.title),
    webhookUrl,
    { description, source },
  ).catch(async (e: unknown) => {
    await reportAudioGenerationError(article._id, e)
  })

  return res.json({ success: true })
}
