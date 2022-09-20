#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const visit = require('unist-util-visit')
const { csvFormat } = require('d3-dsv')

const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const { getIndexAlias } = require('@orbiting/backend-modules-search/lib/utils')

const elastic = Elasticsearch.connect()

const run = async () => {
  const params = {
    index: getIndexAlias('document', 'read'),
    scroll: '5s',
    size: 100,
    _source: ['meta', 'content'],
    body: {
      query: {
        bool: {
          must: [
            { term: { '__state.published': true } },
            {
              range: {
                'meta.publishDate': {
                  gte: '2022-08-26',
                },
              },
            },
          ],
        },
      },
    },
  }

  const links = []
  let linkCount = 0

  for await (const hit of Elasticsearch.scroll(elastic, params)) {
    const { meta, content } = hit._source

    visit(content, 'link', (node) => {
      linkCount++

      const [title, description] = node.title?.split('%%') || ''

      if (description) {
        links.push({
          docLink: `https://www.republik.ch${meta.path}`,
          link: node.url,
          description,
          title,
          pubLink: `https://publikator.republik.ch/repo/${meta.repoId}/tree`,
        })
      }
    })
  }

  await elastic.close()

  console.log(csvFormat(links))
  console.log(linkCount)
}

run().catch((e) => {
  throw e
})
