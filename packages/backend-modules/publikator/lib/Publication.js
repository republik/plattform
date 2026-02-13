const { Queue } = require('@orbiting/backend-modules-job-queue')
const { upsert: upsertDiscussion } = require('./Discussion')

/**
 * Shared post-publish finalization for both instant and scheduled publications.
 * Call after the DB transaction and elasticsearch indexing are complete.
 *
 * @param {object} options
 * @param {string} options.repoId - The repository ID
 * @param {boolean} options.prepublication - Whether this is a prepublication
 * @param {string[]|null} options.notifyFilters - Notification filters, or null to skip notifications
 * @param {object|null} options.meta - Document meta for discussion upsert, or null to skip
 * @param {object} options.context - The GraphQL/connection context
 */
async function finalizePublication({
  repoId,
  prepublication,
  notifyFilters,
  meta,
  context,
}) {
  const { pubsub } = context

  if (context.loaders?.Document?.byRepoId) {
    await context.loaders.Document.byRepoId.clear(repoId)
  }

  if (!prepublication && meta) {
    await upsertDiscussion(meta, context)
  }

  if (!prepublication && notifyFilters) {
    await Queue.getInstance().send('scheduler:publication:notify', {
      repoId,
      notifyFilters,
    })
  }

  await pubsub.publish('repoUpdate', {
    repoUpdate: { id: repoId },
  })
}

module.exports = { finalizePublication }
