const debug = require('debug')('statistics:lib:elastic:documents')

const utils = require('@orbiting/backend-modules-search/lib/utils')

const toPath = url => url.replace('https://www.republik.ch', '')

const findByPaths = async ({ paths = [], props = ['meta'] }, { elastic }) => {
  debug('findByPaths() %o', { paths })

  const results = await elastic.search({
    index: utils.getIndexAlias('document', 'read'),
    _source: props,
    size: paths.length * 2,
    body: {
      query: {
        bool: {
          must: [
            { terms: { 'meta.path.keyword': paths } },
            { term: { '__state.published': true } }
          ]
        }
      }
    }
  })

  return results.hits && results.hits.hits && results.hits.hits.map(hit => hit._source)
}

module.exports = (_, { elastic }) => ({
  pluck:
    async (rows) => {
      const pluckedRows = [...rows]
      const paths = rows.map(({ url }) => toPath(url))

      const documents = await findByPaths({ paths }, { elastic })

      documents.map(document => {
        const index = pluckedRows.findIndex(({ url }) => toPath(url) === document.meta.path)
        pluckedRows[index] = { ...pluckedRows[index], document }
      })

      return pluckedRows
    }
})

module.exports.toPath = toPath
module.exports.findByPaths = findByPaths
