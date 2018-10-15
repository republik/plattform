const _ = require('lodash')

const { buildQueries } = require('./queries.js')
const queries = buildQueries('votings')
const {
  findBySlug,
  insertAllowedMemberships
} = queries

const create = async (input, pgdb) => {
  const voting = await pgdb.public.votings.insertAndGet(
    _.omit(input, ['options', 'allowedMemberships'])
  )

  if (input.options && input.options.length > 0) {
    await Promise.all(
      input.options.map(option =>
        pgdb.public.votingOptions.insert({
          votingId: voting.id,
          ...option
        })
      )
    )
  }

  if (input.allowedMemberships && input.allowedMemberships.length > 0) {
    await insertAllowedMemberships(voting.id, input.allowedMemberships, pgdb)
  }

  return findBySlug(input.slug, pgdb)
}

module.exports = {
  ...queries,
  create
}
