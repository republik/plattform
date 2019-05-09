const debug = console.log

const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')

const inserts = require('./inserts')
const mappings = require('./indices')

const { getIndexAlias, getDateTimeIndex } = require('./utils')

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = async ({
  indices: indicesFilter = mappings.list.map(({ name }) => name),
  switch: doSwitch = true,
  inserts: doInserts = true,
  flush: doFlush = false
}) => {
  const pgdb = await PgDb.connect()
  const elastic = Elasticsearch.connect()
  const redis = Redis.connect()

  const indices = mappings.list
    .filter(({ name }) => indicesFilter.includes(name))

  await Promise.all(indices.map(async ({ type, name, analysis, mapping }) => {
    const readAlias = getIndexAlias(name, 'read')
    const writeAlias = getIndexAlias(name, 'write')
    const index = getDateTimeIndex(name)

    if (doSwitch) {
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

    if (doSwitch) {
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

    if (doInserts) {
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

    if (doInserts && inserts.dict[name].after) {
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

    if (doSwitch) {
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

    if (doFlush && deletable.length > 0) {
      debug('deleting indices')
      await elastic.indices.delete({
        index: deletable
      })
    }
  }))
}
