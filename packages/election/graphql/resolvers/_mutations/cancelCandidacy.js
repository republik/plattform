const getElections = require('../../../lib/getElections')

const {
  Roles,
  ensureSignedIn
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, { slug }, { pgdb, user: me, req }) => {
  ensureSignedIn(req)
  Roles.ensureUserIsInRoles(me, ['admin'])

  const election = await getElections(pgdb, me, {slug})[0]
  if (!election) {
    throw new Error(`No election for slug ${slug}`)
  }
  await pgdb.public.electionCandidacies.deleteOne({userId: me.id, electionId: election.id})
  return getElections(pgdb, me, {slug})[0]
}
