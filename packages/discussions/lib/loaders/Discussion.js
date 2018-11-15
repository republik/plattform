const createDataLoader = require('@orbiting/backend-modules-dataloader')
const uniq = require('lodash/uniq')

const getDiscussionPreferences = (discussionId, userIds, context) =>
  context.pgdb.public.discussionPreferences.find({
    userId: userIds,
    discussionId
  })
    .then(dps => dps
      .map(async (dp) => ({
        ...dp,
        credential: dp.credentialId && await context.loaders.User.credential.load(dp.credentialId)
      }))
    )

module.exports = (context) => ({
  byId: createDataLoader(ids =>
    context.pgdb.public.discussions.find({ id: ids })
  ),
  Commenter: {
    discussionPreferences: createDataLoader((keyObjs) =>
      Promise.all(
        uniq(keyObjs.map(o => o.discussionId))
          .map(discussionId => {
            const userIds = keyObjs
              .filter(o => o.discussionId === discussionId)
              .map(o => o.userId)
            return getDiscussionPreferences(discussionId, userIds, context)
          })
      )
        .then(promises => promises
          .reduce((agg, result) => agg.concat(result), [])
        )
    )
  }
})
