require('@orbiting/backend-modules-env').config()

const elasticsearch = require('@orbiting/backend-modules-base/lib/elastic')
const redis = require('@orbiting/backend-modules-base/lib/redis')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')

const mdastToString = require('mdast-util-to-string')
const {
  graphql: { resolvers: {
    queries: {
      documents: getDocuments
    }
  }},
  lib: { meta: { getStaticMeta } }
} = require('@orbiting/backend-modules-documents')
const util = require('util')

const elastic = elasticsearch.client()

const INDEX = 'documents'
const documentIndex = require('../../../db/elastic/indices/documents')

PgDb.connect().then(async pgdb => {
  await elastic.ping({
    requestTimeout: 1000
  })

  await elastic.indices.delete({
    index: INDEX,
    ignoreUnavailable: true
  })

  await elastic.indices.create({
    index: INDEX,
    body: documentIndex
  })

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
        // const content = Document.content(d, {}, context)
        // const meta = Document.meta(d, {}, context)
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
            meta: {
              ...meta,
              series,
              seriesMaster,
              authors: meta.credits && meta.credits
                .filter(c => c.type === 'link')
                .map(a => a.children[0].value)
            },
            repoId: d.repoId,
            contentString: mdastToString(d.content),
            content: d.content
          }
        }
      })
    )

  for (let doc of documents) {
    console.log(doc.body.meta.path, doc.body.meta.title)
    console.log(util.inspect(doc.body.meta, {depth: null}))
    console.log('--------------------------------')
    await elastic.create({
      index: INDEX,
      type: 'document',
      ...doc
    })
  }
}
).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
