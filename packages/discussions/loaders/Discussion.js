const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  clear: async (id) => {
    const discussion =
      await context.loaders.Discussion.byId(id) ||
      await context.loaders.Discussion.byRepoId(id)
    if (discussion) {
      context.loaders.Discussion.byId.clear(discussion.id)
      context.loaders.Discussion.byRepoId.clear(discussion.repoId)
    }
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
