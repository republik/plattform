const { NoSessionError, QueryEmailMismatchError } = require('../../../lib/errors')
const t = require('../../../lib/t')
const resolveSession = require('../../../lib/resolveSession')

module.exports = async (_, args, { pgdb, user: me, req }) => {
  const { email, token, context } = args

  try {
    return await resolveSession({ pgdb, token, email })
  } catch (e) {
    if (e instanceof QueryEmailMismatchError) {
      console.error("unverifiedSession: session.email and query.email don't match: %O", { req: req._log(), context, ...e.meta })
    } else if (e instanceof NoSessionError) {
      console.error('unverifiedSession: no session %O', { req: req._log(), context, ...e.meta })
    } else {
      const util = require('util')
      console.error('unverifiedSession:: exception', util.inspect({ req: req._log(), emailFromQuery: email, context, e }, {depth: null}))
    }
    throw new Error(t('api/token/invalid'))
  }
}
