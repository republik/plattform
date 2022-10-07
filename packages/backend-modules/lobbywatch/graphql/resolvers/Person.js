module.exports = {
  __resolveType(data, _, info) {
    const [type] = data.id.split('-')
    return info.schema.getType(type)
  },
}
