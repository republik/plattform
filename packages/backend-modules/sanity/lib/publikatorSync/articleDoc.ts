// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// Assembles a Sanity `article`-shaped document body from one publikator
// commit row (repos.publikator.commits: {content, meta, ...}). Deliberately
// narrow: only what's derivable from THIS commit's own data (title/
// description/byline/body/slug/cover/heading/teaserSmall.image) — not
// articleCollections, cross-repo carousel/series teaser overrides, or
// section wiring — see the "Scope decision" in the plan this module
// implements. That structural web (which formats/sections a document is
// teased in elsewhere) is built once, correctly, by the real cutover
// migration (studio/import/publikator/src/transform.ts); duplicating it here
// would be a second, drifting implementation of a migration that's going
// away. `heading` and `teaserSmall.image` are the exception: both resolve
// from data this hook already has (meta.format) or can cheaply look up
// (the format's own already-published commit, see ./formatTeaserImage.ts),
// not from a cross-dump pre-scan.
import {
  assetRef,
  bodyChildren,
  extractTitleZoneData,
  mdastToPortableText,
} from './mdastToPortableText'
import { normalizeGithubPath, repoIdToPageId } from '../legacyId'

export interface PublikatorCommit {
  // Optional: buildDraftArticleDoc itself never reads it, only worker.ts's
  // legacy-audio linking step does (see ./legacyAudio.ts) -- kept optional
  // here rather than widening every test fixture that builds a commit
  // object without one.
  id?: string
  // The `publikator.commits.repoId` column. Needed to resolve a relative
  // `images/<hash>.ext` asset path (the common case for anything uploaded
  // through the Publikator editor) into an absolute, fetchable URL — see
  // mdastToPortableText.ts#resolveRepoImagePath. Optional for the same
  // reason as `id`: real rows always have it, test fixtures don't need to.
  repoId?: string
  content: { children?: unknown[] }
  meta: Record<string, unknown>
}

export interface DraftArticleDoc {
  _type: 'article'
  title?: unknown[]
  description?: unknown[]
  byline?: unknown[]
  // The article's format connection ("Spitzmarke" in the Studio schema) — a
  // weak reference to the format's migrated `page` document, derived
  // deterministically from meta.format (see repoIdToPageId). Weak, and left
  // unset when meta.format is missing/invalid, so a format not yet migrated
  // by the batch import just leaves this field empty rather than pointing at
  // a page that doesn't exist yet.
  heading?: { _type: 'reference'; _ref: string; _weak: true }
  content: unknown[]
  slug?: { _type: 'slug'; current: string }
  slugAuto: boolean
  publishDate?: string
  // The article's own hero image (root-level FIGURE zone before TITLE),
  // still holding an unresolved `_sanityAsset` marker at this point —
  // resolveAssetMarkers() turns it into a real asset reference before write.
  cover?: unknown
  // The compact/small teaser image ("Kompakter Teaser" in Studio). Set here
  // from the article's own meta.image; filled in from the linked format's
  // own published image instead when the article has none — see
  // ./formatTeaserImage.ts, applied by the worker after this doc is built.
  teaserSmall?: { _type: 'teaserSmallConfig'; image?: unknown }
  // Linked (not generated) from a legacy Publikator SyntheticReadAloud
  // derivative — see ./legacyAudio.ts.
  audioSourceMp3?: string
  audioDurationMs?: number
  estimatedConsumptionMinutes?: number
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
function resolveSlug(
  meta: Record<string, unknown> | undefined,
  effectivePublishDate: string | undefined,
): {
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
    rawSlug.includes('/')
      ? rawSlug.slice(rawSlug.lastIndexOf('/') + 1)
      : rawSlug
  ).trim()
  if (!segment) return { slugAuto: false }

  const datePart = formatSlugDate(effectivePublishDate)
  const current = `/${[datePart, segment].filter(Boolean).join('/')}`
  return { slugAuto: false, slug: { _type: 'slug', current } }
}

// getPath()'s date segment, for the templates this hook ever syncs
// (format/section/page/front are excluded entirely by eligibility.ts, so
// their "no date prefix" branch in getPath() never applies here). Falls
// back to today when no publish/scheduled date is known yet at all — a
// preview, same caveat Sanity's own native auto-derivation carries for an
// in-progress draft, not a promise of the eventual real path.
function formatSlugDate(effectivePublishDate: string | undefined): string {
  const parsed = effectivePublishDate ? new Date(effectivePublishDate) : null
  const date = parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date()
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yyyy}/${mm}/${dd}`
}

// The planned/actual publication date. repoMeta.publishDate — not
// commit.meta.publishDate — is the field to read: publish.js's
// prepareMetaForPublish computes the effective date (the scheduled time for
// a scheduled publish, "now" for an immediate one) and persists it via
// updateRepo() onto the *repo* record the moment a publish is set up —
// before this hook's own publish sync ever runs (immediate) or well before
// the scheduled time arrives (scheduled). commit.meta.publishDate, like
// commit.meta.path, is never written back into the raw commits row this
// hook otherwise reads from, so it's only a fallback for the rare case
// where an editor typed a publishDate directly into the document meta.
function resolvePublishDate(
  commit: PublikatorCommit,
  repoMeta: Record<string, unknown> | undefined,
): string | undefined {
  if (typeof repoMeta?.publishDate === 'string') return repoMeta.publishDate
  if (typeof commit.meta?.publishDate === 'string')
    return commit.meta.publishDate
  return undefined
}

// Matches transform.ts#isGithubRepublikUrl: accepts a full GitHub URL
// (`github.com/republik/...`) or the bare `republik/<repo>` shorthand some
// meta.format values use. Anything else (a foreign/malformed value) is
// ignored rather than fed into normalizeGithubPath, which would throw.
function isGithubRepublikUrl(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    (value.includes('github.com/republik/') || /^republik\//.test(value))
  )
}

// The article's format repo id (meta.format), when present and
// well-formed — shared by the `heading` reference below and by the
// teaser-image format fallback the worker applies afterwards.
export function resolveFormatRepoId(
  meta: Record<string, unknown> | undefined,
): string | undefined {
  const format = meta?.format
  if (!isGithubRepublikUrl(format)) return undefined
  try {
    return normalizeGithubPath(format)
  } catch {
    return undefined
  }
}

export function buildDraftArticleDoc(
  commit: PublikatorCommit,
  repoMeta?: Record<string, unknown>,
): DraftArticleDoc {
  const nodes = commit.content?.children ?? []
  const { title, description, byline, cover } = extractTitleZoneData(
    nodes,
    true,
    commit.repoId,
  )
  const publishDate = resolvePublishDate(commit, repoMeta)
  const { slugAuto, slug } = resolveSlug(commit.meta, publishDate)
  const formatRepoId = resolveFormatRepoId(commit.meta)
  const image = assetRef(
    typeof commit.meta?.image === 'string' ? commit.meta.image : undefined,
    commit.repoId,
  )

  return {
    _type: 'article',
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(byline ? { byline } : {}),
    ...(formatRepoId
      ? {
          heading: {
            _type: 'reference',
            _ref: repoIdToPageId(formatRepoId),
            _weak: true,
          },
        }
      : {}),
    content: mdastToPortableText(
      bodyChildren(nodes),
      true,
      undefined,
      undefined,
      commit.repoId,
    ),
    slugAuto,
    ...(slug ? { slug } : {}),
    ...(publishDate ? { publishDate } : {}),
    ...(cover ? { cover } : {}),
    ...(image
      ? {
          teaserSmall: {
            _type: 'teaserSmallConfig',
            image: { _type: 'image', _sanityAsset: image },
          },
        }
      : {}),
  }
}
