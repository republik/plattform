const _ = require('lodash')

const { remark } = require('@orbiting/backend-modules-discussions/lib')

const bulk = require('../../lib/indexPgTable')
const { mdastContentToString } = require('../utils')

const transform = function (row) {
  const user = _.find(this.payload.users, { id: row.userId })

  const discussion = _.find(
    this.payload.discussions,
    { id: row.discussionId }
  )
  const isAnonymityEnforced = discussion.anonymity === 'ENFORCED'

  const discussionPreferences = _.find(
    this.payload.discussionPreferences,
    { userId: row.userId, discussionId: row.discussionId }
  )
  const isAnonymous = discussionPreferences && discussionPreferences.anonymous

  row.resolved = {
    user: null,
    discussion: {
      hidden: discussion.hidden
    }
  }

  if (
    user &&
    !isAnonymityEnforced &&
    !isAnonymous
  ) {
    let credential = false

    // Find attached credential to discussion
    if (discussionPreferences && discussionPreferences.credentialId) {
      credential = _.find(
        this.payload.credentials,
        { id: discussionPreferences.credentialId }
      )
    }

    if (!credential || credential.length === 0) {
      credential = _.find(
        this.payload.credentials,
        { userId: user.id, isListed: true }
      )
    }

    row.resolved.user = {
      facebookId: user.facebookId,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      credential: credential ? credential.description : undefined,
      twitterHandle: user.twitterHandle,
      username: user.username
    }
  }

  row.__sort = {
    date: row.createdAt
  }

  row.contentString = mdastContentToString(remark.parse(row.content))

  return row
}

const getDefaultResource = async ({ pgdb }) => {
  return {
    table: pgdb.public.comments,
    payload: {
      users: await pgdb.public.users.find(
        {},
        {
          fields: [
            'id',
            'firstName',
            'lastName',
            'username',
            'twitterHandle',
            'facebookId'
          ]
        }
      ),
      discussions: await pgdb.public.discussions.find(
        {},
        {
          fields: [
            'id',
            'anonymity',
            'hidden'
          ]
        }
      ),
      discussionPreferences: await pgdb.public.discussionPreferences.find(
        {},
        {
          fields: [
            'userId',
            'discussionId',
            'anonymous',
            'credentialId'
          ]
        }
      ),
      credentials: await pgdb.public.credentials.find(
        {},
        {
          fields: [
            'id',
            'userId',
            'description',
            'isListed'
          ]
        }
      )
    },
    transform
  }
}

module.exports = {
  before: () => {},
  insert: async ({ resource, ...rest }) => {
    resource = Object.assign(
      await getDefaultResource({ resource, ...rest }),
      resource
    )

    return bulk.index({ resource, ...rest })
  },
  after: () => {}
}
