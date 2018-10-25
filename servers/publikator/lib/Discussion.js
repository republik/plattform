const { Discussion: { upsert: upsertDiscussion } } = require('@orbiting/backend-modules-discussions')

const upsert = async (repoMeta, docMeta, context) => {
  const { pgdb } = context

  const settings = {
    title: docMeta.title,
    documentPath: docMeta.path,
    collapsable: !!docMeta.collapsable,
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

  const discussion = await upsertDiscussion(repoMeta.discussionId, settings, pgdb)
  return discussion.id
}

module.exports = {
  upsert
}
