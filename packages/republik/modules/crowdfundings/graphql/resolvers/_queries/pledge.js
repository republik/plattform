const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, { id }, { pgdb, user: me }) => {
  const pledge = await pgdb.public.pledges.findOne({id: id})

  if (pledge.status === 'DRAFT') {
    return pledge
  }

  const user = await pgdb.public.users.findOne({ id: pledge.userId })
  if (!user.verified) {
    return pledge
  }

  if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
    return pledge
  }
}
