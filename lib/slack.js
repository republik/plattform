const {
  SLACK_API_TOKEN,
  SLACK_CHANNEL_COMMENTS,
  SLACK_CHANNEL_IT_MONITOR,
  FRONTEND_BASE_URL
} = process.env

let SlackWebClient
if (SLACK_API_TOKEN && SLACK_CHANNEL_COMMENTS) {
  SlackWebClient = new (require('@slack/client').WebClient)(SLACK_API_TOKEN)
} else {
  console.warn('Posting new comments to slack disabled. Missing SLACK_API_TOKEN or SLACK_CHANNEL_COMMENTS')
}

const publish = (channel, content) => {
  if (SlackWebClient) {
    return new Promise((resolve, reject) => {
      SlackWebClient.chat.postMessage(channel, content, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }
}
exports.publish = publish

const getCommentLink = (comment, discussion) => discussion.documentPath
  ? `${FRONTEND_BASE_URL}${discussion.documentPath}?focus=${comment.id}`
  : comment.id

exports.publishComment = (user, comment, discussion) => {
  const content = `*${user.name}* wrote: ${getCommentLink(comment, discussion)}\n${comment.content}`
  return publish(SLACK_CHANNEL_COMMENTS, content)
}

exports.publishCommentUpdate = (user, comment, oldComment, discussion) => {
  const content = `*${user.name}* edited: ${getCommentLink(comment, discussion)}\n*old:*\n${oldComment.content}\n*new:*\n${comment.content}`
  return publish(SLACK_CHANNEL_COMMENTS, content)
}

exports.publishCommentUnpublish = (user, comment, discussion) => {
  const content = `*${user.name}* unpublished: ${getCommentLink(comment, discussion)}\n${comment.content}`
  return publish(SLACK_CHANNEL_COMMENTS, content)
}

exports.publishMonitor = (user, message) => {
  if (!SLACK_CHANNEL_IT_MONITOR) {
    console.error('slack: cannot publish to monitor. SLACK_CHANNEL_IT_MONITOR missing!')
    return
  }
  const content = `*${user.name}* (${user.email}): ${message}`
  return publish(SLACK_CHANNEL_IT_MONITOR, content)
}
