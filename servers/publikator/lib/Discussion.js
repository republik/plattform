const upsert = async (repoMeta, docMeta, context) => {
  const { pgdb } = context

  const settings = {
    title: docMeta.title,
    documentPath: docMeta.path,
    ...docMeta.commentsMaxLength
      ? { maxLength: docMeta.commentsMaxLength }
      : { },
    ...docMeta.commentsMinInterval
      ? { minInterval: docMeta.commentsMinInterval }
      : { },
    ...docMeta.anonymity
      ? { anonymity: docMeta.discussionAnonymity }
      : { }
  }

  let discussion

  if (repoMeta.discussionId) {
    discussion = await pgdb.public.discussions.findOne({ id: repoMeta.discussionId })
  }

  if (!discussion) {
    discussion = await pgdb.public.discussions.insertAndGet(
      repoMeta.discussionId
        ? {
          id: repoMeta.discussionId,
          ...settings
        }
        : settings,
      { skipUndefined: true }
    )
  }

  if (
    discussion.title !== settings.title ||
    discussion.maxLength !== settings.maxLength ||
    discussion.minInterval !== settings.minInterval ||
    discussion.anonymity !== settings.anonymity
  ) {
    await pgdb.public.discussions.update(
      { id: discussion.id },
      settings
    )
  }

  return discussion.id
}

module.exports = {
  upsert
}
