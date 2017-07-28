const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const {makeExecutableSchema} = require('graphql-tools')
const { createApolloFetch } = require('apollo-fetch')

const Schema = require('./schema')
const Resolvers = require('./resolvers/index')

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers
})

const logProxyQueries = false
const util = require('util')

module.exports = (server, pgdb) => {
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
        req
      }
    }
  })

  server.use('/graphql',
    bodyParser.json({limit: '8mb'}),
    graphqlMiddleware
  )
  server.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql'
  }))

  server.post('/github/graphql', bodyParser.json(), (req, res, next) => {
    if (logProxyQueries) {
      console.log('\nrequest: ---------------')
      console.log(util.inspect(req.body, {depth: null}))
    }
    if (req.body.operationName === 'commit') {
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
      if (logProxyQueries) {
        console.log('\nresponse: --------------')
        console.log(util.inspect(result, {depth: null}))
      }
      return res.json(result)
    }).catch(error => {
      if (logProxyQueries) {
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
