const session = require('express-session')
const passport = require('passport')
const PgSession = require('connect-pg-simple')(session)

const transformUser = require('../lib/transformUser')
const basicAuthMiddleware = require('./basicAuth')
const { specialRoles, userIsInRoles } = require('../lib/Roles')

const DEFAULT_MAX_AGE_IN_MS = 60000 * 60 * 24 * 365 // 1 year
const SHORT_MAX_AGE_IN_MS = 60000 * 60 * 24 * 7 // 1 week

exports.configure = ({
  server = null, // Express Server
  pgdb = null, // pogi connection
  // Secret used to encrypt session data on the server
  secret = null,
  // Specifies the value for the Domain Set-Cookie attribute
  domain = undefined,
  // name of the session ID cookie to set in the response (and read from request)
  cookieName = 'connect.sid',
  // Max session age in ms
  // NB: With 'rolling: true' passed to session() the session expiry time will
  // be reset every time a user visits the site again before it expires.
  maxAge = DEFAULT_MAX_AGE_IN_MS, // 1 year
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
    tableName: 'sessions',
    conString: process.env.DATABASE_URL
  })
  const Users = pgdb.public.users

  basicAuthMiddleware(server)

  // Configure sessions
  server.use(session({
    secret,
    store,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    httpOnly: true,
    name: cookieName,
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

  // Tell Passport how to seralize/deseralize user accounts
  passport.serializeUser(function (user, next) {
    next(null, user.id)
  })

  passport.deserializeUser(async function (id, next) {
    const user = transformUser(
      await Users.findOne({ id })
    )

    if (!user) {
      return next('user not found!')
    }

    next(null, user)
  })

  // Initialise Passport
  server.use(passport.initialize())
  server.use(passport.session())

  server.use(function (req, res, next) {
    // Check if a user has more than one role and let session expire after a
    // shorter period of time
    if (req.user && userIsInRoles(req.user, specialRoles)) {
      req.session.cookie.maxAge = SHORT_MAX_AGE_IN_MS
    }

    return next()
  })

  const close = () => {
    return store.close()
  }

  return {
    close
  }
}
