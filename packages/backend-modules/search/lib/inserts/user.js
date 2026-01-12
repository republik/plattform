const bulk = require('../../lib/indexPgTable')

async function transform(row) {
  row.__sort = {
    date: row.createdAt,
  }

  const credential =
    (await this.payload.getCredentials(row.id))?.description.trim() || null

  row.resolved = {
    credential,
  }

  row.name = [row.firstName, row.lastName].join(' ').trim()

  return row
}

const getDefaultResource = async ({ pgdb }) => {
  return {
    table: pgdb.public.users,
    payload: {
      getCredentials: async (userId) =>
        pgdb.public.credentials.findOne(
          { userId, isListed: true },
          { fields: ['id', 'userId', 'description', 'isListed'], limit: 1 },
        ),
    },
    transform,
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
