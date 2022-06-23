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
      sort: {
        'meta.publishDate': {
          order: 'desc',
          unmapped_type: 'long',
        },
      },
      query: {
        bool: {
          must: [
            { term: { '__state.published': true } },
            {
              terms: {
                'meta.template': ['article'],
              },
            },
          ],
        },
      },
    },
  }

  for await (const hit of Elasticsearch.scroll(elastic, params)) {
    visit(hit._source.content, 'image', (node, index, parent) => {
      if (node?.url) {
        const url = new URL(node?.url)
        const [width, height] = url.searchParams.get('size').split('x')

        if (
          url.pathname.endsWith('.jpeg') &&
          width &&
          width > 3000 &&
          height &&
          width > height
        ) {
          url.searchParams.delete('size')
          console.log(url.toString())
        }
      }
    })
  }

  await elastic.close()
}

run().catch((e) => {
  throw e
})
