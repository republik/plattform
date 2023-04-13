const { publish } = require('@orbiting/backend-modules-slack')
const { transformUser } = require('@orbiting/backend-modules-auth')
const { formatPrice } = require('@orbiting/backend-modules-formats')

const {
  SLACK_CHANNEL_IT_MONITOR,
  SLACK_CHANNEL_ADMIN,
  SLACK_CHANNEL_FINANCE,
  SLACK_CHANNEL_COMMENTS_ADMIN,
  ADMIN_FRONTEND_BASE_URL,
  FRONTEND_BASE_URL,
} = process.env

exports.publishScheduler = async (message) => {
  return await publish(SLACK_CHANNEL_IT_MONITOR, message)
}

exports.publishFinance = async (message) => {
  return await publish(
    SLACK_CHANNEL_FINANCE,
    message.replace(/{ADMIN_FRONTEND_BASE_URL}/g, ADMIN_FRONTEND_BASE_URL),
  )
}

exports.publishMonitor = async (_user, message) => {
  const user = transformUser(_user)
  try {
    const content = [
      `*${user.name}* (${user.email}):`,
      message.replace(/{ADMIN_FRONTEND_BASE_URL}/g, ADMIN_FRONTEND_BASE_URL),
    ].join(' ')
    return await publish(SLACK_CHANNEL_IT_MONITOR, content)
  } catch (e) {
    console.warn(e)
  }
}

exports.publishMembership = async (
  _user,
  _me,
  membershipTypeName,
  action,
  details,
) => {
  const user = transformUser(_user)
  try {
    let detailsString = ''
    if (details) {
      detailsString = [
        details.category && `Category: ${details.category}`,
        details.reason,
      ]
        .filter(Boolean)
        .join('\n')
    }

    const actionString = _user.id === _me.id ? action : `${action} (support)`

    const content = `*${user.name}* (${user.email}): ${actionString} (${membershipTypeName}) ${detailsString}
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

const getProfileLink = (user) =>
  user.username
    ? `<${FRONTEND_BASE_URL}/~${user.username || user.id}|${user.name}>`
    : user.name

exports.reportUser = async (user, reportedUser, reason) => {
  try {
    const content = `
    :bomb: *${user ? getProfileLink(user) : 'Gast'}* reported *${getProfileLink(
      reportedUser,
    )}*: \n
    Reason: \n
    ${reason}
    `

    return await publish(SLACK_CHANNEL_COMMENTS_ADMIN, content, {
      unfurl_links: true,
      unfurl_media: true,
    })
  } catch (e) {
    console.warn(e)
  }
}
