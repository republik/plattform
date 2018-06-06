module.exports = {
  id (docNode) {
    if (!docNode.data.id) {
      return Date.now()
    }
    return docNode.data.id
  },
  body (docNode) {
    return docNode
  }
}
