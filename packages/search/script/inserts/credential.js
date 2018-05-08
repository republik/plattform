const bulk = require('../../lib/indexPgTable')

module.exports = async ({ pgdb, ...rest }) => {
  const resource = { table: pgdb.public.credentials }
  return bulk.index({ resource, ...rest })
}
