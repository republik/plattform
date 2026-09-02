// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// Assembles a Sanity `article`-shaped document body from one publikator
// commit row (repos.publikator.commits: {content, meta, ...}). Deliberately
// narrow: only the article's own text (title/description/byline/body/slug),
// not articleCollections, teasers, or format/section wiring — see the
// "Scope decision" in the plan this module implements. That structural web
// is built once, correctly, by the real cutover migration
// (studio/import/publikator/src/transform.ts); duplicating it here would be
// a second, drifting implementation of a migration that's going away.
import {
  bodyChildren,
  extractTitleZoneData,
  mdastToPortableText,
} from './mdastToPortableText'

export interface PublikatorCommit {
  content: { children?: unknown[] }
  meta: Record<string, unknown>
}

export interface DraftArticleDoc {
  _type: 'article'
  title?: unknown[]
  description?: unknown[]
  byline?: unknown[]
  content: unknown[]
  slug?: { _type: 'slug'; current: string }
  publishDate?: string
}

// meta.slug — not meta.path — is the field to read here. meta.slug is
// what's actually present on every commit: either typed by the editor, or
// auto-derived from the title client-side when the editor's "autoSlug"
// toggle is on (apps/publikator/components/editor/modules/document/index.js:
// `newData.set('slug', slug(newData.get('title')))`). meta.path (the full
// dated member-facing route, e.g. "/2024/01/01/some-title") is a
// *different*, publish-time-only computation — publish.js's
// prepareMetaForPublish calls lib/Document.js's getPath(), which derives it
// from meta.slug + publishDate + template — and that result is only ever
// written to Elasticsearch, never back into the `publikator.commits` row
// this hook reads from. Reading meta.path here (an earlier version of this
// file did) meant the field was essentially always empty, silently
// dropping the slug — autoSlug included — from every synced article.
//
// getPath()'s own cleanup for a slug containing "/" (keep only the last
// segment) is mirrored here for the same reason: a manually-entered
// "custom/nested/slug" shouldn't produce a multi-segment Sanity slug.
const toSlug = (rawSlug: unknown): { _type: 'slug'; current: string } | undefined => {
  if (typeof rawSlug !== 'string') return undefined
  const lastSegment = rawSlug.includes('/')
    ? rawSlug.slice(rawSlug.lastIndexOf('/') + 1)
    : rawSlug
  const current = lastSegment.trim()
  return current ? { _type: 'slug', current } : undefined
}

export function buildDraftArticleDoc(commit: PublikatorCommit): DraftArticleDoc {
  const nodes = commit.content?.children ?? []
  const { title, description, byline } = extractTitleZoneData(nodes, true)
  const slug = toSlug(commit.meta?.slug)

  return {
    _type: 'article',
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(byline ? { byline } : {}),
    content: mdastToPortableText(bodyChildren(nodes), true),
    ...(slug ? { slug } : {}),
    ...(typeof commit.meta?.publishDate === 'string'
      ? { publishDate: commit.meta.publishDate }
      : {}),
  }
}
