#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')

const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const utils = require('@orbiting/backend-modules-search/lib/utils')

const argv = yargs
  .option('string', {
    alias: 's',
    type: 'string',
    required: true
  })
  .help()
  .version()
  .argv

const stringRegEx = new RegExp(argv.string, 'ig')

const elastic = Elasticsearch.connect()

const run = async () => {
  const params = {
    index: utils.getIndexAlias('document', 'read'),
    scroll: '5s',
    size: 100,
    _source: ['meta', 'content'],
    body: {
      query: { term: { '__state.published': true } }
    }
  }

  console.log([
    'URL',
    'Publikator-URL'
  ].join('\t'))

  for await (const hit of Elasticsearch.scroll(elastic, params)) {
    const stringified = JSON.stringify(hit._source.content)
    const hasMatch = stringified.match(stringRegEx)

    if (hasMatch) {
      console.log([
        `https://www.republik.ch${hit._source.meta.path}`,
        `https://publikator.republik.ch/repo/${hit._source.meta.repoId}/tree`
      ].join('\t'))
    }
  }

  await elastic.close()
}

run().catch(e => { throw e })
