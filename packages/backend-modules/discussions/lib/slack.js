const { publish } = require('@orbiting/backend-modules-slack')

const {
  displayAuthor: getDisplayAuthor,
} = require('../graphql/resolvers/Comment')

const { getDiscussionUrl } = require('./Notifications')

const {
  SLACK_CHANNEL_COMMENTS,
  SLACK_CHANNEL_COMMENTS_ADMIN,
  FRONTEND_BASE_URL,
} = process.env

if (!FRONTEND_BASE_URL) {
  console.warn(
    'missing FRONTEND_BASE_URL, the url of comments posted to slack will have invalid url',
  )
}

const getCommentLink = async (comment, discussion, context) => {
  const discussionUrl = await getDiscussionUrl(discussion, context)
  return `${discussionUrl}${
    discussionUrl.indexOf('?') === -1 ? '?' : '&'
  }focus=${comment.id}`
}

const getProfileLink = (author) =>
  author.username
    ? `<${FRONTEND_BASE_URL}/~${author.username}|${author.name}>`
    : author.name

exports.publishComment = async (comment, discussion, context) => {
  const author = await getDisplayAuthor(comment, {}, context)
  const content = `:love_letter: *${getProfileLink(
    author,
  )}* wrote in <${await getCommentLink(comment, discussion, context)}|${
    discussion.title
  }>:\n${comment.content}`
  return publish(SLACK_CHANNEL_COMMENTS, content)
}

exports.publishCommentUpdate = async (
  comment,
  oldComment,
  discussion,
  context,
) => {
  const author = await getDisplayAuthor(comment, {}, context)
  const content = `:pencil2: *${getProfileLink(
    author,
  )}* edited in <${await getCommentLink(comment, discussion, context)}|${
    discussion.title
  }>:\n*old:*\n${oldComment.content}\n*new:*\n${comment.content}`
  return publish(SLACK_CHANNEL_COMMENTS, content)
}

exports.publishCommentUnpublish = async (
  user,
  update,
  comment,
  discussion,
  context,
) => {
  const author = await getDisplayAuthor(comment, {}, context)

  const action = update.adminUnpublished
    ? `:point_up: *${user.name}* unpublished comment by *${getProfileLink(
        author,
      )}*`
    : `:put_litter_in_its_place: *${getProfileLink(author)}* unpublished`

  const content = `${action} in <${await getCommentLink(
    comment,
    discussion,
    context,
  )}|${discussion.title}>:\n${comment.content}`
  return publish(
    update.adminUnpublished
      ? SLACK_CHANNEL_COMMENTS_ADMIN
      : SLACK_CHANNEL_COMMENTS,
    content,
  )
}

exports.publishCommentReport = async (
  userName,
  comment,
  discussion,
  context,
  description,
) => {
  const author = await getDisplayAuthor(comment, {}, context)

  const action = `:bomb: *${userName}* reported comment by *${getProfileLink(
    author,
  )}*`
  const content = `${action} in <${await getCommentLink(
    comment,
    discussion,
    context,
  )}|${discussion.title}> (${comment.reports.length}. report):\n${
    comment.content
  }\n
  Reason:\n
  ${description || 'Non provided'}`

  return publish(SLACK_CHANNEL_COMMENTS_ADMIN, content, {
    unfurl_links: true,
    unfurl_media: true,
  })
}

exports.publishCommentFeatured = async (
  user,
  comment,
  discussion,
  featuredText,
  featuredTargets,
  featured,
  context,
) => {
  const author = await getDisplayAuthor(comment, {}, context)

  const action = featured
    ? `:star: *${user.name}* featured comment by *${getProfileLink(author)}*`
    : `:face_palm: *${user.name}* un-featured comment by *${getProfileLink(
        author,
      )}*`

  const targets = featuredTargets.join(', ')

  const content = featured
    ? `${action} from <${await getCommentLink(comment, discussion, context)}|${
        discussion.title
      }> for target(s) ${targets}:\n${featuredText}`
    : `${action} from <${await getCommentLink(comment, discussion, context)}|${
        discussion.title
      }>`

  return publish(SLACK_CHANNEL_COMMENTS_ADMIN, content, {
    unfurl_links: false,
    unfurl_media: false,
  })
}

exports.publishUserSuspended = async (suspensions, user, context) => {
  const until = Math.max(...suspensions.map((s) => s.endAt))

  const content = [
    `:children_crossing: *${getProfileLink(user)} suspended*`,
    `ends on ${new Date(until).toISOString()}`,
    `issued by ${getProfileLink(context.user)}`,
  ].join('\n')

  return publish(SLACK_CHANNEL_COMMENTS_ADMIN, content, {
    unfurl_links: false,
    unfurl_media: false,
  })
}

exports.publishUserUnsuspended = async (suspensions, user, context) => {
  const content = [
    `:dove_of_peace: *${getProfileLink(user)} unsuspended early*`,
    `by ${getProfileLink(context.user)}`,
  ].join('\n')

  return publish(SLACK_CHANNEL_COMMENTS_ADMIN, content, {
    unfurl_links: false,
    unfurl_media: false,
  })
}
