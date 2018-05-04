// Amount of rows, documents in a single bulk request.
const BULK_SIZE = 10000

// Interval in seconds stats about bulk progress is printed.
const STATS_INTERVAL_SECS = 2

const index = async ({ indexName, type, elastic, resource }) => {
  const stats = { [type]: { added: 0 } }
  const statsInterval = setInterval(() => {
    console.log(indexName, stats)
  }, STATS_INTERVAL_SECS * 1000)

  let offset = 0
  let rows = []

  do {
    rows = await resource.table.find(
      {},
      {
        orderBy: { id: 'asc' },
        limit: resource.bulkSize || BULK_SIZE,
        offset
      }
    )

    if (resource.transform) rows = rows.map(resource.transform)

    await bulk({ indexName, type, elastic, rows })

    stats[type].added += rows.length
    offset += BULK_SIZE
  } while (rows.length >= BULK_SIZE)

  clearInterval(statsInterval)

  console.log(indexName, Object.assign(stats, { done: true }))
}

/**
 * Prepares ElasticSearch-compatible documents of passed <rows> and does submit
 * documents in "bulk" to ElasticSearch.
 *
 * @param  {String}  indexName
 * @param  {String}  type
 * @param  {Object}  elastic
 * @param  {Array}   rows
 * @return {Promise}
 */
const bulk = async ({ indexName, type, elastic, rows }) => {
  const bulk = {
    body: [
      // <n+0> Destination of document: Index, type and id
      // <n+1> Document source
      // ...
    ]
  }

  rows.forEach(row => {
    // <n+0>
    bulk.body.push({
      update: {
        _index: indexName,
        _type: type,
        _id: row.id,
        retry_on_conflict: 3
      }
    })
    // <n+1>
    bulk.body.push({ doc: row, doc_as_upsert: true })
  })

  const resp = await elastic.bulk(bulk)

  if (resp.errors) throw Error('Unable to submit all rows.')
}

module.exports = {
  index,
  bulk
}
