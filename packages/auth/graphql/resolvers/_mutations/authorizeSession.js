const { QueryEmailMismatchError, NoSessionError } = require('../../../lib/errors')
const t = require('../../../lib/t')
const { authorizeSession } = require('../../../lib/Sessions')

module.exports = async (_, args, { pgdb, req, signInHooks }) => {
  const {
    email,
    token
  } = args
  try {
    const user = await authorizeSession({
      pgdb,
      token,
      emailFromQuery: email,
      signInHooks
    })
    return !!user
  } catch (e) {
    if (e instanceof QueryEmailMismatchError) {
      console.info("authorizeSession: session.email and query.email don't match: %O", { req: req._log(), ...e.meta })
    } else if (e instanceof NoSessionError) {
      console.info('authorizeSession: no session %O', { req: req._log(), ...e.meta })
    } else {
      const util = require('util')
      console.error('authorizeSession: exception', util.inspect({ req: req._log(), emailFromQuery: email, e }, {depth: null}))
    }
    throw new Error(t('api/token/invalid'))
  }
}
