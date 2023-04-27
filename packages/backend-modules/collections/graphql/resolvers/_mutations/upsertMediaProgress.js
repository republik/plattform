const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const Collection = require('../../../lib/Collection')
const Progress = require('../../../lib/Progress')

module.exports = async (_, { mediaId, secs }, context) => {
  const { user: me, t, req } = context

  ensureSignedIn(req)

  const collection = await Collection.byNameForUser(
    Progress.COLLECTION_NAME,
    me.id,
    context,
  )
  if (!collection) {
    throw new Error(t(`api/collections/collection/404`))
  }

  if (!(await Progress.status(me.id, context))) {
    throw new Error(t('api/collections/progress/notEnabled'))
  }

  const item = await Collection.upsertMediaItem(
    me.id,
    collection.id,
    mediaId,
    { secs },
    context,
  )

  return item
}
