const Roles = require('../../../lib/Roles')
const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { resolveUser } = require('../../../lib/Users')
const userAccessRoles = ['admin', 'supporter']
const transformUser = require('../../../lib/transformUser').default

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  const userId = args.userId || me.id

  const user = await resolveUser({
    userId,
    pgdb,
  })

  Roles.ensureUserIsMeOrInRoles(user, me, userAccessRoles)

  await pgdb.query(`SELECT roll_user_access_key(:userId)`, { userId: user.id })

  return transformUser(await pgdb.public.users.findOne({ id: user.id }))
}
