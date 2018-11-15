const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byId: createDataLoader(ids =>
    context.pgdb.public.discussions.find({
      id: ids,
      hidden: false
    })
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
