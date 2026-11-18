// Duplicated from @orbiting/backend-modules-sanity's lib/document.ts rather
// than imported: that package already depends on this one.
const SANITY_ID_PREFIX = 'sanity:'

module.exports = async ({ repoId }, _, context) => {
  if (!repoId) {
    return null
  }
  const doc = await context.loaders.Document.byRepoId.load(repoId)
  if (!doc?.sanityRef) {
    return null
  }
  return {
    id: doc.sanityRef.slice(SANITY_ID_PREFIX.length),
    type: doc.sanityType,
  }
}
