module.exports = async ({ repoId }, _, context) => {
  if (!repoId) {
    return null
  }
  const doc = await context.loaders.Document.byRepoId.load(repoId)
  // The loader only knows Sanity documents, which come back as a stub without
  // mdast content and can't be resolved as a GraphQL `Document`. They're
  // exposed as `sanityDocument` instead.
  return doc?.content ? doc : null
}
