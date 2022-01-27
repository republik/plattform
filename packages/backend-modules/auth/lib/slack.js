const { publish } = require('@orbiting/backend-modules-slack')

const transformUser = require('../lib/transformUser')

const { SLACK_CHANNEL_IT_MONITOR, ADMIN_FRONTEND_BASE_URL } = process.env

exports.publishMonitor = async (user, message) => {
  const { id, name, email } = transformUser(user)

  try {
    const content = [
      `*<${ADMIN_FRONTEND_BASE_URL}/users/${id}|${name || email}>*:`,
      message.replace(/{ADMIN_FRONTEND_BASE_URL}/g, ADMIN_FRONTEND_BASE_URL),
    ].join(' ')

    return await publish(SLACK_CHANNEL_IT_MONITOR, content)
  } catch (e) {
    console.warn(e)
  }
}
