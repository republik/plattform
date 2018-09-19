const moment = require('moment')

const {
  Roles,
  ensureSignedIn
} = require('@orbiting/backend-modules-auth')

const { upsert } = require('../../../lib/db')

module.exports = async (_, { electionInput }, { pgdb, user: me, req }) => {
  ensureSignedIn(req)
  Roles.ensureUserIsInRoles(me, ['admin', 'support'])

  const {
    slug,
    description,
    beginDate
  } = electionInput

  const start = moment(beginDate)
  const rawDiscussion = await upsert(pgdb.public.discussions,
    {
      title: description,
      documentPath: `${start.format('/YYYY/MM/DD')}/${slug}`
    },
    { title: description }
  )

  const rawElection = await upsert(pgdb.public.elections, {
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
