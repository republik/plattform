const Roles = require('../../lib/Roles')
const createUser = require('../../lib/factories/createUser')
const crypto = require('crypto')

const {
  DISPLAY_AUTHOR_SECRET
} = process.env
if (!DISPLAY_AUTHOR_SECRET) {
  throw new Error('missing required DISPLAY_AUTHOR_SECRET')
}

module.exports = {
  content: ({ content, published, adminUnpublished }, args, { t }) =>
    (!published || adminUnpublished)
      ? t('api/comment/removedPlaceholder')
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

  parent: async ({ parentId }, args, { pgdb }, info) => {
    if (!parentId) {
      return null
    }
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
    if (!(Roles.userHasRole(user, 'admin') || Roles.userHasRole(user, 'editor'))) {
      return null
    }
    return author || commenter || createUser(
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
      createUser(
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

    // TODO: Don't load from testimonial image once we have a profileImage on the user.
    const testimonial = !anonymous && await pgdb.public.testimonials.findOne({userId: commenter.id})
    const profilePicture = testimonial && testimonial.image

    const id = crypto
      .createHmac('sha256', DISPLAY_AUTHOR_SECRET)
      .update(`${discussion.id}${commenter.id}`)
      .digest('hex')

    return anonymous
      ? {
        id,
        name: t('api/comment/anonymous/displayName'),
        profilePicture: null,
        credential
      }
      : {
        id,
        name: commenter.name,
        profilePicture: profilePicture,
        credential
      }
  }
}
