const { authorizeSession } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, req, signInHooks }) => {
  const {
    email,
    tokenChallenge,
    secondFactor
  } = args

  const tokens = [tokenChallenge]

  if (secondFactor) tokens.push(secondFactor)

  const user = await authorizeSession({
    pgdb,
    tokens,
    email,
    signInHooks
  })

  return !!user
}
