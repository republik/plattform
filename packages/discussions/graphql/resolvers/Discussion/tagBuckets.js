module.exports = async (discussion, _, context) => {
  const { loaders } = context
  return loaders.Discussion.byIdCommentTagsCount.load(discussion.id)
}
