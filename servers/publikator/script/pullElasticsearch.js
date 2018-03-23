require('@orbiting/backend-modules-env').config()

const redis = require('@orbiting/backend-modules-base/lib/redis')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const elasticsearch = require('elasticsearch')

const mdastToString = require('mdast-util-to-string')
const { graphql: { resolvers: {
  Document,
  queries: {
    documents: getDocuments
  }
} } } = require('@orbiting/backend-modules-documents')

const elastic = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
})

PgDb.connect().then(async pgdb => {
  await elastic.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
  })

  await elastic.indices.delete({
    index: 'documents',
    ignoreUnavailable: true
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
  const args = {
    first: 1000
  }
  const documents = await getDocuments(null, args, context)
    .then(docs => docs.nodes
      .map(d => {
        const content = Document.content(d, {}, context)
        return {
          id: d.id,
          meta: Document.meta(d, {}, context),
          content,
          contentString: mdastToString(content)
        }
      })
    )

  for (let doc of documents) {
    console.log(doc.meta.title)
    await elastic.create({
      index: 'documents',
      id: doc.id,
      type: 'document',
      body: {
        meta: doc.meta,
        content: doc.content
      }
    })
  }
}
).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
