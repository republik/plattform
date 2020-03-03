#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const yargs = require('yargs')
const visit = require('unist-util-visit')

const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const utils = require('@orbiting/backend-modules-search/lib/utils')

const argv = yargs
  .option('path', {
    alias: 'p',
    type: 'string',
    required: true
  })
  .option('identifier', {
    alias: 'i',
    type: 'string'
  })
  .option('data-id', {
    alias: 'd',
    type: 'string'
  })
  .help()
  .version()
  .argv

const elastic = Elasticsearch.connect()

const run = async () => {
  const params = {
    index: utils.getIndexAlias('document', 'read'),
    scroll: '10s',
    size: 10,
    _source: ['meta', 'content'],
    body: {
      query: { term: { 'meta.path.keyword': argv.path } }
    }
  }

  for await (const hit of Elasticsearch.scroll(elastic, params)) {
    visit(hit._source.content, 'zone', node => {
      if (
        (!argv.identifier || node.identifier === argv.identifier) &&
        (!argv.dataId || (node.data && node.data.id === argv.dataId))
      ) {
        console.log(JSON.stringify(node.data))
      }
    })
  }

  await elastic.close()
}

run().catch(e => { throw e })
