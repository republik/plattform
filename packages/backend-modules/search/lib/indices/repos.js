const type = 'Repo'

module.exports = {
  type,
  name: type.toLowerCase(),
  path: 'publikator.repos',
  searchable: false,
  mapping: {
    [type]: {
      dynamic: true,
      properties: {},
    },
  },
}
