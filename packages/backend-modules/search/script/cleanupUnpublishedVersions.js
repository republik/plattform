#!/usr/bin/env node

/**
 * Deletes stale, fully-unpublished document versions from the
 * republik-document-write index for a given repoId.
 *
 * Old versions are never deleted on publish, only marked unpublished
 * (__state.published = false, __state.prepublished = false). For
 * repoIds which are republished often (e.g. republik/magazine) this
 * backlog grows without bound and eventually makes Documents.js's
 * afterScheduled _update_by_query exceed Elasticsearch's coordinating
 * node circuit breaker (es_rejected_execution_exception, HTTP 429).
 *
 * Elasticsearch itself has no reliable per-version age field: meta.publishDate
 * is content metadata (e.g. an authored/scheduled date on a "Front" type) and
 * is often identical across hundreds of versions of the same repoId. The
 * actual age of a version lives in Postgres, on publikator.milestones.revokedAt
 * (falling back to createdAt) - set by maybeDeclareMilestonePublished when a
 * newer version supersedes it. So this script cross-references Elasticsearch
 * (to find unpublished versions) with Postgres (to find how old they are).
 *
 * This script lists (and, with --delete, removes) unpublished versions
 * of a repoId older than a given age threshold, deleting via small
 * bulk-API batches rather than a single _delete_by_query to avoid
 * tripping the same circuit breaker.
 *
 * # Usage
 * ./cleanupUnpublishedVersions.js --repoId republik/magazine
 * ./cleanupUnpublishedVersions.js --repoId republik/magazine --olderThan 4
 * ./cleanupUnpublishedVersions.js --repoId republik/magazine --delete
 */

require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const { chunk } = require('lodash')
const readline = require('readline/promises')

const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const { getIndexAlias } = require('../lib/utils')
const {
  getOlderThanDate,
  buildUnpublishedVersionsQuery,
  indexMilestonesByName,
  selectStaleVersions,
  toBulkDeleteBody,
} = require('../lib/cleanupUnpublishedVersions')

const DEFAULT_OLDER_THAN_WEEKS = 3
const DEFAULT_BATCH_SIZE = 200
// keep well under postgres' parameter/list limits for the "name IN (...)" lookup
const MILESTONE_LOOKUP_CHUNK_SIZE = 500

const argv = yargs
  .option('repoId', {
    alias: 'r',
    type: 'string',
    demandOption: true,
    describe: 'e.g. republik/magazine',
  })
  .option('olderThan', {
    alias: 'o',
    type: 'number',
    default: DEFAULT_OLDER_THAN_WEEKS,
    describe:
      'age threshold in weeks, based on publikator.milestones.revokedAt (fallback createdAt)',
  })
  .option('delete', {
    type: 'boolean',
    default: false,
    describe: 'actually delete matches (default: list only, no side effects)',
  })
  .option('batchSize', {
    type: 'number',
    default: DEFAULT_BATCH_SIZE,
    describe: 'number of documents deleted per bulk request',
  })
  .help()
  .version(false).argv

const elastic = Elasticsearch.connect()
const index = getIndexAlias('document', 'write')

const findUnpublishedVersions = async () => {
  const params = {
    index,
    scroll: '1m',
    size: 500,
    _source: ['meta.repoId', 'versionName'],
    body: {
      query: buildUnpublishedVersionsQuery({ repoId: argv.repoId }),
    },
  }

  const hits = []
  for await (const hit of Elasticsearch.scroll(elastic, params)) {
    hits.push(hit)
  }
  return hits
}

const findMilestonesByName = async (pgdb, repoId, versionNames) => {
  const milestones = []
  for (const namesChunk of chunk(versionNames, MILESTONE_LOOKUP_CHUNK_SIZE)) {
    milestones.push(
      ...(await pgdb.publikator.milestones.find({
        repoId,
        name: namesChunk,
      })),
    )
  }
  return indexMilestonesByName(milestones)
}

const confirm = async (message) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  try {
    const answer = await rl.question(`${message} [y/N] `)
    return answer.trim().toLowerCase() === 'y'
  } finally {
    rl.close()
  }
}

const deleteInBatches = async (hits) => {
  const batches = chunk(
    hits.map((hit) => hit._id),
    argv.batchSize,
  )

  const stats = { deleted: 0, errors: 0 }

  for (const [batchIndex, ids] of batches.entries()) {
    console.log(
      `deleting batch ${batchIndex + 1}/${batches.length} (${ids.length} version(s))`,
    )

    const resp = await elastic.bulk({
      body: toBulkDeleteBody(index, ids),
    })

    const failed = resp.errors
      ? resp.items.filter((item) => item.delete?.error)
      : []

    if (failed.length) {
      console.error(
        `batch ${batchIndex + 1}: ${failed.length} error(s)`,
        failed.map((item) => item.delete.error),
      )
    }

    stats.errors += failed.length
    stats.deleted += ids.length - failed.length
  }

  return stats
}

const run = async () => {
  const olderThanDate = getOlderThanDate(argv.olderThan)

  console.log('searching for unpublished document versions', {
    index,
    repoId: argv.repoId,
    olderThanWeeks: argv.olderThan,
    revokedBefore: olderThanDate.toISOString(),
  })

  const hits = await findUnpublishedVersions()

  if (!hits.length) {
    console.log('no unpublished versions found')
    return
  }

  console.log(
    `found ${hits.length} unpublished version(s), looking up their milestones in postgres`,
  )

  const pgdb = await PgDb.connect()
  let stale
  let kept
  try {
    const milestonesByName = await findMilestonesByName(
      pgdb,
      argv.repoId,
      hits.map((hit) => hit._source.versionName),
    )

    ;({ stale, kept } = selectStaleVersions({
      hits,
      milestonesByName,
      olderThan: olderThanDate,
    }))
  } finally {
    await pgdb.close()
  }

  const noMilestone = kept.filter(
    (k) => k.reason === 'no milestone found for versionName',
  )
  if (noMilestone.length) {
    console.log(
      `skipping ${noMilestone.length} version(s) with no milestone found (kept, not deleted):`,
    )
    for (const { hit } of noMilestone) {
      console.log('  %s  versionName=%s', hit._id, hit._source.versionName)
    }
  }

  console.log(
    `${stale.length} of ${hits.length} unpublished version(s) are older than ${argv.olderThan} week(s):`,
  )
  for (const { hit, age } of stale) {
    console.log(
      '  %s  versionName=%s  revokedAt/createdAt=%s',
      hit._id,
      hit._source.versionName,
      age.toISOString(),
    )
  }

  if (!stale.length) {
    console.log('nothing to delete')
    return
  }

  if (!argv.delete) {
    console.log(
      `\n[dry run] ${stale.length} version(s) would be deleted. Re-run with --delete to remove them.`,
    )
    return
  }

  const confirmed = await confirm(
    `\nDelete ${stale.length} document version(s) for repoId "${argv.repoId}"? This cannot be undone.`,
  )

  if (!confirmed) {
    console.log('aborted, nothing was deleted')
    return
  }

  const deleteStats = await deleteInBatches(stale.map(({ hit }) => hit))

  console.log('\nsummary', {
    repoId: argv.repoId,
    unpublished: hits.length,
    stale: stale.length,
    skippedNoMilestone: noMilestone.length,
    deleted: deleteStats.deleted,
    errors: deleteStats.errors,
  })
}

run()
  .catch((e) => {
    throw e
  })
  .finally(() => elastic.close())
