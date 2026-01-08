const session = require('express-session')
const PgSession = require('connect-pg-simple')(session)

const transformUser = require('../lib/transformUser')
const basicAuthMiddleware = require('./basicAuth')
const { specialRoles, userIsInRoles } = require('../lib/Roles')
const {
  CookieExpirationTimeInMS,
  getCookieOptions,
  COOKIE_NAME,
} = require('../lib/CookieOptions')

exports.configure = ({
  server = null, // Express Server
  pgdb = null, // pogi connection
  // Secret used to encrypt session data on the server
  secret = null,
  // Max session age in ms
  // NB: With 'rolling: true' passed to session() the session expiry time will
  // be reset every time a user visits the site again before it expires.
  maxAge = CookieExpirationTimeInMS.DEFAULT_MAX_AGE, // 1 year
  maxAgeSpecialRoles = CookieExpirationTimeInMS.SHORT_MAX_AGE, // 1 week
  // is the server running in development
  dev = false,
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

  basicAuthMiddleware(server)

  // Sessions store for express-session
  const store = new PgSession({
    tableName: 'sessions',
    pool: pgdb.pool,
    pruneSessionInterval: 60 * 10, // 10mins
  })

  const cookieOptions = getCookieOptions()

  // Configure sessions
  server.use(
    session({
      secret,
      store,
      resave: false,
      rolling: true,
      saveUninitialized: false,
      httpOnly: true,
      name: COOKIE_NAME,
      cookie: {
        maxAge: maxAge,
        ...cookieOptions,
      },
    }),
  )

  // trust first proxy
  if (!dev) {
    server.set('trust proxy', 1)
  }

  // set user on req
  server.use(async (req, res, next) => {
    if (req.session && req.session.passport && req.session.passport.user) {
      req.user = await pgdb.public.users
        .findOne({
          id: req.session.passport.user,
        })
        .then(transformUser)
    }

    // Check if a user has more than one role and let session expire after a
    // shorter period of time
    if (req.user && userIsInRoles(req.user, specialRoles)) {
      req.session.cookie.maxAge = maxAgeSpecialRoles
    }

    return next()
  })

  const close = () => {
    return store.close()
  }

  return {
    close,
  }
}
