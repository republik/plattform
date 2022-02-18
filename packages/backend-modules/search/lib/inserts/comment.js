const Promise = require('bluebird')

const { remark } = require('@orbiting/backend-modules-utils')

const bulk = require('../../lib/indexPgTable')
const { mdastContentToString } = require('../utils')

async function transform(row) {
  const { userId, discussionId } = row

  const { user, discussion, discussionPreferences, credentials } =
    await Promise.props({
      user: this.payload.getUser(userId),
      discussion: this.payload.getDiscussion(discussionId),
      discussionPreferences: this.payload.getDiscussionPreferences(
        userId,
        discussionId,
      ),
      credentials: this.payload.getCredentials(userId),
    })

  const isAnonymityEnforced = discussion.anonymity === 'ENFORCED'
  const isAnonymous = !!discussionPreferences?.anonymous

  row.resolved = {
    user: null,
    discussion: {
      hidden: discussion.hidden,
    },
  }

  if (user && !isAnonymityEnforced && !isAnonymous) {
    const credential =
      credentials.find((c) => c.id === discussionPreferences?.credentialId) ||
      credentials.find((c) => c.isListed)

    row.resolved.user = {
      facebookId: user.facebookId,
      firstName: user.firstName,
      lastName: user.lastName,
      name: [user.firstName, user.lastName].join(' ').trim(),
      credential: credential?.description || undefined,
      twitterHandle: user.twitterHandle,
      username: user.username,
    }
  }

  row.__sort = {
    date: row.createdAt,
  }

  row.contentString = mdastContentToString(remark.parse(row.content))

  return row
}

const getDefaultResource = async ({ pgdb }) => {
  return {
    table: pgdb.public.comments,
    payload: {
      getUser: async function (id) {
        return pgdb.public.users.findOne(
          { id },
          {
            fields: [
              'id',
              'firstName',
              'lastName',
              'username',
              'twitterHandle',
              'facebookId',
            ],
          },
        )
      },
      getDiscussion: async function (id) {
        return pgdb.public.discussions.findOne(
          { id },
          { fields: ['anonymity', 'hidden'] },
        )
      },
      getDiscussionPreferences: async function (userId, discussionId) {
        return pgdb.public.discussionPreferences.findOne(
          {
            userId,
            discussionId,
          },
          { fields: ['anonymous', 'credentialId'] },
        )
      },
      getCredentials: async function (userId) {
        return pgdb.public.credentials.find(
          { userId },
          { fields: ['id', 'userId', 'description', 'isListed'] },
        )
      },
    },
    transform,
  }
}

module.exports = {
  before: () => {},
  insert: async ({ resource, ...rest }) => {
    resource = Object.assign(
      await getDefaultResource({ resource, ...rest }),
      resource,
    )

    return bulk.index({ resource, ...rest })
  },
  after: () => {},
  final: () => {},
}
