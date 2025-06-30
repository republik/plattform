const crypto = require('crypto')
const Promise = require('bluebird')

const { Roles } = require('@orbiting/backend-modules-auth')
const {
  mdastCollapseLink,
  mdastToString,
  remark,
} = require('@orbiting/backend-modules-utils')

const {
  portrait: getPortrait,
  name: getName,
  slug: getSlug,
} = require('@orbiting/backend-modules-republik/graphql/resolvers/User')
const { clipNamesInText } = require('../../lib/nameClipper')
const { stripUrlFromText } = require('../../lib/urlStripper')
const { getEmbedByUrl } = require('@orbiting/backend-modules-embeds')

const { DISPLAY_AUTHOR_SECRET, ASSETS_SERVER_BASE_URL } = process.env
if (!DISPLAY_AUTHOR_SECRET) {
  throw new Error('missing required DISPLAY_AUTHOR_SECRET')
}

const embedForComment = async (
  { embedUrl, discussionId, depth, published, adminUnpublished },
  context,
) => {
  if (!embedUrl) {
    return null
  }
  if (!(published && !adminUnpublished)) {
    return null
  }
  const discussion = await context.loaders.Discussion.byId.load(discussionId)
  if (discussion && discussion.isBoard && depth === 0) {
    return getEmbedByUrl(embedUrl, context)
  }
  return null
}

const textForComment = async (comment, strip = false, context) => {
  const {
    userId,
    content,
    published,
    adminUnpublished,
    discussionId,
    embedUrl,
  } = comment
  const { user: me } = context

  const isPublished = !!(published && !adminUnpublished)
  const isMine = !!(me && userId && userId === me.id)
  if (!isMine && !isPublished) {
    return null
  }

  let newContent = content
  if (!isMine && !Roles.userIsInRoles(me, ['member'])) {
    const namesToClip =
      await context.loaders.Discussion.byIdCommenterNamesToClip.load(
        discussionId,
      )
    newContent = clipNamesInText(namesToClip, content)
  }
  if (strip && !!(await embedForComment(comment, context))) {
    newContent = stripUrlFromText(embedUrl, content)
  }
  return newContent
}

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
 * @return {Preview}
 */
const mdastToHumanString = (node, length = 500) => {
  let string = ''
  const parts = mdastToString(mdastCollapseLink(node))
    .split(/\s+/)
    .filter(Boolean)

  do {
    const part = parts.shift()

    if (!part || string.length + part.length > length) {
      break
    }

    string += `${part} `
  } while (string.length <= length && parts.length > 0)

  return { string: string.trim(), more: parts.length > 0 }
}

module.exports = {
  discussion: ({ discussion, discussionId }, args, { loaders }) =>
    loaders.Discussion.byId.load(discussionId),

  published: ({ published, adminUnpublished }) =>
    published && !adminUnpublished,

  content: async (comment, args, context) => {
    const strip = args && args.strip !== null ? args.strip : false
    const text = await textForComment(comment, strip, context)
    if (!text) {
      return text
    }
    return remark.parse(text)
  },

  text: (comment, args, context) => textForComment(comment, false, context),

  featuredText: ({
    published,
    adminUnpublished,
    featuredAt,
    featuredContent,
  }) =>
    published && !adminUnpublished && featuredAt && featuredContent
      ? featuredContent
      : null,

  preview: async (comment, { length = 500 }, context) => {
    const text = await textForComment(comment, false, context)
    if (!text) {
      return null
    }
    return mdastToHumanString(remark.parse(text), length)
  },

  embed: async (comment, args, context) => embedForComment(comment, context),

  contentLength: ({ content, embedUrl, userId }, args, { user: me }) =>
    me && me.id === userId
      ? content.length - (embedUrl ? embedUrl.length : 0)
      : null,

  upVotes: (comment) => {
    const { published, adminUnpublished, upVotes } = comment
    return (published && !adminUnpublished && upVotes) || 0
  },

  downVotes: (comment) => {
    const { published, adminUnpublished, downVotes } = comment
    return (published && !adminUnpublished && downVotes) || 0
  },

  score: (comment) => {
    const { published, adminUnpublished, upVotes, downVotes } = comment
    return (published && !adminUnpublished && upVotes - downVotes) || 0
  },

  userCanEdit: ({ userId }, args, { user }) => user && userId === user.id,

  userVote: (comment, args, { user: me }) => {
    const { published, adminUnpublished, votes } = comment
    const userVote = me && votes.find((vote) => vote.userId === me.id)

    if (published && !adminUnpublished && userVote) {
      return userVote.vote === -1 ? 'DOWN' : 'UP'
    }

    return null
  },

  parentIds: ({ parentIds }) => parentIds || [],

  parent: ({ parentIds }, args, { loaders }, info) => {
    if (!parentIds) {
      return null
    }
    const parentId = parentIds.slice(-1).pop()
    const selections = info.fieldNodes[0].selectionSet.selections
    if (selections.length === 1 && selections[0].name.value === 'id') {
      return {
        id: parentId,
      }
    }
    return loaders.Comment.byId.load(parentId)
  },

  author: async (comment, args, { user, loaders }) => {
    if (!comment.userId || !Roles.userIsInRoles(user, ['admin'])) {
      return null
    }
    return loaders.User.byId.load(comment.userId)
  },

  displayAuthor: async (comment, args, context) => {
    const { adminUnpublished, published, discussionId, userId } = comment
    const { portrait } = args || {}
    const { user: me, t, loaders } = context

    const commenter = !!userId && (await loaders.User.byId.load(userId))

    if (adminUnpublished || (!published && !Roles.userIsMe(commenter, me))) {
      return {
        id: 'hidden',
        name: t('api/comment/hidden/displayName'),
        profilePicture: null,
        anonymity: true,
        username: null,
        slug: null,
      }
    }

    const id = crypto
      .createHmac('sha256', DISPLAY_AUTHOR_SECRET)
      .update(`${discussionId}${userId || ''}`)
      .digest('hex')

    const anonymousComment = {
      id,
      name: t('api/comment/anonymous/displayName'),
      profilePicture: null,
      anonymity: true,
      username: null,
      slug: null,
    }

    if (!commenter) {
      return anonymousComment
    }

    const { discussion, commenterPreferences } = await Promise.props({
      discussion: loaders.Discussion.byId.load(discussionId),
      commenterPreferences:
        loaders.Discussion.Commenter.discussionPreferences.load({
          userId,
          discussionId,
        }),
    })

    const credential = commenterPreferences?.credential
    const anonymous =
      discussion.anonymity === 'ENFORCED' || !!commenterPreferences?.anonymous

    if (anonymous) {
      if (commenterPreferences?.anonymousDifferentiator !== null) {
        anonymousComment.name = t(
          'api/comment/anonymous/displayName/withDifferentiator',
          { differentiator: commenterPreferences.anonymousDifferentiator },
        )
      }

      return {
        ...anonymousComment,
        credential,
      }
    }

    const slug = getSlug(commenter, null, context)

    return {
      id,
      name: getName(commenter, null, context) || t('api/noname'),
      profilePicture: getPortrait(commenter, portrait, context),
      credential,
      anonymity: false,
      username: slug,
      slug,
    }
  },

  comments: async (comment, args, { loaders, t }) => {
    if (comment.comments) {
      return comment.comments
    }

    const children = await loaders.Comment.byParentId.load(comment.id)
    const nodes = children.filter(
      (child) => child.parentIds.length === comment.depth + 1,
    )

    if (children) {
      return {
        totalCount: children.length,
        directTotalCount: nodes.length,
        nodes,
      }
    }

    // TODO: why throw here? any why not api/comment/noChildren?
    throw new Error(t('api/unexpected'))
  },

  tags: (comment) => comment.tags || [],

  mentioningDocument: async (
    { mentioningRepoId, mentioningFragmentId: fragmentId },
    args,
    { loaders },
  ) => {
    if (!mentioningRepoId) {
      return null
    }
    const doc = await loaders.Document.byRepoId.load(mentioningRepoId)
    if (doc) {
      return {
        document: doc,
        fragmentId,
        iconUrl: `${ASSETS_SERVER_BASE_URL}/s3/republik-assets/assets/top-storys/top-story-badge.png`,
      }
    }
  },

  userCanReport: ({ userId }, args, { user: me }) => !me || me?.id !== userId,

  userReportedAt: ({ reports }, args, { user: me }) =>
    me &&
    reports &&
    reports.reduce(
      (acc, r) => (acc || r.userId === me.id ? r.reportedAt : null),
      null,
    ),

  numReports: ({ reports }, args, { user: me }) =>
    Roles.userIsInRoles(me, ['moderator', 'admin'])
      ? reports
        ? reports.length
        : 0
      : null,
}
