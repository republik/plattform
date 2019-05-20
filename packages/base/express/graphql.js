const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('apollo-server')

const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const { transformUser } = require('@orbiting/backend-modules-auth')
const util = require('util')

const {
  NODE_ENV,
  WS_KEEPALIVE_INTERVAL,
  RES_KEEPALIVE
} = process.env

module.exports = (
  server,
  httpServer,
  pgdb,
  graphqlSchema,
  createGraphqlContext = identity => identity
) => {
  const executableSchema = makeExecutableSchema(graphqlSchema)

  const createContext = ({ user, ...context } = {}) => createGraphqlContext({
    ...context,
    user: (global && global.testUser !== undefined)
      ? global.testUser
      : user
  })

  const apolloServer = new ApolloServer({
    schema: executableSchema,
    context: ({ req, connection }) => connection
      ? connection.context
      : createContext({ user: req.user, req }),
    debug: true,
    introspection: true,
    playground: false, // see ./graphiql.js
    subscriptions: {
      onConnect: async (connectionParams, websocket) => {
        try {
          // apollo-fetch used in tests sends cookie on the connectionParams
          const cookiesRaw = (NODE_ENV === 'development' && connectionParams.cookies)
            ? connectionParams.cookies
            : websocket.upgradeReq.headers.cookie
          if (!cookiesRaw) {
            return createContext()
          }
          const cookies = cookie.parse(cookiesRaw)
          const sid = cookieParser.signedCookie(
            cookies['connect.sid'],
            process.env.SESSION_SECRET
          )
          const session = sid && await pgdb.public.sessions.findOne({ sid })
          if (session && session.sess && session.sess.passport && session.sess.passport.user) {
            const user = await pgdb.public.users.findOne({ id: session.sess.passport.user })
            return createContext({
              user: transformUser(user)
            })
          }
          return createContext()
        } catch (e) {
          console.error('error in subscriptions.onConnect', e)
          // throwing inside onConnect disconnects the client
          throw new Error('error in subscriptions.onConnect')
        }
      },
      keepAlive: WS_KEEPALIVE_INTERVAL || 40000
    },
    formatError: (error) => {
      console.log(
        `graphql error in ${this.operationName} (${JSON.stringify(this.variables)}):`,
        util.inspect(error, { depth: null, colors: true, breakLength: 300 })
      )
      delete error.extensions.exception
      return error
    },
    formatResponse: (response, { context }) => {
      // strip problematic character (\u2028) for requests from our iOS app
      // see https://github.com/orbiting/app/issues/159
      const { req } = context
      const ua = req.headers['user-agent']
      if (ua && ua.includes('RepublikApp') && (
        ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')
      )) {
        return JSON.parse(
          JSON.stringify(response).replace(/\u2028/g, '')
        )
      }
      return response
    }
  })

  if (RES_KEEPALIVE) {
    server.use('/graphql', require('./keepalive'))
  }

  apolloServer.applyMiddleware({
    app: server,
    cors: false,
    bodyParserConfig: {
      limit: '128mb'
    }
  })
  apolloServer.installSubscriptionHandlers(httpServer)
}
