const bodyParser = require('body-parser')
const { graphiqlExpress } = require('apollo-server-express')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { execute, subscribe } = require('graphql')
const { pubsub } = require('../lib/RedisPubSub')
const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const checkEnv = require('check-env')
const { transformUser } = require('@orbiting/backend-modules-auth')
const redis = require('../lib/redis')
const elasticsearch = require('../lib/elastic')
const { runHttpQuery } = require('apollo-server-core')

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

// Custom Request Handler for clean way to intercept and modify response
// Original: https://github.com/apollographql/apollo-server/blob/b32e89c06008719d2fb45e5e22a767625ea13c0a/packages/apollo-server-express/src/expressApollo.ts#L25
// Modifications
// - strips problematic character (\u2028) for requests from our iOS app
//   see https://github.com/orbiting/app/issues/159
function graphqlExpress (options) {
  const graphqlHandler = (req, res, next) => {
    runHttpQuery([req, res], {
      method: req.method,
      options: options,
      query: req.method === 'POST' ? req.body : req.query
    }).then(
      originalGQLResponse => {
        let gqlResponse = originalGQLResponse
        const ua = req.headers['user-agent']

        if (ua && ua.includes('RepublikApp') && (
          ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')
        )) {
          gqlResponse = gqlResponse.replace(/\u2028/g, '')
        }

        res.setHeader('Content-Type', 'application/json')
        res.setHeader(
          'Content-Length',
          Buffer.byteLength(gqlResponse, 'utf8').toString()
        )
        res.write(gqlResponse)
        res.end()
      },
      error => {
        if (error.name !== 'HttpQueryError') {
          return next(error)
        }

        if (error.headers) {
          Object.keys(error.headers).forEach(header => {
            res.setHeader(header, error.headers[header])
          })
        }

        res.statusCode = error.statusCode
        res.write(error.message)
        res.end()
      }
    )
  }

  return graphqlHandler
}

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
    redis,
    elastic: elasticsearch.client()
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
