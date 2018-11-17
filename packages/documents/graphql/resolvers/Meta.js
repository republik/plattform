module.exports = {
  ownDiscussion: ({ repoId }, args, { loaders }) =>
    loaders.Discussion.byRepoId.load(repoId),
  linkedDiscussion: ({ discussion }, args, { loaders }) => {
    if (!discussion) {
      return null
    }
    const repoId = typeof discussion === 'object'
      ? discussion.meta.repoId
      : discussion
    return loaders.Discussion.byRepoId.load(repoId)
  }
}
