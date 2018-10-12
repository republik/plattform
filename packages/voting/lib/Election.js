const { buildQueries } = require('./queries.js')
const queries = buildQueries('elections')

const slugExists = async (slug, pgdb) => {
  return !!(await pgdb.public.elections.findFirst({
    slug
  }))
}

const create = async (input, pgdb) =>
  pgdb.public.elections.insertAndGet(input)

module.exports = {
  ...queries,
  slugExists,
  create
}
