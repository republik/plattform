const bulk = require('../indexPgTable')

const getDefaultResource = async ({ pgdb }) => {
  return {
    table: pgdb.public.questionnaireSubmissions,
  }
}

module.exports = {
  before: () => {},
  insert: async ({ resource, ...rest }) => {
    resource = Object.assign(
      await getDefaultResource({ resource, ...rest }),
      resource,
    )

    return bulk.index({ resource, ...rest })
  },
  after: () => {},
  final: () => {},
}
