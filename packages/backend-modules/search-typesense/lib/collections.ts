import { Client, CollectionCreateSchema, Errors } from 'typesense'

/**
 * The collection "kinds" this module manages. Each kind has:
 *  - a stable alias name (what queries/writers use)
 *  - N dated, physical collections over time (created by script/reindex.ts)
 *
 * This mirrors the blue-green alias pattern used by the existing
 * Elasticsearch pipeline (see lib/utils.js#getIndexAlias and
 * lib/pullElasticsearch.ts in @orbiting/backend-modules-search), but adapted
 * to Typesense's simpler one-alias-to-one-collection model.
 *
 * "articles" has two writers: *incremental* per-publish sync lives entirely
 * in republik/studio (its own Sanity Blueprint functions, see
 * functions/sync-search/*) -- nothing in this module touches that path.
 * *Bulk* backfill/reindex, however, lives here (script/reindex.ts's
 * reindexArticles, via lib/sanity/fetchArticles.ts's own GROQ query) since
 * it's ops tooling for backend people, not editors. Both writers must agree
 * on this file's schema, which is why it stays the single source of truth
 * for every collection's shape regardless of who writes to it.
 */
export type CollectionKind = 'comments' | 'users' | 'articles'

const PREFIX = process.env.TYPESENSE_COLLECTION_PREFIX || 'republik'

/**
 * Stable alias name writers/readers should use, e.g. "republik-comments".
 */
export const getAliasName = (kind: CollectionKind): string =>
  `${PREFIX}-${kind}`

/**
 * A fresh, dated, physical collection name for a full reindex,
 * e.g. "republik-comments-1732000000000".
 */
export const getDatedCollectionName = (kind: CollectionKind): string =>
  `${PREFIX}-${kind}-${Date.now()}`

/**
 * Comment document as stored in Typesense.
 *
 * A comment document is only ever written while all of the following hold:
 *  - its discussion is not hidden
 *  - adminUnpublished is false
 *  - published is true
 * See lib/transform/comment.ts for the enforcement of this rule.
 */
export interface TypesenseCommentDocument {
  /** The `public.comments.id` UUID -- Typesense's document primary key. */
  id: string
  contentString: string
  /** Absent entirely when the comment is anonymous. */
  authorName?: string
  /** Absent under the same conditions as authorName (anonymous comment). */
  authorId?: string
  /** Profile slug (username, falls back to id) -- absent when authorName is. */
  authorSlug?: string
  /** Resized/bw display URL, see @orbiting/backend-modules-republik/lib/portrait. */
  authorPortrait?: string
  /** Author's single "listed" credential description, if any. */
  authorCredential?: string
  authorCredentialVerified?: boolean
  discussionId: string
  /** Absent when the discussion isn't tied to a document/article. */
  articlePath?: string
  /** First tag on the comment, if any -- surfaced as the topic/context line. */
  tag?: string
  /** unix ms */
  createdAt: number
}

/**
 * User document as stored in Typesense.
 *
 * ONLY public profiles are written here -- see lib/transform/user.ts, which
 * returns null for a non-public profile, and lib/listener.ts, which deletes
 * the existing document when it does. Privacy is enforced at write time
 * because the scoped search key handed to browsers carries no document
 * filter, only a collection restriction (see lib/scopedKey.ts).
 *
 * Carries NO email, for the same reason that non-public profiles are absent
 * entirely. A scoped key can constrain which fields come back
 * (exclude_fields) but cannot constrain `query_by` -- and the key is handed
 * to the browser, so `query_by` is caller-controlled. An indexed `email` here
 * would let any key probe `query_by=email&q=<address>` and read the answer
 * off the hit/no-hit plus the `highlights` array, even with the value
 * excluded from the returned document. Collection access is a property of the
 * *parent* key (see lib/scopedKey.ts), so keeping a sensitive value out of
 * the collection entirely is the only boundary a caller-supplied query_by
 * cannot reach around. That is also why the future admin-only profile search
 * belongs in its own collection rather than behind a filter here. Admin email
 * search lives in Postgres (adminUsers resolver in
 * @orbiting/backend-modules-republik-crowdfundings).
 */
export interface TypesenseUserDocument {
  /** The `public.users.id` UUID -- Typesense's document primary key. */
  id: string
  name: string
  username?: string
  biography?: string
  statement?: string
  /** Resolved single "listed" credential description. */
  credential?: string
  credentialVerified?: boolean
  /** Resized/bw display URL, see @orbiting/backend-modules-republik/lib/portrait. */
  portrait?: string
  /** unix ms */
  createdAt: number
}

/**
 * Article/page document as stored in Typesense. Written incrementally by
 * republik/studio's Sanity Blueprint functions/sync-search/* (see
 * shared/search/toSearchDocument.ts there) on publish, and in bulk by this
 * module's own script/reindex.ts (see lib/sanity/fetchArticles.ts) -- kept
 * here as the schema contract both writers must agree on.
 */
export interface TypesenseArticleDocument {
  /**
   * The Sanity document `_id`. Typesense treats `id` as the document's
   * primary key (auto-generating one when a write omits it), so this MUST be
   * set explicitly and MUST be stable across re-syncs -- otherwise every
   * sync of the same article inserts a second document instead of replacing
   * the first.
   *
   * Note for the writer side (republik/studio): a Sanity draft's `_id` is
   * prefixed (`drafts.<id>`) and would therefore land as a *separate*
   * Typesense document from its published counterpart. Only published
   * documents belong in this collection.
   */
  id: string
  /** always "article" */
  type: string
  title: string
  byline?: string
  description?: string
  plainTextBody: string
  slug?: string
  /** unix ms, never null -- falls back to 0 (see toSearchDocument.ts there) */
  publishDate: number
  readingAccess?: string
  collections?: string[]
  /** Resolved contributor names (see the studio repo's sync-contributors
   * Blueprint Function, which populates `contributors` from `byline`) --
   * a structured facet alongside the freeform `byline` text. */
  authors?: string[]
  /** JSON-encoded CreditsNode[] (see republik/studio's
   * shared/search/bylineToCredits.ts) -- the article's byline exactly as
   * authored, with internalLink spans resolved to `/~slug` profile links. */
  credits?: string
  /** True if a produced mp3 exists, or synthetic voice is enabled. */
  hasAudio?: boolean
  /** "produced" | "synthetic" -- absent if there's no audio at all. */
  audioSourceKind?: string
  /** Public URL of the produced or synthetic mp3, if hasAudio is true. */
  audioSourceMp3?: string
  /** Audio duration in milliseconds, if hasAudio is true. */
  audioDurationMs?: number
  /** The `backendDiscussionId` field on the article's referenced Sanity
   * `discussion` document -- the Postgres `discussions.id` for that thread.
   * Used to batch-fetch live comment counts/paths for search results
   * client-side; Typesense itself carries no live discussion data. */
  discussionId?: string
  /** The article's `theme.accentColor` (hex) -- Spitzmarke/border accent
   * color, mirroring the old format.meta.color. */
  accentColor?: string
  /**
   * Always "public" -- articles carry no privacy dimension today.
   *
   * Written by republik/studio (shared/search/toSearchDocument.ts there) and
   * consumed by no filter in this module: search keys carry no document
   * filter at all (see lib/scopedKey.ts). Retained only so the cross-repo
   * schema contract stays accurate -- drop it here only in lockstep with a
   * studio change, or studio's writes will fail against the schema.
   */
  searchScope: 'public'
}

const commentsFields: CollectionCreateSchema['fields'] = [
  { name: 'id', type: 'string' },
  { name: 'contentString', type: 'string' },
  { name: 'authorName', type: 'string', optional: true },
  { name: 'authorId', type: 'string', optional: true, index: false },
  { name: 'authorSlug', type: 'string', optional: true, index: false },
  { name: 'authorPortrait', type: 'string', optional: true, index: false },
  { name: 'authorCredential', type: 'string', optional: true, index: false },
  { name: 'authorCredentialVerified', type: 'bool', optional: true, index: false },
  { name: 'discussionId', type: 'string', index: false },
  { name: 'articlePath', type: 'string', optional: true, index: false },
  { name: 'tag', type: 'string', optional: true, index: false },
  { name: 'createdAt', type: 'int64' },
]

const usersFields: CollectionCreateSchema['fields'] = [
  { name: 'id', type: 'string' },
  { name: 'name', type: 'string' },
  { name: 'username', type: 'string', optional: true, index: false },
  { name: 'biography', type: 'string', optional: true },
  { name: 'statement', type: 'string', optional: true },
  { name: 'credential', type: 'string', optional: true, index: false },
  { name: 'credentialVerified', type: 'bool', optional: true, index: false },
  { name: 'portrait', type: 'string', optional: true, index: false },
  { name: 'createdAt', type: 'int64' },
]

const articlesFields: CollectionCreateSchema['fields'] = [
  { name: 'id', type: 'string' },
  { name: 'type', type: 'string', index: false },
  { name: 'title', type: 'string' },
  { name: 'byline', type: 'string', optional: true },
  { name: 'description', type: 'string', optional: true },
  { name: 'plainTextBody', type: 'string' },
  { name: 'slug', type: 'string', optional: true, index: false },
  { name: 'publishDate', type: 'int64' },
  { name: 'readingAccess', type: 'string', optional: true, index: false },
  { name: 'collections', type: 'string[]', optional: true, facet: true },
  { name: 'authors', type: 'string[]', optional: true, facet: true },
  { name: 'credits', type: 'string', optional: true, index: false },
  { name: 'hasAudio', type: 'bool', optional: true, facet: true },
  { name: 'audioSourceKind', type: 'string', optional: true, index: false },
  { name: 'audioSourceMp3', type: 'string', optional: true, index: false },
  { name: 'audioDurationMs', type: 'int64', optional: true, index: false },
  { name: 'discussionId', type: 'string', optional: true, index: false },
  { name: 'accentColor', type: 'string', optional: true, index: false },
  { name: 'searchScope', type: 'string', facet: true },
]

const schemaFields: Record<CollectionKind, CollectionCreateSchema['fields']> =
  {
    comments: commentsFields,
    users: usersFields,
    articles: articlesFields,
  }

/** default_sorting_field must be numeric (int32/int64/float) per collection. */
const defaultSortingField: Record<CollectionKind, string> = {
  comments: 'createdAt',
  users: 'createdAt',
  articles: 'publishDate',
}

/**
 * Builds the Typesense collection creation schema for a given collection
 * kind and a concrete (physical) collection name.
 */
export const getCollectionSchema = (
  kind: CollectionKind,
  name: string,
): CollectionCreateSchema => ({
  name,
  fields: schemaFields[kind],
  default_sorting_field: defaultSortingField[kind],
})

export const isNotFound = (error: unknown): boolean =>
  error instanceof Errors.ObjectNotFound

/**
 * Resolves the physical collection name an alias currently points at, or
 * null if the alias doesn't exist yet.
 */
export const resolveAlias = async (
  client: Client,
  aliasName: string,
): Promise<string | null> => {
  try {
    const alias = await client.aliases(aliasName).retrieve()
    return alias.collection_name
  } catch (error) {
    if (isNotFound(error)) {
      return null
    }
    throw error
  }
}

/**
 * Idempotently ensures a collection (and its alias) exists for the given
 * kind. Used by script/bootstrap.ts. Safe to call repeatedly: skips
 * creation if the alias is already pointing at an existing collection.
 */
export const ensureBootstrapped = async (
  client: Client,
  kind: CollectionKind,
): Promise<{ aliasName: string; collectionName: string; created: boolean }> => {
  const aliasName = getAliasName(kind)
  const existing = await resolveAlias(client, aliasName)

  if (existing) {
    return { aliasName, collectionName: existing, created: false }
  }

  const collectionName = getDatedCollectionName(kind)
  await client.collections().create(getCollectionSchema(kind, collectionName))
  await client.aliases().upsert(aliasName, { collection_name: collectionName })

  return { aliasName, collectionName, created: true }
}

export const ALL_KINDS: CollectionKind[] = ['comments', 'users', 'articles']
