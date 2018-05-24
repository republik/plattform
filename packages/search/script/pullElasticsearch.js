require('@orbiting/backend-modules-env').config()
const debug = require('debug')('search:scripts:pullElasticsearch')

const elasticsearch = require('@orbiting/backend-modules-base/lib/elastic')
const PgDb = require('@orbiting/backend-modules-base/lib/pgdb')

const inserts = require('./inserts')
const mappings = require('../lib/indices')
const { getIndexAlias, getIndexDated } = require('../lib/utils')

const elastic = elasticsearch.client()

const flush = process.argv[2] === '--flush'

PgDb.connect().then(async pgdb => {
  await Promise.all(mappings.list.map(async ({ type, name, mapping }) => {
    const readAlias = getIndexAlias(name, 'read')
    const writeAlias = getIndexAlias(name, 'write')
    const index = getIndexDated(name)

    debug('updating write alias', { writeAlias, index })
    const hasWriteAlias = await elastic.indices.existsAlias({
      name: writeAlias
    })

    if (hasWriteAlias) {
      await elastic.indices.updateAliases({
        body: {
          actions: [
            { remove: { index: '_all', alias: writeAlias } }
          ]
        }
      })
    }

    debug('creating index', { writeAlias, index })
    await elastic.indices.create({
      index,
      body: {
        aliases: {
          [writeAlias]: {}
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

    debug('populating index', { writeAlias, index })
    await inserts.dict[name]({
      indexName: index,
      type,
      elastic,
      pgdb
    })

    debug('enabeling refresh', { writeAlias, index })
    await elastic.indices.putSettings({
      index,
      body: {
        refresh_interval: null // Reset refresh_interval to default
      }
    })

    debug('updating read alias', { readAlias, index })
    await elastic.indices.updateAliases({
      body: {
        actions: [
          { remove: { index: '_all', alias: readAlias } },
          { add: { index, alias: readAlias } }
        ]
      }
    })

    const indices = await elastic.indices.getAlias({
      index: getIndexAlias(name, '*')
    })

    const deletable = []

    Object.keys(indices).forEach(name => {
      if (Object.keys(indices[name].aliases).length === 0) {
        deletable.push(name)
      }
    })

    debug('unlinked indices', deletable)

    if (flush) {
      debug('deleting indices')
      await elastic.indices.delete({
        index: deletable
      })
    }
  }))
}
).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
