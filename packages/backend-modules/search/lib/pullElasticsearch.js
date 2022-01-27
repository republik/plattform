const Elasticsearch = require('@orbiting/backend-modules-base/lib/Elasticsearch')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')

const inserts = require('./inserts')
const mappings = require('./indices')

const { getIndexAlias, getDateTimeIndex } = require('./utils')

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

module.exports = async ({
  indices: indicesFilter = mappings.list.map(({ name }) => name),
  switch: doSwitch = true,
  inserts: doInserts = true,
  flush: doFlush = false,
  ensurePropagation = true,
  debug: doDebug = true,
}) => {
  const debug = doDebug === false ? () => {} : console.log

  const pgdb = await PgDb.connect({
    applicationName: 'backends search pullElasticsearch',
  })
  const elastic = Elasticsearch.connect()
  const redis = Redis.connect()

  const indices = mappings.list.filter(({ name }) =>
    indicesFilter.includes(name),
  )

  await Promise.all(
    indices.map(async ({ type, name, analysis, mapping }) => {
      const readAlias = getIndexAlias(name, 'read')
      const writeAlias = getIndexAlias(name, 'write')
      const index = getDateTimeIndex(name)

      /**
       * Remove index masquerading as a write alias.
       *
       * Indices named like write aliases are inadvertantly created when
       * backends is posting data to ElasticSearch before mapping, indices
       * and aliases are setup.
       */
      const {
        body: [writeAliasAsIndex],
      } = await elastic.cat.indices({ index: `${writeAlias}*`, format: 'json' })

      if (writeAlias === writeAliasAsIndex?.index) {
        debug('delete index masquerading as alias', { writeAlias })
        await elastic.indices.delete({ index: writeAlias })
      }

      if (doSwitch) {
        debug('remove write alias', { writeAlias, index })
        const { body: hasWriteAlias } = await elastic.indices.existsAlias({
          name: writeAlias,
        })

        if (hasWriteAlias) {
          await elastic.indices.updateAliases({
            body: {
              actions: [{ remove: { index: '_all', alias: writeAlias } }],
            },
          })
        }
      }

      debug('creating index', { writeAlias, index })

      const aliases = {}

      if (doSwitch) {
        Object.assign(aliases, { [writeAlias]: {} })
      }

      await elastic.indices
        .create({
          index,
          /**
           * In [ElasticSearch] 6.8, the index creation, index template,
           * and mapping APIs support a query string parameter
           * (include_type_name) which indicates whether requests and
           * responses should include a type name. It defaults to true,
           * and should be set to an explicit value to prepare to upgrade
           * to 7.0. Not setting include_type_name will result in a
           * deprecation warning. Indices which don’t have an explicit
           * type will use the dummy type name _doc.
           *
           * @see https://www.elastic.co/guide/en/elasticsearch/reference/current/removal-of-types.html
           */
          include_type_name: true,
          body: {
            aliases,
            mappings: {
              ...mapping,
            },
            settings: {
              number_of_shards: 5,
              analysis,
              // Disable refresh_interval to allow speedier bulk operations
              refresh_interval: -1,
            },
          },
        })
        .catch((e) => {
          console.error(
            `Error while creating index "%s" occured: %o`,
            index,
            e.meta.body,
          )
          throw new Error(`Error while creating index`)
        })

      if (doInserts) {
        if (inserts.dict[name].before) {
          debug('before populating index...', { writeAlias, index })
          await inserts.dict[name].before({
            indexName: index,
            type,
            elastic,
            pgdb,
            redis,
          })
        }

        debug('populating index', { writeAlias, index })
        await inserts.dict[name].insert({
          indexName: index,
          type,
          elastic,
          pgdb,
          redis,
        })
      }

      debug('enabeling refresh', { writeAlias, index })
      await elastic.indices.putSettings({
        index,
        body: {
          refresh_interval: null, // Reset refresh_interval to default
        },
      })

      if (ensurePropagation) {
        debug('waiting grace period', { writeAlias, index })
        await timeout(1000 * 5)
      }

      if (doInserts && inserts.dict[name].after) {
        debug('after populating index...', { writeAlias, index })
        await inserts.dict[name].after({
          indexName: index,
          type,
          elastic,
          pgdb,
          redis,
        })

        if (ensurePropagation) {
          debug('waiting grace period', { writeAlias, index })
          await timeout(1000 * 5)
        }
      }

      if (doSwitch) {
        debug('switch read alias', { readAlias, index })
        await elastic.indices.updateAliases({
          body: {
            actions: [
              { remove: { index: '_all', alias: readAlias } },
              { add: { index, alias: readAlias } },
            ],
          },
        })
      }

      debug('call final', { readAlias, index })
      await inserts.dict[name].final({
        indexName: index,
        type,
        elastic,
        pgdb,
        redis,
      })

      const { body: indices } = await elastic.indices.getAlias({
        index: getIndexAlias(name, '*'),
      })

      const deletable = []

      Object.keys(indices).forEach((name) => {
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
          index: deletable,
        })
      }
    }),
  )
}
