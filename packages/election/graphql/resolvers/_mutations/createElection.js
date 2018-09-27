const moment = require('moment')

const { Roles } = require('@orbiting/backend-modules-auth')

const { upsert } = require('../../../lib/db')
const { findBySlug } = require('../../../lib/elections')

/**
 * Allows admin or support to create a new election.
 */
module.exports = async (_, { electionInput }, { pgdb, user: me }) => {
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

  await upsert(
    pgdb.public.elections,
    {
      ...electionInput,
      discussionId: rawDiscussion.id
    },
    { slug }
  )

  return findBySlug(slug, null, pgdb)
}
