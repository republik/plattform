const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { execute, subscribe } = require('graphql')
const { pubsub } = require('../lib/RedisPubSub')
const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const checkEnv = require('check-env')
const { transformUser } = require('@orbiting/backend-modules-auth')
const redis = require('../lib/redis')

checkEnv([
  'PUBLIC_WS_URL_BASE',
  'PUBLIC_WS_URL_PATH'
])
const {
  PUBLIC_WS_URL_BASE,
  PUBLIC_WS_URL_PATH,
  NODE_ENV,
  ENGINE_API_KEY,
  WS_KEEPALIVE_INTERVAL
} = process.env

module.exports = (
  server,
  pgdb,
  httpServer,
  executableSchema,
  externalCreateGraphQLContext = a => a
) => {
  const createContext = ({user, ...additional} = {}) => externalCreateGraphQLContext({
    ...additional,
    pgdb,
    user,
    pubsub,
    redis
  })

  const subscriptionServer = SubscriptionServer.create(
    {
      schema: executableSchema,
      execute,
      subscribe,
      onConnect: async (connectionParams, websocket) => {
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
        if (session) {
          const user = await pgdb.public.users.findOne({id: session.sess.passport.user})
          return createContext({
            user: transformUser(user)
          })
        }
        return createContext()
      },
      keepAlive: WS_KEEPALIVE_INTERVAL || 40000
    },
    {
      server: httpServer,
      path: PUBLIC_WS_URL_PATH
    }
  )

  const graphqlMiddleware = graphqlExpress((req) => {
    return {
      debug: false,
      formatError (error) {
        console.log(
          `graphql error in ${this.operationName} (${JSON.stringify(this.variables)}):`,
          error
        )
        return error
      },
      schema: executableSchema,
      context: createContext({
        user: req.user,
        req
      }),
      tracing: !!ENGINE_API_KEY
    }
  })

  server.use('/graphql',
    bodyParser.json({limit: '128mb'}),
    graphqlMiddleware
  )
  server.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: PUBLIC_WS_URL_BASE + PUBLIC_WS_URL_PATH
  }))

  return subscriptionServer
}
