const debug = require('debug')('publikator:cache:search')
const elasticsearch = require('@orbiting/backend-modules-base/lib/elastic')
const utils = require('@orbiting/backend-modules-search/lib/utils')

const client = elasticsearch.client()

const find = async (args) => {
  debug(args)

  const fields = {
    'contentMeta.description': {},
    'contentMeta.facebookDescription': {},
    'contentMeta.facebookTitle': {},
    'contentMeta.format': {},
    'contentMeta.slug': {},
    'contentMeta.subject': {},
    'contentMeta.template': {},
    'contentMeta.title': {},
    'contentMeta.twitterDescription': {},
    'contentMeta.twitterTitle': {},
    'contentString': {},
    'id': {}
  }

  const query = {
    bool: { must: [] }
  }

  if (args.search) {
    query.bool.must.push(
      { simple_query_string: {
        query: args.search,
        fields: Object.keys(fields),
        default_operator: 'AND'
      } }
    )
  }

  if (args.template) {
    query.bool.must.push(
      { term: { 'contentMeta.template': args.template } }
    )
  }

  if (Object.keys(query.bool.must).length < 1) {
    delete query.bool
    query.match_all = {}
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
