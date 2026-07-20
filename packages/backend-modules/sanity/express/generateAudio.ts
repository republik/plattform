import { Request, Response } from 'express'
import {
  fetchArticle,
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
} from '../tts'

// Handles the request sent by the studio repo's functions/sync-audio
// Blueprint Function: POST { documentId }.
//
// The response only confirms the request was valid and generation was
// *started*; the actual audio arrives later via the Huebsch webhook (see
// ./huebschWebhook). Any failure — here or later — is also written onto the
// article's audioGenerationResult field so it's visible in Studio, not just
// in server logs.

const error = (message: string) => ({ success: false, error: message })

export const generateAudioHandler = async (req: Request, res: Response) => {
  const documentId = req.body?.documentId
  if (!documentId || typeof documentId !== 'string') {
    return res.status(400).json(error('missing documentId'))
  }

  const article = await fetchArticle(documentId)
  if (!article) {
    return res.status(404).json(error(`document ${documentId} not found`))
  }

  if (article.suppressSyntheticReadAloud) {
    const message = 'synthetic read aloud is suppressed for this document'
    await reportAudioGenerationError(documentId, message)
    return res.status(422).json(error(message))
  }

  if (!article.syntheticVoice) {
    const message = 'no synthetic voice configured'
    await reportAudioGenerationError(documentId, message)
    return res.status(422).json(error(message))
  }

  let speakableContent: unknown[]
  try {
    speakableContent = buildSpeakableContent(article, article.syntheticVoice, {
      chapterMarkers: process.env.ENABLE_CHAPTER_MARKERS === 'true',
    })
  } catch (e) {
    await reportAudioGenerationError(documentId, e)
    return res.status(422).json(error(errorMessage(e)))
  }

  const slug = article.slug?.current ?? article._id
  const titleSlug = titleSlugFrom(article.slug?.current, article._id)
  // Fingerprints exactly the content this request is about to speak, so the
  // webhook can later persist it as audioContentHash — only once generation
  // is confirmed to have actually succeeded.
  const contentHash = hashSpeakableContent(article)
  const publicUrl = process.env.PUBLIC_URL
  if (!publicUrl) throw new Error('PUBLIC_URL is not set')
  const webhookUrl = `${publicUrl}${buildSignedWebhookPath(article._id, titleSlug, contentHash)}`
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
  ).catch((e: unknown) => {
    reportAudioGenerationError(article._id, e)
  })

  return res.json({ success: true })
}
