const isUUID = require('is-uuid')

// id can be uuid or repoId
// on insert, specified id is not honoured
const upsert = async (id, settings = {}, { pgdb, loaders }) => {
  let discussion
  if (id) {
    if (isUUID.v4(id)) {
      discussion = await loaders.Discussion.byId.load(id)
    } else {
      discussion = await loaders.Discussion.byRepoId.load(id)
    }
  }

  if (!discussion) {
    discussion = await pgdb.public.discussions.insertAndGet(
      settings,
      { skipUndefined: true }
    )
  } else {
    if (
      (settings.title && settings.title !== discussion.title) ||
      (settings.collapsable !== undefined && settings.collapsable !== discussion.collapsable) ||
      (settings.maxLength && settings.maxLength !== discussion.maxLength) ||
      (settings.minInterval && settings.minInterval !== discussion.minInterval) ||
      (settings.anonymity && settings.anonymity !== discussion.anonymity)
    ) {
      discussion = await pgdb.public.discussions.updateAndGetOne(
        { id: discussion.id },
        settings
      )
      await loaders.Discussion.clear(discussion.id)
    }
  }

  return discussion
}

module.exports = {
  upsert
}
