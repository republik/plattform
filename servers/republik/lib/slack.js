const { transformUser } = require('@orbiting/backend-modules-auth')
const { formatPrice } = require('@orbiting/backend-modules-formats')

const {
  SLACK_API_TOKEN,
  SLACK_CHANNEL_COMMENTS,
  SLACK_CHANNEL_IT_MONITOR,
  SLACK_CHANNEL_ADMIN,
  SLACK_CHANNEL_FINANCE,
  FRONTEND_BASE_URL,
  ADMIN_FRONTEND_BASE_URL
} = process.env

let SlackWebClient
if (SLACK_API_TOKEN) {
  SlackWebClient = new (require('@slack/client').WebClient)(SLACK_API_TOKEN)
} else {
  console.warn('Posting to slack disabled: missing SLACK_API_TOKEN')
}

const publish = async (channel, content) => {
  if (SlackWebClient && channel) {
    await SlackWebClient.chat.postMessage({
      channel,
      text: content
    })
      .catch((e) => {
        console.error(e)
      })
  } else {
    console.warn(`Slack cannot publish: missing SLACK_API_TOKEN or channel.\n\tmessage: ${content}\n`)
  }
}
exports.publish = publish

const getCommentLink = (comment, discussion) => discussion.documentPath
  ? `${FRONTEND_BASE_URL}${discussion.documentPath}?focus=${comment.id}`
  : comment.id

exports.publishComment = async (user, comment, discussion) => {
  const content = `*${user.name}* wrote: ${getCommentLink(comment, discussion)}\n${comment.content}`
  return publish(SLACK_CHANNEL_COMMENTS, content)
}

exports.publishCommentUpdate = async (user, comment, oldComment, discussion) => {
  const content = `*${user.name}* edited: ${getCommentLink(comment, discussion)}\n*old:*\n${oldComment.content}\n*new:*\n${comment.content}`
  return publish(SLACK_CHANNEL_COMMENTS, content)
}

exports.publishCommentUnpublish = async (user, comment, discussion) => {
  const content = `*${user.name}* unpublished: ${getCommentLink(comment, discussion)}\n${comment.content}`
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
