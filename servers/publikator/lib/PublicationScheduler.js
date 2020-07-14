const debug = require('debug')('publikator:lib:scheduler')
const Promise = require('bluebird')
const {
  intervalScheduler
} = require('@orbiting/backend-modules-schedulers')
const indices = require('@orbiting/backend-modules-search/lib/indices')
const index = indices.dict.documents
const { getIndexAlias } = require('@orbiting/backend-modules-search/lib/utils')
const { handleRedirection } = require('./Document')
const {
  latestPublications: getLatestPublications,
  meta: getRepoMeta
} = require('../graphql/resolvers/Repo')
const {
  upsertRef,
  deleteRef
} = require('./github')
const { upsert: repoCacheUpsert } = require('./cache/upsert')
const { notifyPublish } = require('./Notifications')
const { upsert: upsertDiscussion } = require('./Discussion')

const lockTtlSecs = 10 // 10 seconds

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
            { term: { '__state.prepublished': false } }
          ]
        }
      }
    }
  })

  return body.hits.hits.map(hit => hit._source)
}

const init = async (context) => {
  debug('init')

  const scheduler = await intervalScheduler.init({
    name: 'publication',
    context,
    runFunc: async (args, context) => {
      const { pgdb, redis, elastic } = context

      const docs = await getScheduledDocuments(elastic)

      if (docs.length > 0) {
        debug('scheduled documents found', docs.length)
      }

      await Promise.each(docs, async doc => {
        // repos:republik/article-briefing-aus-bern-14/scheduled-publication
        const repoId = doc.meta.repoId
        const prepublication = doc.meta.prepublication
        const scheduledAt = doc.meta.scheduledAt
        const notifySubscribers = doc.meta.notifySubscribers

        const ref = `scheduled-${prepublication ? 'prepublication' : 'publication'}`
        console.log(`scheduler: publishing ${repoId}`)

        const newRef = ref.replace('scheduled-', '')
        const newRefs = [newRef]

        const { lib: { Documents: { createPublish } } } =
          require('@orbiting/backend-modules-search')

        const publish = createPublish({
          prepublication,
          scheduledAt,
          elasticDoc: doc,
          elastic,
          redis
        })

        if (newRef === 'publication') {
          await handleRedirection(repoId, doc.content.meta, { elastic, pgdb })
          newRefs.push('prepublication')
        }

        await Promise.all([
          publish.afterScheduled(),
          ...newRefs.map(_ref =>
            upsertRef(
              repoId,
              `tags/${_ref}`,
              doc.milestoneCommitId
            )
          ),
          deleteRef(
            repoId,
            `tags/${ref}`,
            true
          )
        ])
          .catch(e => {
            console.error('Error: one or more promises failed:')
            console.error(e)
          })

        // flush dataloaders
        await context.loaders.Document.byRepoId.clear(repoId)

        await repoCacheUpsert({
          id: repoId,
          meta: await getRepoMeta({ id: repoId }, null, context),
          publications: await getLatestPublications({ id: repoId }, null, context)
        }, context)

        await upsertDiscussion(doc.meta, context)

        if (notifySubscribers && !prepublication) {
          await notifyPublish(repoId, context)
            .catch(e => {
              console.error('error in notifyPublish', e)
            })
        }

        debug(
          'published', {
            repoId: doc.meta.repoId,
            versionName: doc.versionName,
            scheduledAt: doc.meta.scheduledAt,
            refs: newRefs
          }
        )
      })
    },
    lockTtlSecs,
    runIntervalSecs: lockTtlSecs
  })

  const close = async () => {
    await scheduler.close()
  }

  return {
    close
  }
}

module.exports = {
  init
}
