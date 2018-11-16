const { Roles } = require('@orbiting/backend-modules-auth')
const crypto = require('crypto')
// TODO don't require from servers
const { portrait: getPortrait } = require('../../../../servers/republik/graphql/resolvers/User')
const remark = require('../../lib/remark')

const {
  DISPLAY_AUTHOR_SECRET
} = process.env
if (!DISPLAY_AUTHOR_SECRET) {
  throw new Error('missing required DISPLAY_AUTHOR_SECRET')
}

const textForComment = ({ userId, content, published, adminUnpublished }, user) =>
  (!published || adminUnpublished) && (!user || userId !== user.id)
    ? null
    : content

/**
 * @typedef {Object} Preview
 * @property {String}  string Preview string
 * @property {Boolean} more   If transformUser string was shortened
 * @property {Boolean} done   If true, char limit (<length>) has was reached
 */

/**
 * Stringifies an mdast tree into a single, plain string in a human readable
 * manner.
 *
 * @param  {Object}  node         mdast Object
 * @param  {Number}  [length=500] Maximum chars string should contain
 * @param  {String}  [string='']  Initial string
 * @param  {Boolean} [done=false] If true, char limit (<length>) has was reached
 * @return {Preview}
 */
const mdastToHumanString = (node, length = 500, string = '', done = false) => {
  if (node.children) {
    node.children.forEach(child => {
      if (!done && child.value) {
        const parts = child.value.split(/\s/)

        parts.forEach(part => {
          if (string.length + part.length <= length) {
            string += part.trim() + ' '
          } else {
            done = true
          }
        })
      }

      if (!done && child.children && string.length <= length) {
        const result = mdastToHumanString(child, length, string, done)
        string = result.string + ' '
        done = result.done
      }
    })
  }

  // Sanitize string to make it human readable
  string = string.replace(/\s([.,])/g, '$1').replace(/\s\s/g, ' ').trim()

  return { string, more: !!done, done }
}

module.exports = {
  discussion: ({ discussion, discussionId }, args, { loaders }) =>
    loaders.Discussion.byId.load(discussionId),

  published: ({ published, adminUnpublished }) =>
    published && !adminUnpublished,

  adminUnpublished: ({ userId, adminUnpublished }, args, { user }) =>
    Roles.userIsInRoles(user, ['editor', 'admin']) || (user && userId === user.id)
      ? adminUnpublished
      : null,

  content: (comment, args, context) => {
    const text = textForComment(comment, context && context.user)
    if (!text) {
      return text
    }
    return remark.parse(text)
  },

  text: (comment, args, { user }) =>
    textForComment(comment, user),

  preview: (comment, { length = 500 }, context) => {
    const text = textForComment(comment, context && context.user)
    if (!text) {
      return null
    }
    return mdastToHumanString(remark.parse(text), length)
  },

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

  parentIds: ({ parentIds }) =>
    parentIds || [],

  parent: ({ parentIds }, args, { loaders }, info) => {
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
    return loaders.Comment.byId.load(parentId)
  },

  author: async (comment, args, { user, loaders }) => {
    if (!Roles.userIsInRoles(user, ['editor', 'admin'])) {
      return null
    }
    return loaders.User.byId.load(comment.userId)
  },

  displayAuthor: async (
    comment,
    args,
    context
  ) => {
    const {
      t,
      loaders
    } = context

    const [discussion, commenter, commenterPreferences] = await Promise.all([
      loaders.Discussion.byId.load(comment.discussionId),
      loaders.User.byId.load(comment.userId),
      loaders.Discussion.Commenter.discussionPreferences.load({
        userId: comment.userId,
        discussionId: comment.discussionId
      })
    ])

    const credential = commenterPreferences && commenterPreferences.credential

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

    const profilePicture = getPortrait(commenter, (args && args.portrait), context)

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
        name: commenter.name || t('api/noname'),
        profilePicture: profilePicture,
        credential,
        anonymity: false,
        username: commenter._raw.hasPublicProfile
          ? commenter._raw.username
          : null
      }
  },

  comments: (comment) => {
    if (comment.comments) {
      return comment.comments
    }
    return {
      id: 'notSupported',
      totalCount: 0,
      directTotalCount: 0,
      nodes: []
    }
  }
}
