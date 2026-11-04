module.exports = {
  async document(result, args, { loaders }) {
    if (result && result.document) {
      return result.document
    }
    if (!result || !result.path) {
      return null
    }

    return loaders.Document.byPath.load(result.path)
  },
}
