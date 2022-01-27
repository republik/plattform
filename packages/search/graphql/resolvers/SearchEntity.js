module.exports = {
  __resolveType(obj) {
    return obj.__type || (obj._raw && obj._raw.__type)
  },
}
