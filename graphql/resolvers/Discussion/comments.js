const graphqlFields = require('graphql-fields')
const { transformUser } = require('@orbiting/backend-modules-auth')
const {
  ascending,
  descending
} = require('d3-array')
const _ = {
  remove: require('lodash/remove'),
  uniq: require('lodash/uniq')
}
const {
  published: getPublished,
  adminUnpublished: getAdminUnpublished,
  content: getContent,
  author: getAuthor,
  displayAuthor: getDisplayAuthor
} = require('../Comment')

const assembleTree = (_comment, _comments) => {
  let coveredComments = []

  const _assembleTree = (comment, comments, depth = -1) => {
    const parentId = comment.id || null
    comment._depth = depth
    comment.comments = {
      nodes: _.remove(comments, c => (!parentId && !c.parentIds) || (c.parentIds && c.parentIds.slice(-1).pop() === parentId))
    }
    comment.comments.nodes = comment.comments.nodes
      .map(c => {
        coveredComments.push(c)
        return c
      })
      .map(c => _assembleTree(c, comments, depth + 1))
    return comment
  }

  _assembleTree(_comment, _comments)
  return coveredComments
}

const measureTree = comment => {
  const { comments } = comment
  const numChildren = comments.nodes.reduce(
    (acc, value) => {
      return acc + measureTree(value)
    },
    0
  )
  comment.comments = {
    ...comments,
    id: comment.id,
    totalCount: numChildren,
    pageInfo: {
      hasNextPage: false,
      endCursor: null
    }
  }
  return numChildren + 1
}

// recursively sort tree
// each node with children gets a topValue based on
// node[sortKey] || topChild[topValue] || topChild[sortKey]
// thus topValue bubbles up the tree, ensuring consistent sorting.
const deepSortTree = (comment, ascDesc, sortKey) => {
  const { comments } = comment
  if (comments.nodes.length > 0) {
    comments.nodes.forEach(c => deepSortTree(c, ascDesc, sortKey))
    comment.comments = {
      ...comments,
      nodes: comments.nodes.sort(
        (a, b) =>
          ascDesc(a.topValue || a[sortKey], b.topValue || b[sortKey])
      )
    }
    if (comment[sortKey]) { // root is a fake comment
      const firstChild = comment.comments.nodes[0]
      comment.topValue = [
        comment[sortKey],
        firstChild.topValue || firstChild[sortKey]
      ].sort((a, b) => ascDesc(a, b))[0]
    }
  }
  return comment
}

const filterTree = (comment, ids, cursorEnv) => {
  if (ids.length === 0) {
    return comment
  }
  const { comments, id } = comment
  if (comments.nodes.length > 0) {
    const nodes = comments.nodes.filter(n => filterTree(n, ids, cursorEnv) > 0)
    const exceptIds = [
      ...cursorEnv.exceptIds,
      ...nodes.map(n => n.id)
    ]
    const endCursor = comments.nodes.length === nodes.length || nodes.length === 0
      ? null
      : Buffer.from(JSON.stringify({
        ...cursorEnv,
        parentId: id,
        exceptIds
      })).toString('base64')
    comment.comments = {
      ...comments,
      nodes,
      pageInfo: {
        ...comments.pageInfo,
        hasNextPage: !!endCursor || (nodes.length === 0 && comments.nodes.length !== 0),
        endCursor
      }
    }
    return nodes.length > 0 || ids.indexOf(id) > -1
  } else {
    return ids.indexOf(id) > -1
  }
}

const cutTreeX = (comment, maxDepth, depth = -1) => {
  const { comments } = comment
  if (depth >= maxDepth - 1) {
    comment.comments = {
      ...comments,
      nodes: [],
      pageInfo: {
        ...comments.pageInfo,
        hasNextPage: comments.pageInfo.hasNextPage || comments.totalCount > 0
      }
    }
  } else {
    comments.nodes.forEach(c => cutTreeX(c, maxDepth, depth + 1))
  }
  return comment
}

const decorateTree = async (_comment, coveredComments, discussion, context) => {
  const { pgdb } = context
  // preload data
  const userIds = _.uniq(
    coveredComments.map(c => c.userId)
  )
  const users = userIds.length
    ? await pgdb.public.users.find({ id: userIds })
        .then(users => users.map(u => transformUser(u)))
    : []
  const discussionPreferences = userIds.length
    ? await pgdb.public.discussionPreferences.find({
      userId: userIds,
      discussionId: discussion.id
    })
    : []
  const credentialIds = discussionPreferences.map(dp => dp.credentialId)
  const credentials = credentialIds.length
    ? await pgdb.public.credentials.find({ id: credentialIds })
    : []

  const _decorateTree = (comment) => {
    const { comments } = comment
    comment.comments = {
      ...comments,
      nodes: comments.nodes.map(c => {
        const commenter = users.find(u => u.id === c.userId)
        const commenterPreferences = discussionPreferences.find(dp => dp.userId === commenter.id)
        const credential = commenterPreferences && commenterPreferences.credentialId
          ? credentials.find(c => c.id === commenterPreferences.credentialId)
          : null

        const preResolvedContext = {
          ...context,
          discussion,
          commenter,
          commenterPreferences,
          credential
        }

        return {
          ...c,
          published: getPublished(c, {}, context),
          adminUnpublished: getAdminUnpublished(c, {}, context),
          content: getContent(c, {}, context),
          author: getAuthor(c, {}, preResolvedContext),
          displayAuthor: getDisplayAuthor(c, {}, preResolvedContext)
        }
      })
    }
    if (comments.nodes.length > 0) {
      comments.nodes.forEach(c => _decorateTree(c))
    }
    return comment
  }

  return _decorateTree(_comment)
}

const meassureDepth = (fields, depth = 0) => {
  if (fields.nodes && fields.nodes.comments) {
    return meassureDepth(fields.nodes.comments, depth + 1)
  } else {
    if (fields.nodes) {
      return depth + 1
    }
    return depth
  }
}

const getCommentsArray = (_comment) => {
  let comments = []
  const _getCommentsArray = comment => {
    if (comment.comments.nodes.length > 0) {
      comments.push(...comment.comments.nodes)
      comment.comments.nodes.forEach(c => _getCommentsArray(c))
    }
  }
  _getCommentsArray(_comment)
  return comments
}

module.exports = async (discussion, args, context, info) => {
  const { pgdb } = context
  const maxDepth = meassureDepth(graphqlFields(info))

  const { after } = args
  const options = after
    ? {
      ...args,
      ...JSON.parse(Buffer.from(after, 'base64').toString())
    }
    : args
  const {
    orderBy = 'HOT',
    orderDirection = 'DESC',
    first = 200,
    exceptIds = [],
    focusId,
    parentId
  } = options

  // get comments
  const comments = await pgdb.public.comments.find({
    discussionId: discussion.id
  })
    .then(comments => comments
      .map(c => ({
        ...c,
        score: c.upVotes - c.downVotes // precompute
      }))
    )
  const discussionTotalCount = comments.length

  if (!comments.length) {
    return {
      id: discussion.id,
      totalCount: 0,
      nodes: []
    }
  }

  const tree = parentId
    ? { id: parentId }
    : {}

  // prepare sort
  const ascDesc = orderDirection === 'ASC'
    ? ascending
    : descending
  const sortKeyMap = {
    'DATE': 'createdAt',
    'VOTES': 'score',
    'HOT': 'hotness'
  }
  const sortKey = sortKeyMap[orderBy]
  const compare =
    (a, b) => ascDesc(a[sortKey], b[sortKey]) || ascending(a.index, b.index) // index for stable sort

  assembleTree(tree, comments)
  measureTree(tree)
  deepSortTree(tree, ascDesc, sortKey)

  if (exceptIds) { // exceptIds are always on first level
    tree.comments.nodes = tree.comments.nodes.filter(c => exceptIds.indexOf(c.id) === -1)
  }

  let coveredComments = getCommentsArray(tree)
    .map((c, index) => ({ // remember index for stable sort
      ...c,
      index
    }))

  if (first || focusId) {
    let filterCommentIds

    if (focusId) {
      const focusComment = coveredComments
        .find(c => c.id === focusId)
      const focusCommentParentId = focusComment.parentIds && focusComment.parentIds.slice(-1).pop()

      const focusLevelComments = coveredComments
        .filter(c =>
            c._depth === focusComment._depth &&
            (
              c.parentIds === focusCommentParentId ||
              (c.parentIds && c.parentIds.slice(-1).pop() === focusCommentParentId)
            )
        )
        .sort(compare)

      const focusIndex = focusLevelComments
        .findIndex(c => c.id === focusId)

      filterCommentIds = [
        ...focusLevelComments
          .slice(focusIndex - 1, focusIndex + 2),
        ...coveredComments
          .filter(c => c.parentIds && c.parentIds.slice(-1).pop() === focusId)
          .slice(0, 1)
      ]
        .sort(compare)
        .map(c => c.id)
    } else if (first) {
      filterCommentIds = coveredComments
        .sort(compare)
        .slice(0, first)
        .map(c => c.id)
    }

    if (filterCommentIds) {
      filterTree(tree, filterCommentIds, {
        orderBy,
        orderDirection,
        exceptIds
      })
    }
  }

  if (maxDepth != null) {
    cutTreeX(tree, maxDepth)
  }

  await decorateTree(tree, coveredComments, discussion, context)

  // if parentId is given, we return the totalCount of the subtree
  // otherwise it's the totalCount of the hole discussion
  if (!parentId) {
    tree.comments.id = discussion.id
    tree.comments.totalCount = discussionTotalCount
  }

  return tree.comments
}
