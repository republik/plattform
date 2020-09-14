const { Roles } = require('@orbiting/backend-modules-auth')

const { upsert } = require('../../../lib/db')
const { findBySlug } = require('../../../lib/Election')
const { findById } = require('../../../lib/Candidacy')
const mailLib = require('../../../lib/mail')

module.exports = async (_, { slug }, { pgdb, user: me, t }) => {
  Roles.ensureUserIsInRoles(me, ['admin', 'associate'])

  const election = await findBySlug(slug, pgdb)
  if (!election) {
    throw new Error(t('api/election/404'))
  }

  const now = new Date()
  if (election.candidacyEndDate <= now || election.beginDate <= now) {
    throw new Error(t('api/election/candidacy/tooLate'))
  }
  if (election.candidacyBeginDate > now) {
    throw new Error(t('api/election/candidacy/tooEarly'))
  }

  const { entity: comment } = await upsert(
    pgdb.public.comments,
    {
      userId: me.id,
      discussionId: election.discussionId,
      content: me._raw.statement,
      hotness: 0.0,
    },
    { userId: me.id, discussionId: election.discussionId },
  )

  const { entity, isNew } = await upsert(
    pgdb.public.electionCandidacies,
    {
      userId: me.id,
      electionId: election.id,
      commentId: comment.id,
    },
    { userId: me.id, electionId: election.id },
  )

  if (isNew) {
    await mailLib.sendCandidacyConfirmation({
      user: me,
      election,
      pgdb,
      t,
    })
  }

  return findById(entity.id, pgdb)
}
