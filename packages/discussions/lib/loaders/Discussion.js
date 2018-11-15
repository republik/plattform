const DataLoader = require('dataloader')

module.exports = (context) => ({
  byId: new DataLoader( ids =>
    context.pgdb.public.discussions.find({ id: ids })
  ),
  Commenter: {
    discussionPreferences: new DataLoader( async (keyObjs) => {
      console.log('load discussionPreferences')
      const discussionId = keyObjs[0].discussionId
      const userIds = keyObjs.map( o => o.userId )
      return context.pgdb.public.discussionPreferences.find({
        userId: userIds,
        discussionId: discussionId
      })
        .then( dps => dps
          .map( async (dp) => ({
            ...dp,
            // must not called with null
            credential: dp.credentialId && await context.loaders.User.credential.load(dp.credentialId)
          }))
        )
        // bring into right order
        .then( dps => keyObjs.map( keyObj => dps.find( dp => dp.userId === keyObj.userId ) ) )
    }, {
      cacheKeyFn: key => JSON.stringify(key)
    })
  }
})
