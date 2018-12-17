const { publish } = require('@orbiting/backend-modules-slack')
const { transformUser } = require('@orbiting/backend-modules-auth')
const { formatPrice } = require('@orbiting/backend-modules-formats')

const {
  SLACK_CHANNEL_IT_MONITOR,
  SLACK_CHANNEL_ADMIN,
  SLACK_CHANNEL_FINANCE,
  ADMIN_FRONTEND_BASE_URL
} = process.env

exports.publishMonitor = async (_user, message) => {
  const user = transformUser(_user)
  try {
    const content = `*${user.name}* (${user.email}): ${message}`
    return await publish(SLACK_CHANNEL_IT_MONITOR, content)
  } catch (e) {
    console.warn(e)
  }
}

exports.publishMembership = async (_user, membershipTypeName, action, details) => {
  const user = transformUser(_user)
  try {
    let detailsString = ''
    if (details) {
      detailsString = [
        details.category && `Category: ${details.category}`,
        details.reason
      ].filter(Boolean).join('\n')
    }
    const content = `*${user.name}* (${user.email}): ${action} (${membershipTypeName}) ${detailsString}
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
