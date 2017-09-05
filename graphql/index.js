const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const {makeExecutableSchema} = require('graphql-tools')
const { createApolloFetch } = require('apollo-fetch')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { execute, subscribe } = require('graphql')
const { pubsub } = require('../lib/RedisPubSub')
const redis = require('../lib/redis')
const cookie = require('cookie')
const cookieParser = require('cookie-parser')

const Schema = require('./schema')
const Resolvers = require('./resolvers/index')

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers
})

const {
  LOG_PROXY,
  PUBLIC_WS_URL_BASE,
  PUBLIC_WS_URL_PATH
} = process.env
const util = require('util')

module.exports = (server, pgdb, httpServer) => {
  SubscriptionServer.create(
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
        pubsub,
        redis
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

  server.post('/github/graphql', bodyParser.json(), (req, res, next) => {
    if (LOG_PROXY) {
      console.log('\nrequest: ---------------')
      console.log(util.inspect(req.body, {depth: null}))
    }

    // intercept queries to handle locally
    const {operationName} = req.body
    const interceptOperations = ['commit', 'uncommittedChanges']
    if (interceptOperations.indexOf(operationName) > -1) {
      return next()
    }

    const githubFetch = createApolloFetch({
      uri: 'https://api.github.com/graphql'
    }).use(({ request, options }, ghNext) => {
      if (!options.headers) {
        options.headers = {}
      }
      options.headers['Authorization'] = `Bearer ${req.user.githubAccessToken}`
      ghNext()
    })

    return githubFetch(req.body).then(result => {
      if (LOG_PROXY) {
        console.log('\nresponse: --------------')
        console.log(util.inspect(result, {depth: null}))
      }
      return res.json(result)
    }).catch(error => {
      if (LOG_PROXY) {
        console.log('\nerror: -----------------')
        console.log(util.inspect(error, {depth: null}))
      }
      return res.status(503).json({
        errors: [error.toString()]
      })
    })
  }, graphqlMiddleware)

  server.use(
    '/github/graphiql',
    graphiqlExpress({
      endpointURL: '/github/graphql'
    })
  )
}
