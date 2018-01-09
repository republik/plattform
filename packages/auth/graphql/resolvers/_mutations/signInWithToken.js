const { QueryEmailMismatchError, NoSessionError } = require('../../../lib/errors')
const t = require('../../../lib/t')
const signInWithToken = require('../../../lib/signInWithToken')

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
      console.error("signInWithToken: session.email and query.email don't match: %O", { req: req._log(), context, ...e.meta })
    } else if (e instanceof NoSessionError) {
      console.error('signInWithToken: no session %O', { req: req._log(), context, ...e.meta })
    } else {
      const util = require('util')
      console.error('signInWithToken: exception', util.inspect({ req: req._log(), emailFromQuery: email, context, e }, {depth: null}))
    }
    throw new Error(t('api/token/invalid'))
  }
}
