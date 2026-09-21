// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// A referenced format must already be published before an article can point
// at it, so a handful of values that live on the FORMAT's own commit
// (teaserSmall.image fallback, accent colour, "is this a Meta-kind format",
// its section, whether it has a newsletter/podcast, its share-image
// fallbacks) are all resolvable right now with ONE targeted Postgres lookup
// — published milestone -> its commit -> that commit's own meta — no
// cross-repo Elasticsearch pre-scan of the kind the batch migration
// (studio's transform.ts) needs. This module makes that one lookup and
// extracts every such value from it, so worker.ts/articleDoc.ts never need a
// second round-trip per field.
import type { PgDb } from '@orbiting/backend-modules-types'
import { resolveRepublikRepoId } from '../legacyId'

export interface FormatFields {
  image?: string
  kind?: string
  color?: string
  sectionRepoId?: string
  hasNewsletter: boolean
  hasPodcast: boolean
  shareBackgroundImage?: string
  shareLogo?: string
}

export async function fetchFormatFields(
  formatRepoId: string | undefined,
  pgdb: PgDb,
): Promise<FormatFields | undefined> {
  if (!formatRepoId) return undefined

  const milestone = await pgdb.publikator.milestones.findOne(
    { repoId: formatRepoId, scope: 'publication', revokedAt: null },
    { orderBy: { createdAt: 'desc' } },
  )
  if (!milestone) return undefined

  const formatCommit = await pgdb.publikator.commits.findOne({
    id: milestone.commitId,
  })
  const meta = (formatCommit?.meta ?? {}) as Record<string, unknown>

  return {
    image: typeof meta.image === 'string' ? meta.image : undefined,
    kind: typeof meta.kind === 'string' ? meta.kind : undefined,
    color: typeof meta.color === 'string' ? meta.color : undefined,
    sectionRepoId: resolveRepublikRepoId(meta.section),
    hasNewsletter: typeof meta.newsletter === 'object' && meta.newsletter !== null,
    hasPodcast: typeof meta.podcast === 'object' && meta.podcast !== null,
    shareBackgroundImage:
      typeof meta.shareBackgroundImage === 'string'
        ? meta.shareBackgroundImage
        : undefined,
    shareLogo: typeof meta.shareLogo === 'string' ? meta.shareLogo : undefined,
  }
}
