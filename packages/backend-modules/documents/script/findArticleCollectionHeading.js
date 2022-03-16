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
    visit(hit._source.content, 'zone', (node, index, parent) => {
      if (node?.identifier === 'ARTICLECOLLECTION') {
        const heading = node.children.find((c) => c.type === 'heading')
        const value = heading.children?.[0]?.value

        if (value !== 'Lesen Sie auch:') {
          console.log(value)
        }
      }
    })
  }

  await elastic.close()
}

run().catch((e) => {
  throw e
})
