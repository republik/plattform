require('@orbiting/backend-modules-env').config()

const elasticsearch = require('@orbiting/backend-modules-base/lib/elastic')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')
const elastic = elasticsearch.client()

const documentsMapping = require('./mapping/documents')

const insertsDict = require('./inserts')
const inserts = Object.keys(insertsDict).map(key => insertsDict[key])

const flush = process.argv[2] === '--flush'

const indexName = `republik-${new Date().getTime()}`
const aliasName = 'republik'

PgDb.connect().then(async pgdb => {
  if (flush) {
    console.log('flushing all old indices...')
    await elastic.indices.delete({
      index: 'republik-*'
    })
  }

  await elastic.indices.create({
    index: indexName,
    body: {
      aliases: {
        [aliasName]: {}
      },
      mappings: {
        ...documentsMapping
      }
    }
  })

  await Promise.all(
    inserts.map(insert => insert({indexName, elastic, pgdb}))
  )

  // TODO when to remove old/previous index?
}
).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
