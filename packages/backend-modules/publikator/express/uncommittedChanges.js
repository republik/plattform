const bodyParser = require('body-parser')
const { createApolloFetch } = require('apollo-fetch')
const { PORT } = process.env

const handleUncomittedChanges = async (req, res) => {
  const apolloFetch = createApolloFetch({
    uri: `http://localhost:${PORT}/graphql`,
  }).use(({ options }, next) => {
    if (!options.headers) {
      options.headers = {}
    }
    options.headers.Cookie = req.get('Cookie')
    next()
  })

  const result = await apolloFetch({
    query: `
      mutation uncommittedChanges(
        $repoId: ID!
        $action: Action!
      ){
        uncommittedChanges(
          repoId: $repoId
          action: $action
        )
      }
    `,
    variables: {
      repoId: req.body.repoId,
      action: req.body.action,
    },
  })

  return res.status(result.errors ? 400 : 200).end()
}

// this route exists because navigator.sendBeacon, used to clear uncommittedChanges on-close, doesn't allow json.https://bugs.chromium.org/p/chromium/issues/detail?id=490015
module.exports = (server) => {
  server.post(
    '/uncommittedChanges', // @TODO: This route shall become deprecated
    bodyParser.json({ type: 'text/plain' }),
    handleUncomittedChanges,
  )
  server.post(
    '/publikator/uncommittedChanges',
    bodyParser.json({ type: 'text/plain' }),
    handleUncomittedChanges,
  )
}
