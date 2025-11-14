const { ApolloServer } = require('@apollo/server')
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')
const {
  ApolloServerPluginLandingPageProductionDefault,
} = require('@apollo/server/plugin/landingPage/default')
const { expressMiddleware } = require('@as-integrations/express4')
const express = require('express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { useServer } = require('graphql-ws/use/ws')
const { WebSocketServer } = require('ws')
const { logger: baseLogger } = require('@orbiting/backend-modules-logger')
const socketManager = require('../lib/socket-manager')
const ControlBus = require('../lib/ControlBus')

const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const { transformUser } = require('@orbiting/backend-modules-auth')
const {
  COOKIE_NAME,
} = require('@orbiting/backend-modules-auth/lib/CookieOptions')
const { validate, getOperationAST, GraphQLError, parse } = require('graphql')
const { NODE_ENV } = process.env

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
      context?.user?.id && // global.testUser has no id
      context?.loaders?.User
    ) {
      context.loaders.User.byId.prime(context.user.id, context.user)
    }

    logger.debug('gql context ready')

    return context
  }

  const apolloServer = new ApolloServer({
    schema: executableSchema,
    cache: 'bounded',
    introspection: true,
    playground: false, // see ./graphiql.js
    tracing: NODE_ENV === 'development',
    plugins: [
      ApolloServerPluginLandingPageProductionDefault({
        footer: false,
      }),
      // https://www.apollographql.com/docs/apollo-server/api/plugin/drain-http-server
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async requestDidStart() {
          return {
            async didEncounterErrors({
              contextValue: context,
              request,
              errors,
            }) {
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

  // setup websocket server with graphql-ws
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  useServer(
    {
      schema: executableSchema,
      onConnect: async (conn) => {
        // only allow connections for signed in users
        const authCtx = await authWebSocket(conn, pgdb)
        if (authCtx !== null) {
          conn.extra.sessionId = authCtx.sid
          conn.extra.authCtx = authCtx
          socketManager.addSocket(authCtx.sid, conn.extra.socket)
          return true
        }
      },
      onClose: (conn) => {
        if (conn.extra.sessionId) {
          socketManager.removeSocket(conn.extra.sessionId, conn.extra.socket)
        }
      },
      // hook to only allow subscription operations over the websocket connection
      onSubscribe: (_conn, _id, payload) => {
        const args = {
          schema: executableSchema,
          operationName: payload.operationName,
          document: parse(payload.query),
          variableValues: payload.variables,
        }
        const operationAST = getOperationAST(args.document, args.operationName)
        if (!operationAST) {
          return [new GraphQLError('Unable to identify operation')]
        }
        if (operationAST.operation !== 'subscription') {
          return [
            new GraphQLError('Only subscription operations are supported'),
          ]
        }
        const errors = validate(args.schema, args.document)
        if (errors.length > 0) {
          return errors
        }

        return args
      },
      context: async (conn) => {
        try {
          const gqlContext = await createContext({
            scope: 'socket',
            user: transformUser(conn.extra.authCtx.user),
          })

          return gqlContext
        } catch (e) {
          throw new Error('Unautherised websocket connection')
        }
      },
    },
    wsServer,
  )

  ControlBus.subscribe('auth:logout', ({ sessionId }) => {
    socketManager.closeConnections(sessionId)
  })

  await apolloServer.start()
  server.use(
    '/graphql',
    jsonBodyMiddleware,
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        return createContext({ user: req.user, req, res, scope: 'request' })
      },
    }),
  )
}

const standardJsonParser = express.json({ limit: '10mb' })
const trustedJsonParser = express.json({ limit: '128mb' })
const TRUSTED_GQL_CLIENT = process.env.TRUSTED_GQL_CLIENT ?? null

function jsonBodyMiddleware(req, res, next) {
  const client = req.get('apollographql-client-name') ?? 'unknown-client'

  const isTrusted =
    TRUSTED_GQL_CLIENT && TRUSTED_GQL_CLIENT === client ? '128mb' : '10mb'

  req.log.debug(
    {
      limit: isTrusted ? '128mb' : '10mb',
      trustedClient: TRUSTED_GQL_CLIENT,
      client,
    },
    'json body parser limit set',
  )

  if (isTrusted) {
    return trustedJsonParser(req, res, next)
  } else {
    return standardJsonParser(req, res, next)
  }
}

/**
 * Authenticate a websocket connection
 * @param {import('graphql-ws').Context} conn
 */
async function authWebSocket(conn, pgdb) {
  const authCookie = getSessionCookieFromWebSocket(conn)
  const sid = cookieParser.signedCookie(authCookie, process.env.SESSION_SECRET)
  if (!sid) {
    return null
  }

  const user = await getUserBySessionId(sid, pgdb)
  if (!user) {
    return null
  }

  return { sid, user }
}

/**
 * Extract session cookie form websocket request
 * @param {import('graphql-ws').Context} conn
 */
function getSessionCookieFromWebSocket(conn) {
  // apparently apollo fetch in tests passes the cookie as connectionParams
  const cookieHeader =
    NODE_ENV === 'development' && conn.connectionParams?.cookies
      ? conn.connectionParams?.cookies
      : conn.extra.request.headers.cookie

  const cookies = cookie.parse(cookieHeader)
  const authCookie = cookies[COOKIE_NAME]

  return authCookie
}

async function getUserBySessionId(sid, pgdb) {
  const user = await pgdb.public.queryOne(
    `SELECT u.* FROM sessions s JOIN users u on u.id = (s.sess->'passport'->>'user')::uuid WHERE s.sid = :sid;`,
    { sid: sid },
  )

  return user
}
