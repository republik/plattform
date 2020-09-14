const type = 'Repo'

module.exports = {
  type,
  name: type.toLowerCase(),
  searchable: false,
  mapping: {
    [type]: {
      dynamic: true,
      properties: {},
    },
  },
}
