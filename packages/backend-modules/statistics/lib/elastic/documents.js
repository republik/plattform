const debug = require('debug')('statistics:lib:elastic:documents')

const utils = require('@orbiting/backend-modules-search/lib/utils')

const toPath = (url) => url.replace('https://www.republik.ch', '')

const find = async ({ props = ['meta'], must = [] }, { elastic }) => {
  debug('find() %o', { props })

  const res = await elastic.search({
    index: utils.getIndexAlias('document', 'read'),
    _source: props,
    size: 10000,
    body: {
      query: {
        bool: {
          must: [{ term: { '__state.published': true } }, ...must],
        },
      },
    },
  })

  return res?.hits?.hits?.map((hit) => hit._source)
}

const findByPaths = async ({ paths = [], props = ['meta'] }, { elastic }) => {
  debug('findByPaths() %o', { paths })

  return find(
    { must: [{ terms: { 'meta.path.keyword': paths } }], props },
    { elastic },
  )
}

module.exports = (_, { elastic }) => ({
  pluck: async (rows) => {
    const pluckedRows = [...rows]
    const paths = rows.map(({ url }) => toPath(url))

    const documents = await findByPaths({ paths }, { elastic })

    documents.forEach((document) => {
      const index = pluckedRows.findIndex(
        ({ url }) => toPath(url) === document.meta.path,
      )
      pluckedRows[index] = { ...pluckedRows[index], document }
    })

    return pluckedRows
  },
})

module.exports.toPath = toPath
module.exports.find = find
module.exports.findByPaths = findByPaths
