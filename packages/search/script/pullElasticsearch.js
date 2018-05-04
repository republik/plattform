require('@orbiting/backend-modules-env').config()

const elasticsearch = require('@orbiting/backend-modules-base/lib/elastic')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')

const inserts = require('./inserts')
const mappings = [
  require('./mapping/comments'),
  require('./mapping/credentials'),
  require('./mapping/documents'),
  require('./mapping/users')
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

const getAliasName = (type) => `republik-${type.toLowerCase()}`
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
        },
        settings: {
          // Disable refresh_interval to allow speedier bulk operations
          refresh_interval: -1
        }
      }
    })

    console.log('populating index', { alias, index })
    await inserts[type.toLowerCase()]({indexName: index, type, elastic, pgdb})

    await elastic.indices.putSettings({
      index,
      body: {
        refresh_interval: null // Reset refresh_interval to default
      }
    })
  }))

  // TODO when to remove old/previous index?
}
).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
