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
  slugAuto: boolean
  publishDate?: string
}

// Sanity's article schema has its own, near-identical automatic/manual slug
// system (workspaces/newsroom/schema/article/sharedFields.ts in studio):
// `slugAuto: boolean` plus a `slug` that is *deliberately left empty* while
// automatic — Sanity's own publish action derives `/yyyy/MM/dd/titel` from
// title + publishDate at that point (shared/slug/deriveSlug.ts), the same
// shape Publikator's own getPath() produces. That comment is explicit about
// this: "Every path that creates an article must set [slugAuto] true —
// initialValue covers the Studio form, but NOT raw client.create ... A new
// creation path that forgets this silently opts the article out of
// automatic slugs." This hook is exactly such a path, via createOrReplace,
// so slugAuto is always set below, never left to its schema default.
//
// Publikator's own meta.autoSlug (apps/publikator/components/editor/
// modules/document/index.js) defaults to true (documentTemplate.js) and,
// when on, auto-derives meta.slug from the title client-side the same way.
// So: autoSlug on → mirror Sanity's own "automatic" state (slugAuto: true,
// no slug value — let Sanity derive it at its own publish time, no need to
// replicate Publikator's derivation here). autoSlug off → the editor chose
// a specific address; pass it through as a manual slug, date-prefixed the
// same way lib/Document.js's getPath() would (Publikator applies that
// prefix regardless of auto/manual — only the segment's source differs).
//
// meta.slug — not meta.path — is the field to read for the segment itself.
// meta.path (the full dated route) is a *different*, publish-time-only
// computation (publish.js's prepareMetaForPublish → getPath()) that's
// written to Elasticsearch only, never back into the `publikator.commits`
// row this hook reads from — reading it here would find it essentially
// always empty.
function resolveSlug(meta: Record<string, unknown> | undefined): {
  slugAuto: boolean
  slug?: { _type: 'slug'; current: string }
} {
  const slugAuto = meta?.autoSlug !== false
  if (slugAuto) return { slugAuto: true }

  const rawSlug = typeof meta?.slug === 'string' ? meta.slug : undefined
  if (!rawSlug) return { slugAuto: false }

  // getPath()'s own cleanup for a slug containing "/" (keep only the last
  // segment) — a manually-entered "custom/nested/slug" shouldn't produce a
  // multi-segment path.
  const segment = (
    rawSlug.includes('/') ? rawSlug.slice(rawSlug.lastIndexOf('/') + 1) : rawSlug
  ).trim()
  if (!segment) return { slugAuto: false }

  const datePart = formatSlugDate(meta?.publishDate)
  const current = `/${[datePart, segment].filter(Boolean).join('/')}`
  return { slugAuto: false, slug: { _type: 'slug', current } }
}

// getPath()'s date segment, for the templates this hook ever syncs
// (format/section/page/front are excluded entirely by eligibility.ts, so
// their "no date prefix" branch in getPath() never applies here). Falls
// back to today when meta.publishDate isn't set yet (a not-yet-scheduled
// draft) — a preview, same caveat Sanity's own native auto-derivation
// carries for an in-progress draft, not a promise of the eventual real path.
function formatSlugDate(publishDate: unknown): string {
  const parsed = typeof publishDate === 'string' ? new Date(publishDate) : null
  const date = parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date()
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yyyy}/${mm}/${dd}`
}

export function buildDraftArticleDoc(commit: PublikatorCommit): DraftArticleDoc {
  const nodes = commit.content?.children ?? []
  const { title, description, byline } = extractTitleZoneData(nodes, true)
  const { slugAuto, slug } = resolveSlug(commit.meta)

  return {
    _type: 'article',
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(byline ? { byline } : {}),
    content: mdastToPortableText(bodyChildren(nodes), true),
    slugAuto,
    ...(slug ? { slug } : {}),
    ...(typeof commit.meta?.publishDate === 'string'
      ? { publishDate: commit.meta.publishDate }
      : {}),
  }
}
