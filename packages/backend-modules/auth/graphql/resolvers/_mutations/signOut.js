const { ControlBus } = require('@orbiting/backend-modules-base/lib')
const { destroySession } = require('../../../lib/Sessions')

module.exports = async (_, args, { req, res }) => {
  if (!req.session) return true
  const sessionId = req.sessionID
  await destroySession(req, res)
  ControlBus.publish('auth:logout', { sessionId })
  return true
}
