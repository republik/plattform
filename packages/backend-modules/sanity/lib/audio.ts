import { logger } from '@orbiting/backend-modules-logger'
import { sanityClient } from './client'

// Portable text: a heterogeneous array of block/object nodes. The exact
// per-node shape is defined by studio's schema (a separate repo, no shared
// type package) — modeling it precisely here would drift the moment that
// schema changes without this repo knowing. `unknown[]` says "it's an array
// of *something*" honestly, rather than a stale, falsely-precise type.
export type PortableTextBlocks = unknown[]

export interface ArticleDoc {
  _id: string
  _rev: string
  title?: PortableTextBlocks
  description?: PortableTextBlocks
  byline?: PortableTextBlocks
  content?: PortableTextBlocks
  slug?: { current: string }
  syntheticVoice?: string
  suppressSyntheticReadAloud?: boolean
}

export const fetchArticle = (documentId: string) =>
  // `documentId` is very often a `drafts.*` id (the sync-audio Function fires
  // with includeDrafts: true so generation doesn't require publishing first).
  // The client's default query perspective excludes drafts entirely — a plain
  // fetch by _id silently returns null for one. `raw` matches the literal
  // document regardless of its publish state.
  sanityClient().fetch<ArticleDoc | null>(
    `*[_id == $id][0]{
      _id, _rev, title, description, byline, content, slug,
      syntheticVoice, suppressSyntheticReadAloud
    }`,
    { id: documentId },
    { perspective: 'raw' },
  )

export interface AudioVersionChapter {
  _key: string
  name: string
  at: number
}

export interface AudioVersion {
  file: { _type: 'file'; asset: { _type: 'reference'; _ref: string } }
  url: string
  durationMs?: number
  generatedAt: string
  // Only present when ENABLE_CHAPTER_MARKERS is on and Huebsch resolved
  // chapters for this generation.
  chapters?: AudioVersionChapter[]
}

// Sets the "current" audio fields (read by the frontend) and appends this
// generation to `audioVersions` (the full history, browsable/restorable in
// Studio) in the same commit, so the two never drift out of sync.
export const recordAudioVersion = (
  documentId: string,
  currentFields: Record<string, unknown>,
  version: AudioVersion,
) =>
  sanityClient()
    .patch(documentId)
    .set(currentFields)
    .setIfMissing({ audioVersions: [] })
    .append('audioVersions', [version])
    .commit({ autoGenerateArrayKeys: true })

export const uploadAudioAsset = (buffer: Buffer, filename: string) =>
  sanityClient().assets.upload('file', buffer, {
    filename,
    contentType: 'audio/mpeg',
  })

export const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e)

// Surfaces a failed generation (our own validation, the Huebsch request, or
// processing its callback) on the article itself, so an editor sees it in
// Studio instead of it only showing up in server logs.
export const reportAudioGenerationError = async (
  documentId: string,
  error: unknown,
) => {
  logger.error({ error }, `audio generation failed for ${documentId}`)
  try {
    await sanityClient()
      .patch(documentId)
      .set({
        audioGenerationResult: {
          status: 'error',
          updatedAt: new Date().toISOString(),
          error: errorMessage(error),
        },
      })
      .commit({ autoGenerateArrayKeys: true })
  } catch (e) {
    logger.error(
      { error: e },
      `failed to report audio generation error for ${documentId}`,
    )
  }
}

export const reportAudioGenerationSuccess = (documentId: string) =>
  sanityClient()
    .patch(documentId)
    .set({
      audioGenerationResult: {
        status: 'success',
        updatedAt: new Date().toISOString(),
      },
    })
    .commit({ autoGenerateArrayKeys: true })
