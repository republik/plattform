const { Roles } = require('@orbiting/backend-modules-auth')

const eligibleRoles = ['admin', 'associate']

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
  isEligible,
  numEligible
}
