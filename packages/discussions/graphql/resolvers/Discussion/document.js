module.exports = async ({ repoId }, _, context) => {
  if (!repoId) {
    return null
  }
  return context.loaders.Document.byRepoId.load(repoId)
}
