import { Client, CollectionCreateSchema, Errors } from 'typesense'

/**
 * The collection "kinds" this module manages. Each kind has:
 *  - a stable alias name (what queries/writers use)
 *  - N dated, physical collections over time (created by script/reindex.ts,
 *    or -- for "articles" -- by the Sanity studio repo's own backfill script)
 *
 * This mirrors the blue-green alias pattern used by the existing
 * Elasticsearch pipeline (see lib/utils.js#getIndexAlias and
 * lib/pullElasticsearch.ts in @orbiting/backend-modules-search), but adapted
 * to Typesense's simpler one-alias-to-one-collection model.
 *
 * "articles" is written to by a completely separate repo (republik/studio's
 * Sanity Blueprint functions, see functions/sync-search/*) rather than
 * anything in this module -- its schema/alias are still defined here so this
 * module remains the single source of truth for every collection's shape,
 * and so script/bootstrap.ts can create it alongside comments/users.
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
  /**
   * Always "public" -- comments that shouldn't be searchable (hidden
   * discussion, adminUnpublished, unpublished) are never written at all, so
   * anything present here already is public. The field exists so a single
   * Typesense scoped key's filter_by (see lib/scopedKey.ts) can apply
   * uniformly across comments/users/articles without erroring on a missing
   * field.
   */
  searchScope: 'public'
}

/**
 * User document as stored in Typesense.
 *
 * Unlike comments, ALL users are written here, including users with
 * hasPublicProfile: false. Privacy enforcement happens at query time via
 * searchScope (see lib/scopedKey.ts), not at write time.
 */
export interface TypesenseUserDocument {
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
  /** Kept for completeness/debugging; searchScope is what filters actually use. */
  hasPublicProfile: boolean
  /**
   * "public" if hasPublicProfile, else "admin" -- a non-public profile is
   * only findable via search by admin/support callers, not by other
   * logged-in members. Note this is intentionally stricter than
   * @orbiting/backend-modules-auth's userIsMeOrProfileVisible (which lets
   * members view a non-public profile directly, just not discover it via
   * search) -- searchability is a narrower gate than direct-link visibility.
   */
  searchScope: 'public' | 'admin'
  /** unix ms */
  createdAt: number
}

/**
 * Article/page document as stored in Typesense, written by republik/studio's
 * Sanity Blueprint functions/sync-search/* (see shared/search/toSearchDocument.ts
 * there) -- kept here purely as the schema contract both repos must agree on.
 */
export interface TypesenseArticleDocument {
  id: string
  /** "article" | "page" */
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
  /** True if a produced mp3 exists, or synthetic read-aloud isn't suppressed. */
  hasAudio?: boolean
  /** "produced" | "synthetic" -- absent if there's no audio at all. */
  audioSourceKind?: string
  /** The `backendDiscussionId` field on the article's referenced Sanity
   * `discussion` document -- the Postgres `discussions.id` for that thread.
   * Used to batch-fetch live comment counts/paths for search results
   * client-side; Typesense itself carries no live discussion data. */
  discussionId?: string
  /** The article's `theme.accentColor` (hex) -- Spitzmarke/border accent
   * color, mirroring the old format.meta.color. */
  accentColor?: string
  /** Always "public" -- articles carry no privacy dimension today. */
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
  { name: 'searchScope', type: 'string', facet: true },
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
  { name: 'hasPublicProfile', type: 'bool', index: false },
  { name: 'searchScope', type: 'string', facet: true },
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

const isNotFound = (error: unknown): boolean =>
  error instanceof Errors.ObjectNotFound

/**
 * Creates a new, dated, physical collection for the given kind.
 */
export const createCollection = async (
  client: Client,
  kind: CollectionKind,
  name: string,
): Promise<void> => {
  await client.collections().create(getCollectionSchema(kind, name))
}

/**
 * Idempotently points an alias at a collection, atomically switching it if
 * the alias already exists (Typesense's upsert on an alias is atomic).
 */
export const swapAlias = async (
  client: Client,
  aliasName: string,
  collectionName: string,
): Promise<void> => {
  await client.aliases().upsert(aliasName, { collection_name: collectionName })
}

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
  await createCollection(client, kind, collectionName)
  await swapAlias(client, aliasName, collectionName)

  return { aliasName, collectionName, created: true }
}

export const ALL_KINDS: CollectionKind[] = ['comments', 'users', 'articles']
