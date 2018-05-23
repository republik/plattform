const bulk = require('../../lib/indexPgTable')

module.exports = async ({ pgdb, ...rest }) => {
  const resource = {
    table: pgdb.public.users,
    transform: row => ({
      ...row,
      name: `${row.firstName} ${row.lastName}`,
      __sort: {
        date: row.createdAt
      }
    })
  }

  return bulk.index({ resource, ...rest })
}
