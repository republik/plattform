const { NoSessionError, QueryEmailMismatchError } = require('../../../lib/errors')
const t = require('../../../lib/t')
const { sessionByToken } = require('../../../lib/Sessions')

module.exports = async (_, args, { pgdb, user: me, req }) => {
  const { email, token } = args

  try {
    return await sessionByToken({ pgdb, token, email })
  } catch (e) {
    if (e instanceof QueryEmailMismatchError) {
      console.error("unauthorizedSession: session.email and query.email don't match: %O", { req: req._log(), ...e.meta })
    } else if (e instanceof NoSessionError) {
      console.error('unauthorizedSession: no session %O', { req: req._log(), ...e.meta })
    } else {
      const util = require('util')
      console.error('unauthorizedSession:: exception', util.inspect({ req: req._log(), emailFromQuery: email, e }, {depth: null}))
    }
    throw new Error(t('api/unauthorized'))
  }
}
