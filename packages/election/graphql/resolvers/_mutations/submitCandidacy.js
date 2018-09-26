const getElections = require('../../../lib/getElections')
const resolveCandidate = require('../../../lib/resolveCandidate')
const { upsert } = require('../../../lib/db')

const {
  Roles,
  ensureSignedIn
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, { slug }, { pgdb, user: me, req }) => {
  ensureSignedIn(req)
  Roles.ensureUserIsInRoles(me, ['admin', 'associate'])

  const elections = await getElections(pgdb, {slug})

  const election = elections[0]

  if (!election) {
    throw new Error(`No election for slug ${slug}`)
  }

  const comment = await upsert(
    pgdb.public.comments,
    {
      userId: me.id,
      discussionId: election.discussion.id,
      content: me.statement,
      hotness: 0.0
    }
  )

  const rawCandidate = await upsert(
    pgdb.public.electionCandidacies,
    {
      userId: me.id,
      electionId: election.id,
      commentId: comment.id
    },
    {userId: me.id, electionId: election.id}
  )

  return resolveCandidate(pgdb, rawCandidate)
}
