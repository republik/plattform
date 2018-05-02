const redis = require('@orbiting/backend-modules-base/lib/redis')
const mdastToString = require('mdast-util-to-string')

const {
  graphql: { resolvers: {
    queries: {
      documents: getDocuments
    }
  }},
  lib: { meta: { getStaticMeta } }
} = require('@orbiting/backend-modules-documents')

module.exports = async ({indexName, type, elastic, pgdb}) => {
  const stats = { [type]: { added: 0, total: 0 } }
  const statsInterval = setInterval(
    () => { console.log(indexName, stats) },
    1 * 1000
  )

  const context = {
    redis,
    pgdb,
    user: {
      name: 'publikator-pullredis',
      email: 'ruggedly@republik.ch',
      roles: [ 'editor' ]
    }
  }
  // if no arguments are given, getDocuments returns all
  const documents = await getDocuments(null, {}, context)
    .then(docs => docs.nodes
      .map(d => {
        const meta = {
          ...d.content.meta,
          ...getStaticMeta(d)
        }
        const seriesMaster = typeof meta.series === 'string'
          ? meta.series
          : null
        const series = typeof meta.series === 'object'
          ? meta.series
          : null
        if (series) {
          series.episodes.forEach(e => {
            if (e.publishDate === '') {
              e.publishDate = null
            }
          })
        }
        return {
          id: d.id,
          body: {
            type,
            repoId: d.repoId,
            content: d.content,
            contentString: mdastToString(d.content),
            meta: {
              ...meta,
              repoId: d.repoId,
              series,
              seriesMaster
            }
          }
        }
      })
    )

  stats[type].total = documents.length
  for (let doc of documents) {
    // const util = require('util')
    // console.log(doc.body.meta.path, doc.body.meta.title)
    // console.log(util.inspect(doc.body.meta, {depth: null}))
    // console.log('--------------------------------')
    await elastic.create({
      ...doc,
      index: indexName,
      type
    })
    stats[type].added++
  }

  clearInterval(statsInterval)

  console.log(indexName, stats)
}
