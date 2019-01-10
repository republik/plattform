const createDataLoader = require('@orbiting/backend-modules-dataloader')
const isUUID = require('is-uuid')

module.exports = (context) => ({
  clear: async (id) => {
    const discussion = id && isUUID.v4(id)
      ? await context.loaders.Discussion.byId.load(id)
      : await context.loaders.Discussion.byRepoId.load(id)
    if (discussion) {
      if (discussion.id) {
        context.loaders.Discussion.byId.clear(discussion.id)
      }
      if (discussion.repoId) {
        context.loaders.Discussion.byRepoId.clear(discussion.repoId)
      }
    }
    context.loaders.Discussion.byId.clear(id)
    context.loaders.Discussion.byRepoId.clear(id)
  },
  byId: createDataLoader(ids =>
    context.pgdb.public.discussions.find({
      id: ids,
      hidden: false
    })
  ),
  byRepoId: createDataLoader(
    repoIds =>
      context.pgdb.public.discussions.find({
        repoId: repoIds,
        hidden: false
      }),
    null,
    (key, rows) => rows.find(row => row.repoId === key)
  ),
  Commenter: {
    discussionPreferences: createDataLoader(keyObjs =>
      context.pgdb.public.discussionPreferences.find({
        or: keyObjs.map(keyObj => ({
          and: keyObj
        }))
      })
        .then(dps => dps
          .map(async (dp) => ({
            ...dp,
            credential: dp.credentialId && await context.loaders.User.credential.load(dp.credentialId)
          }))
        )
    )
  }
})
