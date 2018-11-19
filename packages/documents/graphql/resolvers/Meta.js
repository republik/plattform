module.exports = {
  ownDiscussion: ({ repoId }, args, { loaders }) =>
    loaders.Discussion.byRepoId.load(repoId),
  linkedDiscussion: ({ discussion }, args, { loaders }) => {
    if (!discussion) {
      return null
    }
    let repoId
    if (typeof discussion === 'string') {
      repoId = discussion.replace('https://github.com/', '')
    } else if (discussion.meta && discussion.meta.repoId) {
      repoId = discussion.meta.repoId
    }
    if (repoId) {
      return loaders.Discussion.byRepoId.load(repoId)
    }
    return null
  }
}
