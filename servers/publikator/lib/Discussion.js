const { Discussion: { upsert: upsertDiscussion } } = require('@orbiting/backend-modules-discussions')

const upsert = async (discussionId, docMeta, context) => {
  const { pgdb } = context

  const settings = {
    title: docMeta.title,
    path: docMeta.path,
    repoId: docMeta.repoId,
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

  return upsertDiscussion(discussionId, settings, pgdb)
}

module.exports = {
  upsert
}
