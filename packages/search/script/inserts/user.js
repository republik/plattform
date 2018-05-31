const _ = require('lodash')

const bulk = require('../../lib/indexPgTable')

const transform = function (row) {
  row.__sort = {
    date: row.createdAt
  }

  row.resolved = {
    credential: ''
  }

  const credential = _.find(
    this.payload.credentials,
    { userId: row.id, isListed: true }
  )

  if (credential) {
    row.resolved.credential = credential.description.trim()
  }

  row.name = `${row.firstName} ${row.lastName}`.trim()

  return row
}

module.exports = {
  before: () => {},
  insert: async ({ pgdb, ...rest }) => {
    const resource = {
      table: pgdb.public.users,
      payload: {
        credentials: await pgdb.public.credentials.find(
          {},
          {
            fields: [
              'id',
              'userId',
              'description',
              'isListed'
            ]
          }
        )
      },
      transform
    }

    return bulk.index({ resource, ...rest })
  },
  after: () => {}
}
