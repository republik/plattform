const _ = require('lodash')
const { Roles } = require('@orbiting/backend-modules-auth')

const eligibleRoles = ['admin', 'associate']

const slugExists = async (slug, pgdb) => {
  return !!(await pgdb.public.votings.findFirst({
    slug
  }))
}

const create = async (input, pgdb) => {
  const voting = await pgdb.public.votings.insertAndGet(
    _.omit(input, ['options'])
  )

  await Promise.all(
    input.options.map(option =>
      pgdb.public.votingOptions.insert({
        votingId: voting.id,
        ...option
      })
    )
  )

  return {
    ...voting,
    options: input.options
  }
}

const isEligible = async (userId, pgdb) => {
  if (!userId) { return false }

  const user = await pgdb.public.users.findOne({ id: userId })
  if (!user) { return false }

  return Roles.userIsInRoles(user, eligibleRoles)
}

const numEligible = async (pgdb) =>
  pgdb.public.users.count({
    'roles @>': eligibleRoles
  })

module.exports = {
  slugExists,
  create,
  isEligible,
  numEligible
}
