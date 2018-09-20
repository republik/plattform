const debug = require('debug')('publikator:elastic:search')
const elasticsearch = require('@orbiting/backend-modules-base/lib/elastic')
const utils = require('@orbiting/backend-modules-search/lib/utils')

const client = elasticsearch.client()

const find = async (args) => {
  debug(args)

  const fields = {
    'repoId': {},
    'contentString': {},
    'contentMeta.slug': {},
    'contentMeta.title': {},
    'contentMeta.description': {},
    'latestCommit.author.name': {},
    'latestCommit.author.email': {}
  }

  const query = {
    match_all: {}
  }

  if (args.search) {
    query.bool = {
      must: {
        multi_match: {
          query: args.search,
          type: 'best_fields',
          fields: Object.keys(fields)
        }
      }
    }
  }

  if (query.bool) {
    delete query.match_all
  }

  debug({ query })

  const docs = client.search({
    index: utils.getIndexAlias('repo', 'read'),
    from: args.from,
    size: args.first,
    body: {
      // _source: ['id'],
      sort: { 'latestCommit.date': 'desc' },
      query
    }
  })

  return docs
}

module.exports = {
  find
}
