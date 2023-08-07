#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const moment = require('moment')
const visit = require('unist-util-visit')

const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const utils = require('@orbiting/backend-modules-search/lib/utils')

const { getWordsPerMinute } = require('../lib/meta')

const elastic = Elasticsearch.connect()

const argv = yargs
  .option('from', {
    alias: 'f',
    coerce: moment,
    default: moment().subtract(1, 'month').startOf('month'),
  })
  .option('to', {
    alias: 't',
    coerce: moment,
    default: moment().startOf('month'),
  })
  .help()
  .version().argv

const run = async () => {
  const params = {
    index: utils.getIndexAlias('document', 'read'),
    scroll: '5s',
    size: 100,
    _source: ['meta.path', 'content', 'contentString'],
    stored_fields: ['contentString.count'],
    body: {
      query: {
        bool: {
          must: [
            { term: { '__state.published': true } },
            {
              terms: {
                'meta.template': [
                  'article',
                  'editorialNewsletter',
                  'discussion',
                  'flyer',
                ],
              },
            },
            {
              range: {
                'meta.publishDate': {
                  gte: argv.from,
                  lt: argv.to,
                },
              },
            },
          ],
        },
      },
    },
  }

  let documentCount = 0
  let readingMinutes = 0
  let charCount = 0
  let dynamicComponentCount = 0
  const dynamicComponents = new Set()

  console.log('counting (might take a while) …', {
    from: argv.from.toISOString(),
    to: argv.to.toISOString(),
  })

  for await (const hit of Elasticsearch.scroll(elastic, params)) {
    const [wordCount] = hit.fields['contentString.count']

    // Count docs
    documentCount += 1

    // Word count, readingMinutes
    readingMinutes += Math.round(wordCount / getWordsPerMinute())

    // Count chars
    charCount += hit._source.contentString?.length || 0

    // Find DYNAMIC_COMPONENTS
    let hasDynamicComponent = false

    visit(hit._source.content, 'zone', (node) => {
      if (node.identifier === 'DYNAMIC_COMPONENT' && node.data?.src) {
        hasDynamicComponent = true
      }
    })

    if (hasDynamicComponent) {
      dynamicComponents.add(`https://www.republik.ch${hit._source.meta.path}`)
      dynamicComponentCount++
    }
  }

  console.log('result', {
    from: argv.from.toISOString(),
    to: argv.to.toISOString(),
    documentCount,
    readingMinutes,
    charCount,
    dynamicComponentCount,
    dynamicComponents: Array.from(dynamicComponents),
  })

  await elastic.close()
}

run().catch((e) => {
  throw e
})
