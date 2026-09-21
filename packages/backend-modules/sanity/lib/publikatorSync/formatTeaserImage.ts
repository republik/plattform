// SANITY_SYNC (transition period, removable — see ./index.ts).
//
// Fills in `teaserSmall.image` from the article's linked format's own image
// when the article carries none of its own (buildDraftArticleDoc already set
// it from meta.image when present — this only ever fills a gap, never
// overrides it). A referenced format must already be published before an
// article can point at it, so its image is resolvable right now with one
// targeted Postgres lookup (published milestone -> its commit -> meta.image)
// — unlike the carousel/series-derived teaser overrides the batch migration
// (studio's transform.ts) computes from a full cross-repo Elasticsearch
// pre-scan, this needs no such thing.
import type { PgDb } from '@orbiting/backend-modules-types'
import { assetRef } from './mdastToPortableText'
import type { DraftArticleDoc } from './articleDoc'

export async function resolveFormatTeaserImage(
  doc: DraftArticleDoc,
  formatRepoId: string | undefined,
  pgdb: PgDb,
): Promise<DraftArticleDoc> {
  if (doc.teaserSmall?.image) return doc
  if (!formatRepoId) return doc

  const milestone = await pgdb.publikator.milestones.findOne(
    { repoId: formatRepoId, scope: 'publication', revokedAt: null },
    { orderBy: { createdAt: 'desc' } },
  )
  if (!milestone) return doc

  const formatCommit = await pgdb.publikator.commits.findOne({
    id: milestone.commitId,
  })
  const formatImageUrl = formatCommit?.meta?.image
  const image = assetRef(
    typeof formatImageUrl === 'string' ? formatImageUrl : undefined,
  )
  if (!image) return doc

  return {
    ...doc,
    teaserSmall: { _type: 'teaserSmallConfig', image: { _type: 'image', _sanityAsset: image } },
  }
}
