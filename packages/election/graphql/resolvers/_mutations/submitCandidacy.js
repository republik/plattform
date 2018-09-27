const { Roles } = require('@orbiting/backend-modules-auth')

const { upsert } = require('../../../lib/db')
const { findBySlug } = require('../../../lib/elections')
const { findById } = require('../../../lib/candidacies')
const mailLib = require('../../../lib/mail')

module.exports = async (_, { slug }, { pgdb, user: me, t }) => {
  Roles.ensureUserIsInRoles(me, ['admin', 'associate'])

  const election = await findBySlug(slug, null, pgdb)

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
    { userId: me.id, discussionId: election.discussion.id }
  )

  const {entity, isNew} = await upsert(
    pgdb.public.electionCandidacies,
    {
      userId: me.id,
      electionId: election.id,
      commentId: comment.id
    },
    { userId: me.id, electionId: election.id }
  )

  if (isNew) {
    await mailLib.sendCandidacyConfirmation({
      user: me,
      election,
      pgdb,
      t
    })
  }

  return findById(entity.id, pgdb)
}
