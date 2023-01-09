#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const { getIndexAlias } = require('@orbiting/backend-modules-search/lib/utils')

const BATCH_SIZE = 100

if (!process.env.TARGET_ELASTIC_URL) {
  console.error('Yeah. No. You need to provied TARGET_ELASTIC_URL')
}

const source = Elasticsearch.connect(process.env.SOURCE_ELASTIC_URL)
const target = Elasticsearch.connect(process.env.TARGET_ELASTIC_URL)

const _index = getIndexAlias('mail', 'write')

const insertBulk = (elastic, batch) => {
  return elastic.bulk({
    body: batch.flatMap(({ _id, _type, _source }) => [
      {
        update: {
          _index,
          _id,
          retry_on_conflict: 3,
        },
      },
      {
        doc: {
          ..._source,
          __type: _type,
        },
        doc_as_upsert: true,
      },
    ]),
  })
}

const run = async () => {
  const params = {
    index: getIndexAlias('mail', 'read'),
    scroll: '10s',
    size: 100,
    body: {
      query: {
        match_all: {},
      },
    },
  }

  const stats = { mails: 0 }
  let batch = []

  for await (const hit of Elasticsearch.scroll(source, params)) {
    batch.push(hit)

    if (batch.length >= BATCH_SIZE) {
      stats.mails += batch.length
      console.log('insert %i mails (%i inserted)', batch.length, stats.mails)

      await insertBulk(target, batch)

      batch = []
    }
  }

  if (batch.length) {
    stats.mails += batch.length
    console.log(
      'insert %i mails (%i inserted, last batch)',
      batch.length,
      stats.mails,
    )

    await insertBulk(target, batch)
  }

  await source.close()
}

run().catch((e) => {
  throw e
})
