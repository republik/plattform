module.exports = async (_, { id, path }, { loaders }) => {
  if (id) {
    return loaders.Discussion.byId.load(id)
  } else if (path) {
    return loaders.Discussion.byPath.load(path)
  }
  throw new Error('discussion id or path needed')
}
