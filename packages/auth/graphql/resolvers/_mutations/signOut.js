const { DestroySessionError } = require('../../../lib/errors')
const t = require('../../../lib/t')
const { destroySession } = require('../../../lib/Sessions')

module.exports = async (_, args, { req }) => {
  if (!req.session) return true
  try {
    await destroySession(req)
    return true
  } catch (e) {
    if (e instanceof DestroySessionError) {
      console.error('signOut: exception %O', { req: req._log(), ...e.meta })
    } else {
      const util = require('util')
      console.error('signOut: exception', util.inspect({ req: req._log(), e }, {depth: null}))
    }
    throw new Error(t('api/auth/errorDestroyingSession'))
  }
}
