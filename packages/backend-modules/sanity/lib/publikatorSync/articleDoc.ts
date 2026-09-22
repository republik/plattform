// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// Assembles a Sanity `article`-shaped document body from one publikator
// commit row (repos.publikator.commits: {content, meta, ...}). Deliberately
// narrow: only what's derivable from THIS commit's own data, plus — for
// heading/articleCollections/theme/seo/teaserSmall.image/newsletter/podcast —
// one targeted Postgres lookup of the article's FORMAT's own already-
// published commit (see ./formatFields.ts). Not covered: cross-repo
// carousel/series teaser overrides, series-episode collections, or a
// section's own accent-colour fallback (a second lookup hop beyond the
// format) — see the "Scope decision" in the plan this module implements.
// That richer structural web is built once, correctly, by the real cutover
// migration (studio/import/publikator/src/transform.ts); duplicating it here
// would be a second, drifting implementation of a migration that's going
// away. Everything else here mirrors transform.ts's own logic closely
// (cited inline) precisely because a format/section must already be
// published before an article can reference it, so its id — and, via one
// lookup, its own meta — is always resolvable right now, deterministically,
// with no cross-dump pre-scan needed.
import {
  assetRef,
  bodyChildren,
  extractTitleZoneData,
  inlineEditorFromString,
  mdastToPortableText,
  multilineEditorFromString,
} from './mdastToPortableText'
import {
  repoIdToNewsletterId,
  repoIdToPageId,
  repoIdToPodcastId,
  repoIdToSanityId,
  resolveRepublikRepoId,
} from '../legacyId'
import { hexToSanityColor } from './color'
import type { SignOff } from './editorialSignOffs'
import type { FormatFields } from './formatFields'

// transform.ts:1035 — sections whose articles get the META theme regardless
// of their format's own `kind`.
const META_SECTION_REPOS = new Set([
  'republik/section-meta',
  'republik/section-die-newsletter',
  'republik/section-dialog',
])

// transform.ts:1030 — the hardcoded "read aloud" collection every
// audioSourceKind: "readAloud" article gets added to.
const VORGELESEN_FORMAT_REPO = 'republik/format-vorgelesen'

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

type SanityImage = { _type: 'image'; _sanityAsset: string }

export interface ArticleCollectionEntry {
  _key: string
  _type: 'articleCollectionEntry'
  collection: { _type: 'reference'; _ref: string }
  featured?: true
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
  // "Von der Redaktion empfohlen" — weak refs to other article/page docs,
  // resolved from meta.recommendations (an array of repoId links, same shape
  // as meta.format). Capped at 5 to match the schema's own rule.max(5)
  // (sharedFields.ts) — real editorial data never approaches that anyway.
  articleRecommendations?: {
    _type: 'reference'
    _ref: string
    _weak: true
  }[]
  // The format's own articleCollection (featured), the format's section's
  // (not featured), and/or the hardcoded "Vorgelesen" collection — all
  // STRONG references (unlike `heading`), matching the schema
  // (sharedFields.ts's articleCollectionEntry marks `collection` required,
  // not weak) and transform.ts's own repoRef() usage. Left unset (not an
  // empty array) when none apply.
  articleCollections?: ArticleCollectionEntry[]
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
  // ./formatFields.ts, applied by the worker after this doc is built.
  teaserSmall?: { _type: 'teaserSmallConfig'; image?: SanityImage }
  // Always present, matching transform.ts's buildTheme(), which never
  // returns undefined. `name` starts at EDITORIAL/EDITORIAL_CENTERED (own
  // commit only) and may be upgraded to META once the format lookup
  // resolves; `accentColor` prefers the article's own colour, else the
  // format's.
  theme: {
    _type: 'theme'
    name: 'EDITORIAL' | 'EDITORIAL_CENTERED' | 'META'
    accentColor?: Record<string, unknown>
    darkMode?: true
  }
  // Social-media share card. Own seoTitle/seoDescription/facebookImage/
  // twitterImage/share* fields, with shareBackgroundImage/shareLogo falling
  // back to the format's own (see ./formatFields.ts) — matching
  // transform.ts's seo/imageBuilder construction. Left unset when nothing
  // ends up present, same as transform.ts.
  seo?: {
    _type: 'seo'
    title?: unknown[]
    description?: unknown[]
    image?: SanityImage
    useImageBuilder?: true
    imageBuilder?: {
      _type: 'seoImageBuilder'
      text?: unknown[]
      fontSize?: number
      textPosition?: string
      inverted?: true
      backgroundImage?: SanityImage
      logo?: SanityImage
      layout?: 'BACKGROUND_IMAGE' | 'LOGO'
    }
  }
  showInFeed?: boolean
  readingAccess: 'OPEN' | 'PAYNOTE' | 'REGWALL'
  showTextProgress: boolean
  pushNotificationText?: unknown[]
  emailSubject?: unknown[]
  // Strong references to the format's migrated `newsletter`/`podcast`
  // document, set once the format lookup confirms the format actually has
  // one (see ./formatFields.ts) — transform.ts's own newsletterFormatIds/
  // podcastFormatIds gate, just resolved per-format instead of corpus-wide.
  newsletter?: { _type: 'reference'; _ref: string }
  podcast?: { _type: 'reference'; _ref: string }
  // Linked (not generated) from a legacy Publikator SyntheticReadAloud
  // derivative — see ./legacyAudio.ts.
  audioSourceMp3?: string
  audioDurationMs?: number
  estimatedConsumptionMinutes?: number
  // The editorial checklist, mirrored from Publikator's milestones — set by
  // worker.ts after this doc is built (see ./editorialSignOffs.ts), same as
  // teaserSmall.image/newsletter/podcast are filled in post-hoc by
  // resolveFormatDerivedFields.
  editorialSignOffs?: SignOff[]
}

function optStr(val: unknown): string | undefined {
  return typeof val === 'string' && val ? val : undefined
}

function optBool(val: unknown): boolean | undefined {
  return typeof val === 'boolean' ? val : undefined
}

function optNum(val: unknown): number | undefined {
  return typeof val === 'number' ? val : undefined
}

// The plain `{_type:'image', _sanityAsset}` shape shared by teaserSmall.image
// and every seo image field (as opposed to `cover`'s richer `editorialImage`
// type, built separately by extractTitleZoneData/extractEditorialImage).
// `repoId` is whichever repo the URL is relative to — the article's own for
// its own images, the format's for a format-inherited fallback.
function buildImage(
  url: string | undefined,
  repoId: string | undefined,
): SanityImage | undefined {
  const marker = assetRef(url, repoId)
  return marker ? { _type: 'image', _sanityAsset: marker } : undefined
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

// The article's format repo id (meta.format), when present and
// well-formed — shared by `heading`, `articleCollections`, `theme`/`seo`'s
// format fallback, and `newsletter`/`podcast`.
export function resolveFormatRepoId(
  meta: Record<string, unknown> | undefined,
): string | undefined {
  return resolveRepublikRepoId(meta?.format)
}

// meta.recommendations ("Von der Redaktion empfohlen") — same link shape as
// meta.format (Meta.js's resolveRecommendations resolves each entry the same
// way), just an array instead of a single repo. Invalid/foreign entries are
// dropped rather than failing the whole list, matching resolveRepublikRepoId's
// own permissive-fallback style. Capped at 5, matching the schema's own
// rule.max(5) (sharedFields.ts) — Sanity's write API doesn't enforce that
// itself, but there's no reason to write a doc that already fails its own
// schema's validation.
function buildArticleRecommendations(
  meta: Record<string, unknown>,
): DraftArticleDoc['articleRecommendations'] {
  const raw = meta.recommendations
  if (!Array.isArray(raw)) return undefined
  const refs = raw
    .map((entry) => resolveRepublikRepoId(entry))
    .filter((repoId): repoId is string => Boolean(repoId))
    .map((repoId) => ({
      _type: 'reference' as const,
      _ref: repoIdToSanityId(repoId),
      _weak: true as const,
    }))
  return refs.length ? refs.slice(0, 5) : undefined
}

// transform.ts:742-753 (buildTheme), minus the format/section-derived parts
// (kind override, colour fallback) — those are applied afterwards, once the
// format lookup resolves, by applyFormatTheme.
export function buildTheme(
  meta: Record<string, unknown>,
  centered: boolean | undefined,
): DraftArticleDoc['theme'] {
  const ownColorHex = optStr(meta.color)
  const darkMode = meta.darkMode === true
  return {
    _type: 'theme',
    name: centered ? 'EDITORIAL_CENTERED' : 'EDITORIAL',
    ...(ownColorHex ? { accentColor: hexToSanityColor(ownColorHex) } : {}),
    ...(darkMode ? { darkMode: true } : {}),
  }
}

// transform.ts:2678-2684's META-kind/META_SECTION_REPOS check and the
// format-colour fallback, applied on top of the base theme buildTheme()
// already produced from the article's own commit.
export function applyFormatTheme(
  theme: DraftArticleDoc['theme'],
  formatFields: FormatFields,
): DraftArticleDoc['theme'] {
  const isMeta =
    formatFields.kind === 'meta' ||
    (!!formatFields.sectionRepoId &&
      META_SECTION_REPOS.has(formatFields.sectionRepoId))
  return {
    ...theme,
    ...(isMeta ? { name: 'META' as const } : {}),
    ...(!theme.accentColor && formatFields.color
      ? { accentColor: hexToSanityColor(formatFields.color) }
      : {}),
  }
}

// transform.ts:2573-2629 (seo/imageBuilder construction). `repoId` resolves
// the article's own image fields; `formatRepoId` resolves the format's own
// shareBackgroundImage/shareLogo when used as a fallback — a relative
// `images/...` path is only meaningful relative to whichever repo actually
// owns the file.
export function buildSeo(
  meta: Record<string, unknown>,
  repoId: string | undefined,
  formatRepoId?: string,
  formatFields?: FormatFields,
): DraftArticleDoc['seo'] {
  const seoTitle = optStr(meta.seoTitle) ?? optStr(meta.facebookTitle)
  const seoDescription =
    optStr(meta.seoDescription) ?? optStr(meta.facebookDescription)
  const seoImage = buildImage(
    optStr(meta.facebookImage) ?? optStr(meta.twitterImage),
    repoId,
  )

  const ownShareBackgroundImage = optStr(meta.shareBackgroundImage)
  const shareBackgroundImage = ownShareBackgroundImage
    ? buildImage(ownShareBackgroundImage, repoId)
    : formatFields?.shareBackgroundImage
      ? buildImage(formatFields.shareBackgroundImage, formatRepoId)
      : undefined

  const ownShareLogo = optStr(meta.shareLogo)
  const shareLogo = ownShareLogo
    ? buildImage(ownShareLogo, repoId)
    : formatFields?.shareLogo
      ? buildImage(formatFields.shareLogo, formatRepoId)
      : undefined

  const shareText = optStr(meta.shareText)
  const shareFontSize = optNum(meta.shareFontSize)
  const shareTextPosition = optStr(meta.shareTextPosition)

  const imageBuilder: NonNullable<
    NonNullable<DraftArticleDoc['seo']>['imageBuilder']
  > = {
    _type: 'seoImageBuilder',
    ...(shareText ? { text: multilineEditorFromString(shareText) } : {}),
    ...(shareFontSize !== undefined ? { fontSize: shareFontSize } : {}),
    ...(shareTextPosition ? { textPosition: shareTextPosition } : {}),
    ...(meta.shareInverted === true ? { inverted: true } : {}),
  }
  // a background image wins over a logo when both are present
  if (shareBackgroundImage) {
    imageBuilder.backgroundImage = shareBackgroundImage
    imageBuilder.layout = 'BACKGROUND_IMAGE'
  } else if (shareLogo) {
    imageBuilder.logo = shareLogo
    imageBuilder.layout = 'LOGO'
  }
  const useImageBuilder =
    Object.keys(imageBuilder).length > 1 /* more than just _type */

  if (!seoTitle && !seoDescription && !seoImage && !useImageBuilder) {
    return undefined
  }

  return {
    _type: 'seo',
    ...(seoTitle ? { title: inlineEditorFromString(seoTitle) } : {}),
    ...(seoDescription
      ? { description: inlineEditorFromString(seoDescription) }
      : {}),
    ...(seoImage ? { image: seoImage } : {}),
    ...(useImageBuilder ? { useImageBuilder: true, imageBuilder } : {}),
  }
}

// transform.ts:2708-2727 minus series-episode collections (cross-repo,
// needs the batch migration's pre-scan): the format's own collection
// (featured) plus, when the article is a synthesized read-aloud, the
// hardcoded "Vorgelesen" collection. The format's SECTION collection is
// appended afterwards by appendSectionCollection, once the format lookup
// resolves.
function buildArticleCollections(
  meta: Record<string, unknown>,
  formatRepoId: string | undefined,
): ArticleCollectionEntry[] | undefined {
  const entries: ArticleCollectionEntry[] = []

  if (formatRepoId) {
    entries.push({
      _key: crypto.randomUUID(),
      _type: 'articleCollectionEntry',
      collection: { _type: 'reference', _ref: repoIdToSanityId(formatRepoId) },
      featured: true,
    })
  }

  if (meta.audioSourceKind === 'readAloud') {
    const vorgelesenRef = repoIdToSanityId(VORGELESEN_FORMAT_REPO)
    if (!entries.some((e) => e.collection._ref === vorgelesenRef)) {
      entries.push({
        _key: crypto.randomUUID(),
        _type: 'articleCollectionEntry',
        collection: { _type: 'reference', _ref: vorgelesenRef },
      })
    }
  }

  return entries.length > 0 ? entries : undefined
}

function appendSectionCollection(
  entries: ArticleCollectionEntry[] | undefined,
  formatFields: FormatFields,
): ArticleCollectionEntry[] | undefined {
  if (!formatFields.sectionRepoId) return entries
  const sectionRef = repoIdToSanityId(formatFields.sectionRepoId)
  const current = entries ?? []
  if (current.some((e) => e.collection._ref === sectionRef)) return entries
  return [
    ...current,
    {
      _key: crypto.randomUUID(),
      _type: 'articleCollectionEntry',
      collection: { _type: 'reference', _ref: sectionRef },
    },
  ]
}

export function buildDraftArticleDoc(
  commit: PublikatorCommit,
  repoMeta?: Record<string, unknown>,
): DraftArticleDoc {
  const nodes = commit.content?.children ?? []
  const { title, description, byline, cover, centered } = extractTitleZoneData(
    nodes,
    true,
    commit.repoId,
  )
  const publishDate = resolvePublishDate(commit, repoMeta)
  const { slugAuto, slug } = resolveSlug(commit.meta, publishDate)
  const formatRepoId = resolveFormatRepoId(commit.meta)
  const image = buildImage(
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
    ...(() => {
      const articleCollections = buildArticleCollections(
        commit.meta,
        formatRepoId,
      )
      return articleCollections ? { articleCollections } : {}
    })(),
    ...(() => {
      const articleRecommendations = buildArticleRecommendations(commit.meta)
      return articleRecommendations ? { articleRecommendations } : {}
    })(),
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
      ? { teaserSmall: { _type: 'teaserSmallConfig', image } }
      : {}),
    theme: buildTheme(commit.meta, centered),
    ...(() => {
      const seo = buildSeo(commit.meta, commit.repoId)
      return seo ? { seo } : {}
    })(),
    ...(optBool(commit.meta?.feed) !== undefined
      ? { showInFeed: optBool(commit.meta.feed) }
      : {}),
    readingAccess:
      commit.meta?.isPaynoteExcluded === true
        ? 'OPEN'
        : commit.meta?.isPaywallExcluded === true
          ? 'PAYNOTE'
          : 'REGWALL',
    showTextProgress: commit.meta?.disableTextProgress !== true,
    ...(optStr(commit.meta?.shortTitle)
      ? {
          pushNotificationText: inlineEditorFromString(
            optStr(commit.meta.shortTitle) as string,
          ),
        }
      : {}),
    ...(optStr(commit.meta?.emailSubject)
      ? {
          emailSubject: inlineEditorFromString(
            optStr(commit.meta.emailSubject) as string,
          ),
        }
      : {}),
  }
}

// Applies everything that needs the format's own already-published commit
// (see ./formatFields.ts) on top of a doc buildDraftArticleDoc already
// built: the teaserSmall.image fallback, the META-theme/colour upgrade, the
// format's section as a second articleCollections entry, the format's
// share-image fallbacks folded into `seo`, and the newsletter/podcast
// references. Called once per sync, after fetchFormatFields — see
// worker.ts.
export function resolveFormatDerivedFields(
  doc: DraftArticleDoc,
  meta: Record<string, unknown>,
  repoId: string | undefined,
  formatRepoId: string,
  formatFields: FormatFields,
): DraftArticleDoc {
  let next = doc

  if (!next.teaserSmall?.image) {
    const image = buildImage(formatFields.image, formatRepoId)
    if (image) {
      next = { ...next, teaserSmall: { _type: 'teaserSmallConfig', image } }
    }
  }

  next = { ...next, theme: applyFormatTheme(next.theme, formatFields) }

  next = {
    ...next,
    articleCollections: appendSectionCollection(
      next.articleCollections,
      formatFields,
    ),
  }

  const seo = buildSeo(meta, repoId, formatRepoId, formatFields)
  if (seo) next = { ...next, seo }

  if (formatFields.hasNewsletter) {
    next = {
      ...next,
      newsletter: {
        _type: 'reference',
        _ref: repoIdToNewsletterId(formatRepoId),
      },
    }
  }
  if (formatFields.hasPodcast) {
    next = {
      ...next,
      podcast: { _type: 'reference', _ref: repoIdToPodcastId(formatRepoId) },
    }
  }

  return next
}
