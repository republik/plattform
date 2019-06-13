const debug = require('debug')('search:lib:indexPgTable')

// Amount of rows, documents in a single bulk request.
const BULK_SIZE = 1000

// Interval in seconds stats about bulk progress is printed.
const STATS_INTERVAL_SECS = 5

/**
 * Indexes a <resource> in ElasticSearch.
 *
 * @param  {String}   indexName
 * @param  {String}   type
 * @param  {Object}   elastic
 * @param  {Object}   resource
 * @param  {PgTable}  resource.table
 * @param  {Object}   [resource.where]     PgTable where stmt
 * @param  {Function} [resource.transform] A function applied to each result row
 * @param  {Number}   [resource.bulkSize]  Amount of docs to insert at once
 * @param  {String[]} [resource.delete]    List of IDs to delete
 * @return {Promise}
 */
const index = async ({ indexName, type, elastic, resource }) => {
  const stats = { [type]: { added: 0, deleted: 0 } }
  const statsInterval = setInterval(() => {
    debug(indexName, stats)
  }, STATS_INTERVAL_SECS * 1000)

  let offset = 0
  let rows = []

  do {
    rows = await resource.table.find(
      resource.where || {},
      {
        orderBy: { id: 'asc' },
        limit: resource.bulkSize || BULK_SIZE,
        offset,
        skipUndefined: true
      }
    )

    if (resource.transform) {
      rows = rows.map(resource.transform, resource)
    }

    await bulk({
      indexName,
      type,
      elastic,
      upsertDocs: rows,
      deleteDocs: resource.delete || []
    })

    stats[type].added += rows.length
    stats[type].deleted += (resource.delete || []).length

    offset += BULK_SIZE
  } while (rows.length >= BULK_SIZE)

  clearInterval(statsInterval)

  debug(indexName, Object.assign(stats, { done: true }))
}

/**
 * Prepares ElasticSearch-compatible documents of passed <upsertDocs> and does
 * submit documents in "bulk" to ElasticSearch.
 * @param  {String}     indexName
 * @param  {String}     type
 * @param  {Object}     elastic
 * @param  {Object[]}   [upsertDocs=[]] Fully qualified objects to upsert
 * @param  {String[]}   [deleteDocs=[]] IDs of documents to delete
 * @return {Promise}
 */
const bulk = async ({
  indexName,
  type,
  elastic,
  upsertDocs = [],
  deleteDocs = []
}) => {
  const payload = {
    body: [
      // <n+0> Destination of document: Index, type and id
      // <n+1> Document source
      // ...
    ]
  }

  upsertDocs.forEach(doc => {
    // <n+0>
    payload.body.push({
      update: {
        _index: indexName,
        _type: type,
        _id: doc.id,
        retry_on_conflict: 3
      }
    })
    // <n+1>
    payload.body.push({
      doc: {
        ...doc,
        __type: type
      },
      doc_as_upsert: true
    })
  })

  deleteDocs.forEach(id => {
    // <n+0>
    payload.body.push({
      delete: {
        _index: indexName,
        _type: type,
        _id: id
      }
    })
  })

  if (payload.body.length === 0) {
    console.log('indexPgTable skip due do empty body', { indexName, type })
    return
  }

  const resp = await elastic.bulk(payload)

  if (resp.errors) throw Error('Unable to submit all rows.')
}

module.exports = {
  index,
  bulk
}
