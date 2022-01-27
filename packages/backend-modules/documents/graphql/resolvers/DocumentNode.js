module.exports = {
  id(docNode) {
    if (!docNode.data.id) {
      console.error('No id found for node', docNode)
      return null
    }
    return docNode.data.id
  },
  body(docNode) {
    return docNode
  },
}
