const debug = require('debug')('publikator:lib:scheduler')
const Promise = require('bluebird')
const { intervalScheduler } = require('@orbiting/backend-modules-schedulers')
const indices = require('@orbiting/backend-modules-search/lib/indices')
const index = indices.dict.documents
const { getIndexAlias } = require('@orbiting/backend-modules-search/lib/utils')
const { handleRedirection } = require('./Document')
const {
  maybeDeclareMilestonePublished,
  updateCurrentPhase,
} = require('./postgres')
const { notifyPublish } = require('./Notifications')
const { upsert: upsertDiscussion } = require('./Discussion')

const lockTtlSecs = 30 // increased from 10 to 30 seconds because of front publishing issues and elastic version conflict errors

const getScheduledDocuments = async (elastic) => {
  const { body } = await elastic.search({
    index: getIndexAlias(index.name, 'read'),
    size: lockTtlSecs, // Amount publishing 1 document a second
    body: {
      sort: { 'meta.scheduledAt': 'asc' },
      query: {
        bool: {
          must: [
            { term: { __type: 'Document' } },
            { range: { 'meta.scheduledAt': { lte: new Date() } } },
            { term: { '__state.published': false } },
            { term: { '__state.prepublished': false } },
          ],
        },
      },
    },
  })

  return body.hits.hits.map((hit) => hit._source)
}

const init = async (context) => {
  debug('init')

  const scheduler = await intervalScheduler.init({
    name: 'publication',
    context,
    runFunc: async () => {
      const { pgdb, redis, elastic, pubsub } = context

      const docs = await getScheduledDocuments(elastic)

      if (docs.length > 0) {
        debug('scheduled documents found', docs.length)
      }

      await Promise.each(docs, async (doc) => {
        // repos:republik/article-briefing-aus-bern-14/scheduled-publication
        const versionName = doc.versionName
        const repoId = doc.meta.repoId

        const milestone = await pgdb.publikator.milestones.findOne({
          repoId,
          name: versionName,
        })

        const prepublication = milestone.scope === 'prepublication'
        const scheduledAt = milestone.scheduledAt
        const { notifyFilters } = milestone.meta || {}

        console.log(`scheduler: publishing ${repoId}`)

        const tx = await pgdb.transactionBegin()
        try {
          await maybeDeclareMilestonePublished(milestone, tx)
          await updateCurrentPhase(repoId, tx)

          if (milestone.scope === 'publication') {
            await handleRedirection(repoId, doc.content.meta, {
              ...context,
              pgdb: tx,
            })
          }

          // do not try to generate audio on scheduled publications (for now)
          // await onPublishSyntheticReadAloud({ document: doc, pgdb: tx })

          await tx.transactionCommit()
        } catch (e) {
          await tx.transactionRollback()

          debug('rollback', { repoId })

          throw e
        }

        const {
          lib: {
            Documents: { createPublish },
          },
        } = require('@orbiting/backend-modules-search')

        const publish = createPublish({
          prepublication,
          scheduledAt,
          elasticDoc: doc,
          elastic,
          redis,
        })

        await publish.afterScheduled()

        // flush dataloaders
        await context.loaders.Document.byRepoId.clear(repoId)

        if (!prepublication) {
          await upsertDiscussion(doc.meta, context)
        }

        if (!prepublication && notifyFilters) {
          await notifyPublish(repoId, notifyFilters, context).catch((e) => {
            console.error('error in notifyPublish', e)
          })
        }

        await pubsub.publish('repoUpdate', {
          repoUpdate: {
            id: repoId,
          },
        })

        debug('published', {
          repoId: doc.meta.repoId,
          versionName: doc.versionName,
          scheduledAt: doc.meta.scheduledAt,
        })
      })
    },
    lockTtlSecs,
    runIntervalSecs: lockTtlSecs,
  })

  const close = async () => {
    await scheduler.close()
  }

  return {
    close,
  }
}

module.exports = {
  init,
}
