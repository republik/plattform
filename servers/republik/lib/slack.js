const { publish } = require('@orbiting/backend-modules-slack')
const { transformUser } = require('@orbiting/backend-modules-auth')
const { formatPrice } = require('@orbiting/backend-modules-formats')
const {
  displayAuthor: getDisplayAuthor
} = require('../graphql/resolvers/Comment')

const {
  SLACK_CHANNEL_COMMENTS,
  SLACK_CHANNEL_IT_MONITOR,
  SLACK_CHANNEL_ADMIN,
  SLACK_CHANNEL_FINANCE,
  FRONTEND_BASE_URL,
  ADMIN_FRONTEND_BASE_URL
} = process.env

const getCommentLink = (comment, discussion) => discussion.documentPath
  ? `${FRONTEND_BASE_URL}${discussion.documentPath}?focus=${comment.id}`
  : comment.id

const getProfileLink = (author) => author.username
  ? `<${FRONTEND_BASE_URL}/~${author.username}|${author.name}>`
  : author.name

exports.publishComment = async (comment, discussion, context) => {
  const author = await getDisplayAuthor(comment, {}, context)
  const content = `:love_letter: *${getProfileLink(author)}* wrote in <${getCommentLink(comment, discussion)}|${discussion.title}>:\n${comment.content}`
  return publish(SLACK_CHANNEL_COMMENTS, content)
}

exports.publishCommentUpdate =
  async (comment, oldComment, discussion, context) => {
    const author = await getDisplayAuthor(comment, {}, context)
    const content = `:pencil2: *${getProfileLink(author)}* edited in <${getCommentLink(comment, discussion)}|${discussion.title}>:\n*old:*\n${oldComment.content}\n*new:*\n${comment.content}`
    return publish(SLACK_CHANNEL_COMMENTS, content)
  }

exports.publishCommentUnpublish =
  async (user, update, comment, discussion, context) => {
    const author = await getDisplayAuthor(comment, {}, context)

    const action = update.adminUnpublished
      ? `:point_up: *${user.name}* unupblished comment by *${getProfileLink(author)}*`
      : `:put_litter_in_its_place: *${getProfileLink(author)}* unpublished`

    const content = `${action} in <${getCommentLink(comment, discussion)}|${discussion.title}>:\n${comment.content}`
    return publish(SLACK_CHANNEL_COMMENTS, content)
  }

exports.publishMonitor = async (_user, message) => {
  const user = transformUser(_user)
  try {
    const content = `*${user.name}* (${user.email}): ${message}`
    return await publish(SLACK_CHANNEL_IT_MONITOR, content)
  } catch (e) {
    console.warn(e)
  }
}

exports.publishMembership = async (_user, membershipTypeName, action, reason) => {
  const user = transformUser(_user)
  try {
    const content = `*${user.name}* (${user.email}): ${action} (${membershipTypeName}) ${reason ? '\nReason: ' + reason : ''}
${ADMIN_FRONTEND_BASE_URL}/users/${user.id}
`
    return await publish(SLACK_CHANNEL_ADMIN, content)
  } catch (e) {
    console.warn(e)
  }
}

exports.publishPledge = async (_user, pledge, action) => {
  const user = transformUser(_user)
  try {
    let content = `*${user.name}* (${user.email}): ${action}`
    if (pledge) {
      content += `\npledge: *${formatPrice(pledge.total)}* ${pledge.id}`
    }
    content += `\n${ADMIN_FRONTEND_BASE_URL}/users/${user.id}`
    return await publish(SLACK_CHANNEL_FINANCE, content)
  } catch (e) {
    console.warn(e)
  }
}
