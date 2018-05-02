require('@orbiting/backend-modules-env').config()

const elasticsearch = require('@orbiting/backend-modules-base/lib/elastic')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')

const inserts = require('./inserts')
const mappings = [
  require('./mapping/documents'),
  require('./mapping/comments')
]

const elastic = elasticsearch.client()

const flush = process.argv[2] === '--flush'

// format: '2018-05-01T13-43-07'
const dateString = new Date()
  .toISOString()
  .replace(/:/g, '-')
  .split('.')
  .shift()
  .toLowerCase()

const getAliasName = (type) => `republik-${type}`
const getIndexName = (alias) => `${alias}-${dateString}`

PgDb.connect().then(async pgdb => {
  if (flush) {
    console.log('flushing all old indices...')
    await elastic.indices.delete({
      index: 'republik-*'
    })
  }

  await Promise.all(mappings.map(async mapping => {
    const type = Object.keys(mapping).shift()
    const alias = getAliasName(type)
    const index = getIndexName(alias)

    console.log('creating index', { alias, index })
    await elastic.indices.create({
      index,
      body: {
        aliases: {
          [alias]: {}
        },
        mappings: {
          ...mapping
        }
      }
    })

    console.log('populating index', { alias, index })
    await inserts[type]({indexName: index, type, elastic, pgdb})
  }))

  // TODO when to remove old/previous index?
}
).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
