const session = require('express-session')
const PgSession = require('connect-pg-simple')(session)
const passport = require('passport')
const createUser = require('../lib/createUser')

exports.configure = ({
  server = null, // Express Server
  pgdb = null, // pogi connection
  // Secret used to encrypt session data on the server
  secret = null,
  // Specifies the value for the Domain Set-Cookie attribute
  domain = undefined,
  // Max session age in ms (default is 4 weeks)
  // NB: With 'rolling: true' passed to session() the session expiry time will
  // be reset every time a user visits the site again before it expires.
  maxAge = 60000 * 60 * 24 * 7 * 4,
  // is the server running in development
  dev = false
} = {}) => {
  if (server === null) {
    throw new Error('server option must be an express server instance')
  }
  if (secret === null) {
    throw new Error('session secret option must be provided')
  }
  if (pgdb === null) {
    throw new Error('pgdb option must be a connected pogi instance')
  }
  // Sessions store for express-session (defaults to connect-pg-simple using DATABASE_URL)
  const store = new PgSession({
    tableName: 'sessions'
  })
  const Users = pgdb.public.users
  const Sessions = pgdb.public.sessions

  // Configure sessions
  server.use(session({
    secret,
    store,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    httpOnly: true,
    cookie: {
      domain,
      maxAge: maxAge,
      secure: !dev
    }
  }))

  // trust first proxy
  if (!dev) {
    server.set('trust proxy', 1)
  }

  // authenticate a token sent by email
  server.get('/auth/email/signin/:token?', async (req, res) => {
    const emailFromQuery = req.query.email
    const token = req.query.token

    if (!token) {
      return res.status(400).end('please provide token')
    }

    try {
      // Look up session by token
      const session = await Sessions.findOne({'sess @>': {token}})
      if (!session) {
        return res.status(400).end('invalid token')
      }

      const email = session.sess.email
      if (emailFromQuery && email !== emailFromQuery) {
        return res.status(400).end('email missmatch')
      }

      // verify and/or create the user
      let user = await Users.findOne({email})
      if (user) {
        if (!user.verified) {
          await Users.updateOne({id: user.id}, {verified: true})
        }
      } else {
        user = await Users.insertAndGet({email, verified: true})
      }

      // log in the session and delete token
      const sess = Object.assign({}, session.sess, {
        passport: {user: user.id},
        token: null
      })
      await Sessions.updateOne({sid: session.sid}, {sess})

      return res.status(200).end('you are signed in now!')
    } catch (e) {
      console.error('auth: exception', e)
      return res.status(500).end('error')
    }
  })

  // Tell Passport how to seralize/deseralize user accounts
  passport.serializeUser(function (user, next) {
    next(null, user.id)
  })

  passport.deserializeUser(async function (id, next) {
    const user = createUser(
      await Users.findOne({id})
    )
    if (!user) {
      return next('user not found!')
    }
    next(null, user)
  })

  // Initialise Passport
  server.use(passport.initialize())
  server.use(passport.session())
}
