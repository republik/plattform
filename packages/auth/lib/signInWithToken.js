const resolveSession = require('./resolveSession')

const signInWithToken = async ({ pgdb, token, emailFromQuery, signInHooks = [] }) => {
  const Users = pgdb.public.users
  const Sessions = pgdb.public.sessions

  const session = await resolveSession({ pgdb, token, email: emailFromQuery })
  const { email } = session.sess

  // verify and/or create the user
  const existingUser = await Users.findOne({
    email
  })
  const user = existingUser ||
    await Users.insertAndGet({
      email,
      verified: true
    })
  if (!user.verified) {
    await Users.updateOne({
      id: user.id
    }, {
      verified: true
    })
  }

  // log in the session and delete token
  await Sessions.updateOne({
    sid: session.sid
  }, {
    sess: {
      ...session.sess,
      token: null,
      passport: {
        user: user.id
      }
    }
  })

  // call signIn hooks
  await Promise.all(
    signInHooks.map(hook =>
      hook(user.id, !existingUser, pgdb)
    )
  )

  return user
}

module.exports = signInWithToken
