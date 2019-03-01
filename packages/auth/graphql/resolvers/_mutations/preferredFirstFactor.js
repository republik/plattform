const Roles = require('../../../lib/Roles')
const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { setPreferredFirstFactor } = require('../../../lib/Users')
const transformUser = require('../../../lib/transformUser')

const {
  resolveUser,
  UserNotFoundError
} = require('../../../lib/Users')

module.exports = async (_, { userId: foreignUserId, tokenType }, { pgdb, req, user: me }) => {
  ensureSignedIn(req)

  const user = await resolveUser({ userId: foreignUserId || me.id, pgdb })
  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter', 'admin'])
  if (!user) {
    throw new UserNotFoundError({ foreignUserId })
  }

  return setPreferredFirstFactor(user, tokenType, pgdb)
    .then(transformUser)
}
