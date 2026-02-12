const debug = require('debug')('publikator:lib:scheduler')
const { BaseWorker } = require('@orbiting/backend-modules-job-queue')
const indices = require('@orbiting/backend-modules-search/lib/indices')
const index = indices.dict.documents
const { getIndexAlias } = require('@orbiting/backend-modules-search/lib/utils')
const { handleRedirection } = require('../Document')
const {
  maybeDeclareMilestonePublished,
  updateCurrentPhase,
} = require('../postgres')
const { notifyPublish } = require('../Notifications')
const { upsert: upsertDiscussion } = require('../Discussion')

const MAX_DOCS_PER_RUN = 60

const getScheduledDocuments = async (elastic) => {
  const res = await elastic.search({
    index: getIndexAlias(index.type.toLowerCase(), 'read'),
    size: MAX_DOCS_PER_RUN,
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

  return res.hits.hits.map((hit) => hit._source)
}

class PublicationWorker extends BaseWorker {
  constructor(pgBoss, logger, context) {
    super(pgBoss, logger, context)
    this.queue = 'scheduler:publication'
    this.queueOptions = {
      policy: 'stately',
      expireInMinutes: 5,
    }
    this.options = { retryLimit: 0 }
  }

  async perform() {
    const context = this.context
    const { pgdb, redis, elastic, pubsub } = context

    const docs = await getScheduledDocuments(elastic)

    if (docs.length > 0) {
      debug('scheduled documents found', docs.length)
    }

    for (const doc of docs) {
      try {
        await this.doPublish(doc, { pgdb, redis, elastic, pubsub, context })
      } catch (err) {
        context?.logger?.error(
          {
            repoId: doc.meta.repoId,
            versionName: doc.versionName,
            error: err,
          },
          '[PublicationScheduler]: error while publishing document',
        )
      }
    }
  }

  async doPublish(doc, { pgdb, redis, elastic, pubsub, context }) {
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
  }
}

module.exports = {
  PublicationWorker,
}
