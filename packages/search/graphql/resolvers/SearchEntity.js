module.exports = {
  __resolveType (obj) {
    return obj.__type || obj._raw.__type
  }
}
