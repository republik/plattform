const { ApolloServer } = require('apollo-server-express')
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { execute, subscribe } = require('graphql')
const { logger: baseLogger } = require('@orbiting/backend-modules-logger')

const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const { transformUser } = require('@orbiting/backend-modules-auth')
const {
  COOKIE_NAME,
} = require('@orbiting/backend-modules-auth/lib/CookieOptions')
const { NODE_ENV, WS_KEEPALIVE_INTERVAL } = process.env

const documentApiKeyScheme = 'DocumentApiKey'

module.exports = async (
  server,
  httpServer,
  pgdb,
  graphqlSchema,
  createGraphqlContext = (identity) => identity,
) => {
  const executableSchema = makeExecutableSchema({
    ...graphqlSchema,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  })

  const createContext = ({ scope = undefined, user, req, ...rest } = {}) => {
    const authorization = req?.get('Authorization')
    const documentApiKey = authorization?.startsWith(documentApiKeyScheme)
      ? authorization.slice(documentApiKeyScheme.length + 1)
      : null

    const logger =
      req?.log || baseLogger.child({}, { msgPrefix: `[${scope}] ` })

    logger.setBindings({
      contextScope: scope,
      userId: user?.id || 'unknown user',
    })

    const context = createGraphqlContext({
      ...rest,
      req,
      scope,
      documentApiKey,
      logger,
      user: global && global.testUser !== undefined ? global.testUser : user,
    })
    // prime User dataloader with me
    if (
      context.user &&
      context.user.id && // global.testUser has no id
      context.loaders &&
      context.loaders.User
    ) {
      context.loaders.User.byId.prime(context.user.id, context.user)
    }
    return context
  }

  const webSocketOnConnect = async (connectionParams, websocket) => {
    try {
      // apollo-fetch used in tests sends cookie on the connectionParams
      const cookiesRaw =
        NODE_ENV === 'development' && connectionParams.cookies
          ? connectionParams.cookies
          : websocket.upgradeReq.headers.cookie
      if (!cookiesRaw) {
        return createContext({ scope: 'socket' })
      }
      const cookies = cookie.parse(cookiesRaw)
      const authCookie = cookies[COOKIE_NAME]
      const sid =
        authCookie &&
        cookieParser.signedCookie(authCookie, process.env.SESSION_SECRET)
      const session = sid && (await pgdb.public.sessions.findOne({ sid }))
      if (
        session &&
        session.sess &&
        session.sess.passport &&
        session.sess.passport.user
      ) {
        const user = await pgdb.public.users.findOne({
          id: session.sess.passport.user,
        })
        return createContext({
          scope: 'socket',
          user: transformUser(user),
        })
      }
      return createContext({ scope: 'socket' })
    } catch (e) {
      console.error('error in subscriptions.onConnect', e)
      // throwing inside onConnect disconnects the client
      throw new Error('error in subscriptions.onConnect')
    }
  }

  const apolloServer = new ApolloServer({
    schema: executableSchema,
    context: ({ req, res, connection }) =>
      connection
        ? connection.context
        : createContext({ user: req.user, req, res, scope: 'request' }),
    cache: 'bounded',
    introspection: true,
    playground: false, // see ./graphiql.js
    tracing: NODE_ENV === 'development',
    subscriptions: {
      onConnect: webSocketOnConnect,
      keepAlive: WS_KEEPALIVE_INTERVAL || 40000,
    },
    formatResponse: (response, { context }) => {
      // strip problematic character (\u2028) for requests from our iOS app
      // see https://github.com/orbiting/app/issues/159
      const { req } = context
      const ua = req.headers['user-agent']
      if (
        ua &&
        ua.includes('RepublikApp') &&
        (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod'))
      ) {
        return JSON.parse(JSON.stringify(response).replace(/\u2028/g, ''))
      }
      return response
    },
    plugins: [
      // https://www.apollographql.com/docs/apollo-server/v3/api/plugin/drain-http-server
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async requestDidStart() {
          return {
            async didEncounterErrors({ context, request, errors }) {
              if (context.logger.isLevelEnabled('debug')) {
                context.logger.error(
                  {
                    graphqlRequest: {
                      query: request.query,
                      variables: request.variables,
                      errors: errors,
                    },
                  },
                  `GraphQL error for operation '${request.operationName}'`,
                )
              } else {
                context.logger.error(
                  {
                    graphqlRequest: {
                      errors: errors,
                    },
                  },
                  `GraphQL error for operation '${request.operationName}'`,
                )
              }
            },
          }
        },
      },
    ],
  })

  // setup websocket server
  SubscriptionServer.create(
    {
      schema: executableSchema,
      execute: execute,
      subscribe: subscribe,
      onConnect: webSocketOnConnect,
      keepAlive: WS_KEEPALIVE_INTERVAL || 40000,
    },
    {
      server: httpServer,
      path: apolloServer.graphqlPath,
    },
  )

  await apolloServer.start()

  apolloServer.applyMiddleware({
    app: server,
    cors: false,
    bodyParserConfig: {
      limit: '128mb',
    },
  })
}
