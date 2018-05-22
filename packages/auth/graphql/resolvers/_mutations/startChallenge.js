const { startChallenge, generateNewToken } = require('../../../lib/challenges')

module.exports = async (_, args, { pgdb, req }) => {
  const {
    sessionId,
    type
  } = args

  const session = await pgdb.public.sessions.findOne({ id: sessionId })
  const email = session.sess.email
  const token = await generateNewToken(type, {
    pgdb,
    session,
    email
  })
  return startChallenge(type, {
    pgdb,
    email,
    token
  })
}
