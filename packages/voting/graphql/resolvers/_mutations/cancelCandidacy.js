const { Roles } = require('@orbiting/backend-modules-auth')
const { findBySlug } = require('../../../lib/Election')

module.exports = async (_, { slug }, { pgdb, user: me, t }) => {
  Roles.ensureUserIsInRoles(me, ['admin'])

  const election = await findBySlug(slug, pgdb)
  if (!election) {
    throw new Error(t('api/election/404'))
  }

  const now = new Date()
  if (election.beginDate <= now) {
    throw new Error('api/election/candidacy/tooLate')
  }

  await pgdb.public.electionCandidacies.deleteOne({
    userId: me.id,
    electionId: election.id,
  })

  return election
}
