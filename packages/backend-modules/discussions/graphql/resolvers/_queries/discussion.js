module.exports = async (_, { id, path }, { loaders }) => {
  if (id) {
    return loaders.Discussion.byId.load(id)
  } else if (path) {
    const d = await loaders.Discussion.byPath.load(path)
    console.log(d)
    return loaders.Discussion.byPath.load(path)
  }
  throw new Error('discussion id or path needed')
}
