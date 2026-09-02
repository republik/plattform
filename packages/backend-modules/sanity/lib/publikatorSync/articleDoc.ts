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

// meta.path is the member-facing route, e.g. "/2024/01/01/some-title" —
// Sanity's `slug.current` convention (see lib/document.ts / lib/audio.ts)
// stores it without the leading slash.
const toSlug = (path: unknown): { _type: 'slug'; current: string } | undefined =>
  typeof path === 'string' && path
    ? { _type: 'slug', current: path.replace(/^\//, '') }
    : undefined

export function buildDraftArticleDoc(commit: PublikatorCommit): DraftArticleDoc {
  const nodes = commit.content?.children ?? []
  const { title, description, byline } = extractTitleZoneData(nodes, true)
  const slug = toSlug(commit.meta?.path)

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
