const upsert = async (repoMeta, docMeta, context) => {
  const { pgdb } = context

  const settings = {
    title: docMeta.title,
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

  const discussion = repoMeta.discussionId
    ? await pgdb.public.discussions.findOne({ id: repoMeta.discussionId })
    : await pgdb.public.discussions.insertAndGet(
        settings,
        { skipUndefined: true }
      )

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
