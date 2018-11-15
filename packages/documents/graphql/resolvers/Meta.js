module.exports = {
  ownDiscussion: ({ repoId }, args, { loaders }) =>
    loaders.Discussion.byRepoId.load(repoId)
}
