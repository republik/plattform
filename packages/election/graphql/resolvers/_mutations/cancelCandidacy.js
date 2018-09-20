const getElections = require('../../../lib/getElections')

const {
  Roles,
  ensureSignedIn,
  transformUser
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, { slug }, { pgdb, user: me, req }) => {
  ensureSignedIn(req)
  Roles.ensureUserIsInRoles(me, ['admin', 'associate'])

  const changed = await pgdb.public.electionCandidacies.deleteOne({userId: me.id})

  const elections = await getElections(pgdb, {slug})

  return elections[0]

}
