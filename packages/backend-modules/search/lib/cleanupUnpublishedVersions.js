const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/**
 * @param {Number} weeks
 * @param {Date} [now]
 * @return {Date}
 */
const getOlderThanDate = (weeks, now = new Date()) =>
  new Date(now.getTime() - weeks * WEEK_MS)

/**
 * Query matching document versions of a repoId which are fully unpublished
 * (published=false AND prepublished=false, i.e. superseded by a newer
 * version).
 *
 * Note: this intentionally does NOT filter by meta.publishDate. That field
 * is content metadata (e.g. an authored/scheduled date on the "Front" type)
 * and is often identical across hundreds of versions of the same repoId, so
 * it cannot tell a version superseded three years ago from one superseded
 * three weeks ago. The actual per-version age lives in Postgres, see
 * `indexMilestonesByName`/`selectStaleVersions` below.
 *
 * @param  {Object} args
 * @param  {String} args.repoId
 * @return {Object} elasticsearch query
 */
const buildUnpublishedVersionsQuery = ({ repoId }) => ({
  bool: {
    must: [
      { term: { __type: 'Document' } },
      { term: { 'meta.repoId': repoId } },
      { term: { '__state.published': false } },
      { term: { '__state.prepublished': false } },
    ],
  },
})

/**
 * Indexes publikator.milestones rows by their `name` (== ES versionName).
 * If several milestones share a name (shouldn't happen, but scopes aren't
 * unique per name), the most recently revoked/created one wins.
 *
 * @param  {Object[]} milestones rows from publikator.milestones
 * @return {Object} map of versionName -> milestone
 */
const indexMilestonesByName = (milestones) => {
  const byName = {}
  for (const milestone of milestones) {
    const existing = byName[milestone.name]
    if (!existing || getMilestoneAge(milestone) > getMilestoneAge(existing)) {
      byName[milestone.name] = milestone
    }
  }
  return byName
}

/**
 * The moment a version stopped being current: when it was revoked by a
 * newer publish (publikator.postgres's maybeDeclareMilestonePublished sets
 * this), falling back to when the milestone row was created for versions
 * that were superseded before revocation was recorded, or otherwise never
 * revoked (e.g. plain milestones).
 *
 * @param  {Object} milestone
 * @return {Date|null}
 */
const getMilestoneAge = (milestone) => {
  const value = milestone?.revokedAt || milestone?.createdAt
  return value ? new Date(value) : null
}

/**
 * Splits fully-unpublished ES hits into ones stale enough to delete
 * (their milestone's age is older than `olderThan`) and ones to keep,
 * annotating why. A version whose milestone can't be found is kept, not
 * silently dropped nor silently deleted — the caller should surface it.
 *
 * @param  {Object} args
 * @param  {Object[]} args.hits          ES hits (with _id, _source.versionName)
 * @param  {Object}   args.milestonesByName from indexMilestonesByName
 * @param  {Date}     args.olderThan
 * @return {{stale: Object[], kept: Object[]}}
 */
const selectStaleVersions = ({ hits, milestonesByName, olderThan }) => {
  const stale = []
  const kept = []

  for (const hit of hits) {
    const versionName = hit._source?.versionName
    const milestone = milestonesByName[versionName]
    const age = milestone && getMilestoneAge(milestone)

    if (!age) {
      kept.push({ hit, reason: 'no milestone found for versionName' })
    } else if (age < olderThan) {
      stale.push({ hit, age })
    } else {
      kept.push({ hit, reason: 'not older than threshold', age })
    }
  }

  return { stale, kept }
}

/**
 * @param  {String} index
 * @param  {String[]} ids
 * @return {Object[]} bulk API body (delete ops)
 */
const toBulkDeleteBody = (index, ids) =>
  ids.map((id) => ({ delete: { _index: index, _id: id } }))

module.exports = {
  getOlderThanDate,
  buildUnpublishedVersionsQuery,
  indexMilestonesByName,
  getMilestoneAge,
  selectStaleVersions,
  toBulkDeleteBody,
}
