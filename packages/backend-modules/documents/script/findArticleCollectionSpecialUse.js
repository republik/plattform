#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const visit = require('unist-util-visit')

const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const utils = require('@orbiting/backend-modules-search/lib/utils')

const elastic = Elasticsearch.connect()

const run = async () => {
  const params = {
    index: utils.getIndexAlias('document', 'read'),
    scroll: '5s',
    size: 100,
    _source: ['meta', 'content'],
    body: {
      query: { term: { '__state.published': true } },
    },
  }

  for await (const hit of Elasticsearch.scroll(elastic, params)) {
    let isLogged = false

    visit(hit._source.content, 'zone', (node, index, parent) => {
      if (node?.identifier === 'ARTICLECOLLECTION') {
        if (isLogged) {
          return
        }

        const isIndexTiny = index < 2
        const maybeNotAtEnd = parent.children.length > index + 2

        if (isIndexTiny || maybeNotAtEnd) {
          console.log(
            `${process.env.FRONTEND_BASE_URL}${hit._source.content.meta.path}`,
          )
          isLogged = true
        }
      }
    })
  }

  await elastic.close()
}

run().catch((e) => {
  throw e
})
