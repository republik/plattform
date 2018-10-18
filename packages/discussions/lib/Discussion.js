const upsert = async (id, settings = {}, pgdb) => {
  let discussion

  if (id) {
    discussion = await pgdb.public.discussions.findOne({ id })
  }

  if (!discussion) {
    discussion = await pgdb.public.discussions.insertAndGet(
      id
        ? {
          id,
          ...settings
        }
        : settings,
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
        { id },
        settings
      )
    }
  }

  return discussion
}

module.exports = {
  upsert
}
