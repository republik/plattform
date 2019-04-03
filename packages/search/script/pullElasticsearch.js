require('@orbiting/backend-modules-env').config()
const debug = require('debug')('search:scripts:pullElasticsearch')

const yargs = require('yargs')

const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')

const inserts = require('./inserts')
const mappings = require('../lib/indices')
const { getIndexAlias, getDateTimeIndex } = require('../lib/utils')

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))

const elastic = Elasticsearch.connect()
const redis = Redis.connect()

const argv = yargs
  .option('indices', {
    alias: ['i', 'index'],
    array: true,
    default: mappings.list.map(({ name }) => name),
    choices: mappings.list.map(({ name }) => name)
  })
  .option('switch', {
    alias: 's',
    boolean: true,
    default: true
  })
  .option('inserts', {
    boolean: true,
    default: true
  })
  .option('flush', {
    boolean: true,
    default: false
  })
  .help()
  .version()
  .argv

PgDb.connect().then(async pgdb => {
  const indices = mappings.list
    .filter(({ name }) => argv.indices.includes(name))
  await Promise.all(indices.map(async ({ type, name, analysis, mapping }) => {
    const readAlias = getIndexAlias(name, 'read')
    const writeAlias = getIndexAlias(name, 'write')
    const index = getDateTimeIndex(name)

    if (argv.switch) {
      debug('remove write alias', { writeAlias, index })
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
    }

    debug('creating index', { writeAlias, index })

    const aliases = {}

    if (argv.switch) {
      Object.assign(aliases, { [writeAlias]: {} })
    }

    await elastic.indices.create({
      index,
      body: {
        aliases,
        mappings: {
          ...mapping
        },
        settings: {
          analysis,
          // Disable refresh_interval to allow speedier bulk operations
          refresh_interval: -1
        }
      }
    })

    if (argv.inserts) {
      if (inserts.dict[name].before) {
        debug('before populating index...', { writeAlias, index })
        await inserts.dict[name].before({
          indexName: index,
          type,
          elastic,
          pgdb,
          redis
        })
      }

      debug('populating index', { writeAlias, index })
      await inserts.dict[name].insert({
        indexName: index,
        type,
        elastic,
        pgdb,
        redis
      })
    }

    debug('enabeling refresh', { writeAlias, index })
    await elastic.indices.putSettings({
      index,
      body: {
        refresh_interval: null // Reset refresh_interval to default
      }
    })

    debug('waiting grace period', { writeAlias, index })
    await timeout(1000 * 5)

    if (argv.inserts && inserts.dict[name].after) {
      debug('after populating index...', { writeAlias, index })
      await inserts.dict[name].after({
        indexName: index,
        type,
        elastic,
        pgdb,
        redis
      })

      debug('waiting grace period', { writeAlias, index })
      await timeout(1000 * 5)
    }

    if (argv.switch) {
      debug('switch read alias', { readAlias, index })
      await elastic.indices.updateAliases({
        body: {
          actions: [
            { remove: { index: '_all', alias: readAlias } },
            { add: { index, alias: readAlias } }
          ]
        }
      })
    }

    const indices = await elastic.indices.getAlias({
      index: getIndexAlias(name, '*')
    })

    const deletable = []

    Object.keys(indices).forEach(name => {
      if (Object.keys(indices[name].aliases).length === 0) {
        if (name !== index) {
          deletable.push(name)
        }
      }
    })

    debug('deletable indices', deletable)

    if (argv.flush && deletable.length > 0) {
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
