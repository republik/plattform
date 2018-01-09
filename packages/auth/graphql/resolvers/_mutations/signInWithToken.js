const { signInWithToken, QueryEmailMismatchError, NoSessionError } = require('../../../lib/signInWithToken')
const t = require('../../../lib/t')

module.exports = async (_, args, { pgdb, req }) => {
  const {
    email,
    token,
    context
  } = args
  try {
    const user = await signInWithToken({
      pgdb,
      token,
      emailFromQuery: email
    })
    return !!user
  } catch (e) {
    if (e instanceof QueryEmailMismatchError) {
      console.error("session.email and query.email don't match: %O", { req: req._log(), context, ...e.meta })
    } else if (e instanceof NoSessionError) {
      console.error('no session: %O', { req: req._log(), context, ...e.meta })
    } else {
      const util = require('util')
      console.error('auth: exception', util.inspect({ req: req._log(), emailFromQuery: email, context, e }, {depth: null}))
    }
    throw new Error(t('api/token/invalid'))
  }
}
