const { upsert } = require('../../../lib/db')

const {
  Roles,
  ensureSignedIn,
  transformUser
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, { slug }, { pgdb, user: me, req }) => {
  ensureSignedIn(req)
  Roles.ensureUserIsInRoles(me, ['admin', 'associate'])

  const election = (await pgdb.public.elections.find({slug}))[0]

  if (!election) {
    throw new Error(`No election for slug ${slug}`)
  }

  const discussion = await pgdb.public.discussions.findOne({id: election.discussionId})

  const comment = await upsert(
    pgdb.public.comments,
    {
      userId: me.id,
      discussionId: discussion.id,
      content: me.statement,
      hotness: 0.0
    },
    {userId: me.id, discussionId: discussion.id}
  )

  const rawCandidate = await upsert(
    pgdb.public.electionCandidacies,
    {
      userId: me.id,
      electionId: election.id,
      commentId: comment.id
    },
    {commentId: comment.id}
  )

  return {
    id: rawCandidate.id,
    user: transformUser(me),
    discussion: {
      comment
    }
  }
}
