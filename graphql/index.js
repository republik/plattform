const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const { makeExecutableSchema } = require('graphql-tools')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { pubsub } = require('../lib/RedisPubSub')
const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const t = require('../lib/t')

const Schema = require('./schema')
const Resolvers = require('./resolvers/index')

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers
})

const {
  PUBLIC_WS_URL_BASE,
  PUBLIC_WS_URL_PATH,
  NODE_ENV,
  ENGINE_API_KEY
} = process.env

module.exports = (server, pgdb, httpServer) => {
  const context = {
    pgdb,
    t,
    pubsub
  }

  const subscriptionServer = SubscriptionServer.create(
    {
      schema: executableSchema,
      execute,
      subscribe,
      onConnect: async (connectionParams, websocket) => {
        const cookiesRaw = (NODE_ENV === 'testing')
          ? connectionParams.cookies
          : websocket.upgradeReq.headers.cookie
        if (!cookiesRaw) {
          return context
        }
        const cookies = cookie.parse(cookiesRaw)
        const sid = cookieParser.signedCookie(
          cookies['connect.sid'],
          process.env.SESSION_SECRET
        )
        const session = await pgdb.public.sessions.findOne({ sid })
        if (session) {
          const user = await pgdb.public.users.findOne({id: session.sess.passport.user})
          return {
            ...context,
            user
          }
        }
        return context
      },
      keepAlive: 40000
    },
    {
      server: httpServer,
      path: PUBLIC_WS_URL_PATH
    }
  )

  const graphqlMiddleware = graphqlExpress((req) => {
    return {
      debug: false,
      formatError: (error) => {
        console.error('error in graphql', error)
        return error
      },
      schema: executableSchema,
      context: {
        ...context,
        req,
        user: req.user,
        t
      },
      tracing: !!ENGINE_API_KEY
    }
  })

  server.use('/graphql',
    bodyParser.json({limit: '64mb'}),
    graphqlMiddleware
  )
  server.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: PUBLIC_WS_URL_BASE + PUBLIC_WS_URL_PATH
  }))

  return subscriptionServer
}
