const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const {makeExecutableSchema} = require('graphql-tools')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { execute, subscribe } = require('graphql')
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
  PUBLIC_WS_URL_PATH
} = process.env

module.exports = (server, pgdb, httpServer) => {
  const subscriptionServer = SubscriptionServer.create(
    {
      schema: executableSchema,
      execute,
      subscribe,
      onConnect: async (connectionParams, websocket) => {
        const cookies = cookie.parse(websocket.upgradeReq.headers.cookie)
        const sid = cookieParser.signedCookie(
          cookies['connect.sid'],
          process.env.SESSION_SECRET
        )
        const session = await pgdb.public.sessions.findOne({ sid })
        if (session) {
          const user = await pgdb.public.users.findOne({id: session.sess.passport.user})
          return { user }
        }
        return {}
      }
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
        pgdb,
        user: req.user,
        req,
        t,
        pubsub,
        redis: require('../lib/redis')
      }
    }
  })

  server.use('/graphql',
    bodyParser.json({limit: '8mb'}),
    graphqlMiddleware
  )
  server.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: PUBLIC_WS_URL_BASE + PUBLIC_WS_URL_PATH
  }))

  return subscriptionServer
}
