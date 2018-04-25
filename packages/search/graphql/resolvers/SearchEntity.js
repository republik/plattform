module.exports = {
  __resolveType (obj) {
    // TODO better type sniffing
    if (obj.discussionId) {
      return 'Comment'
    }
    return 'Document'
  }
}
