const moment = require('moment')

const { Roles, ensureSignedIn } = require('@orbiting/backend-modules-auth')

const { upsert } = require('../../../lib/db')

/**
 * Allows admin or support to create a new election.
 */
module.exports = async (_, { electionInput }, { pgdb, user: me, req }) => {
  ensureSignedIn(req)
  Roles.ensureUserIsInRoles(me, ['admin', 'supporter'])

  const {
    slug,
    description,
    beginDate
  } = electionInput

  const { entity: rawDiscussion } = await upsert(
    pgdb.public.discussions,
    {
      title: description,
      documentPath: `${moment(beginDate).format('/YYYY/MM/DD')}/${slug}`
    },
    { title: description }
  )

  const { entity: rawElection } = await upsert(
    pgdb.public.elections,
    {
      ...electionInput,
      discussionId: rawDiscussion.id
    },
    { slug }
  )

  return {
    ...rawElection,
    discussion: rawDiscussion
  }
}
