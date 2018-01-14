const { Roles } = require('@orbiting/backend-modules-auth')
const { transformUser } = require('@orbiting/backend-modules-auth')
const crypto = require('crypto')

const {
  DISPLAY_AUTHOR_SECRET
} = process.env
if (!DISPLAY_AUTHOR_SECRET) {
  throw new Error('missing required DISPLAY_AUTHOR_SECRET')
}

module.exports = {
  published: ({ published, adminUnpublished }) =>
    published && !adminUnpublished,

  adminUnpublished: ({ userId, adminUnpublished }, args, { user }) =>
    Roles.userIsInRoles(user, ['editor', 'admin']) || (user && userId === user.id)
      ? adminUnpublished
      : null,

  content: ({ userId, content, published, adminUnpublished }, args, { user, t }) =>
    (!published || adminUnpublished) && (!user || userId !== user.id)
      ? null
      : content,

  score: comment =>
    comment.upVotes - comment.downVotes,

  userCanEdit: ({ userId }, args, { user }) =>
    user && userId === user.id,

  userVote: ({ votes }, args, { user }) => {
    const userVote = user && votes.find(v => v.userId === user.id)
    if (userVote) {
      return userVote.vote === -1
        ? 'DOWN'
        : 'UP'
    }
    return null
  },

  parentIds: ({ parentIds }) => parentIds || [],
  parent: async ({ parentIds }, args, { pgdb }, info) => {
    if (!parentIds) {
      return null
    }
    const parentId = parentIds.slice(-1).pop()
    const selections = info.fieldNodes[0].selectionSet.selections
    if (selections.length === 1 && selections[0].name.value === 'id') {
      return {
        id: parentId
      }
    }
    return pgdb.public.comments.findOne({
      id: parentId
    })
  },

  author: async ({ author, userId }, args, { pgdb, user, commenter }) => {
    if (!Roles.userIsInRoles(user, ['editor', 'admin'])) {
      return null
    }
    return author || commenter || transformUser(
      await pgdb.public.users.findOne({ id: userId })
    )
  },

  displayAuthor: async (
    comment,
    args,
    {
      pgdb,
      t,
      discussion: _discussion,
      commenter: _commenter,
      commenterPreferences: _commenterPreferences,
      credential: _credential
    }
  ) => {
    if (comment.displayAuthor) {
      return comment.displayAuthor
    }

    const commenter = _commenter ||
      transformUser(
        await pgdb.public.users.findOne({
          id: comment.userId
        })
      )
    const commenterPreferences = _commenterPreferences ||
      await pgdb.public.discussionPreferences.findOne({
        userId: commenter.id,
        discussionId: comment.discussionId
      })
    const discussion = _discussion ||
      await pgdb.public.discussions.findOne({
        id: comment.discussionId
      })
    const credential = commenterPreferences && commenterPreferences.credentialId
      ? _credential || await pgdb.public.credentials.findOne({ id: commenterPreferences.credentialId })
      : null

    let anonymous
    if (discussion.anonymity === 'ENFORCED') {
      anonymous = true
    } else { // FORBIDDEN or ALLOWED
      if (commenterPreferences && commenterPreferences.anonymous != null) {
        anonymous = commenterPreferences.anonymous
      } else {
        anonymous = false
      }
    }

    const profilePicture = commenter._raw.portraitUrl

    const id = crypto
      .createHmac('sha256', DISPLAY_AUTHOR_SECRET)
      .update(`${discussion.id}${commenter.id}`)
      .digest('hex')

    return anonymous
      ? {
        id,
        name: t('api/comment/anonymous/displayName'),
        profilePicture: null,
        credential,
        anonymity: true,
        username: null
      }
      : {
        id,
        name: commenter.name,
        profilePicture: profilePicture,
        credential,
        anonymity: false,
        username: commenter._raw.hasPublicProfile
          ? commenter._raw.username
          : null
      }
  }
}
