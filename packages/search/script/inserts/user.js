const bulk = require('../../lib/indexPgTable')

module.exports = async ({ pgdb, ...rest }) => {
  const resource = { table: pgdb.public.users }
  return bulk.index({ resource, ...rest })
}
