const getElections = require('../../../lib/getElections')
const resolveCandidate = require('../../../lib/resolveCandidate')
const { upsert } = require('../../../lib/db')
const mailLib = require('../../../lib/mail')

const {
  Roles,
  ensureSignedIn
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, { slug }, { pgdb, user: me, req, t }) => {
  ensureSignedIn(req)
  Roles.ensureUserIsInRoles(me, ['admin', 'associate'])

  const election = (await getElections(pgdb, me, {slug}))[0]

  if (!election) {
    throw new Error(`No election for slug ${slug}`)
  }

  const { entity: comment } = await upsert(
    pgdb.public.comments,
    {
      userId: me.id,
      discussionId: election.discussion.id,
      content: me._raw.statement,
      hotness: 0.0
    },
    {userId: me.id, discussionId: election.discussion.id}
  )

  const { isNew, entity: rawCandidate } = await upsert(
    pgdb.public.electionCandidacies,
    {
      userId: me.id,
      electionId: election.id,
      commentId: comment.id
    },
    {userId: me.id, electionId: election.id}
  )

  if (isNew) {
    await mailLib.sendCandidacyConfirmation({
      user: me,
      election,
      pgdb,
      t
    })
  }

  return resolveCandidate(pgdb, rawCandidate)
}
