const { createApolloFetch } = require('apollo-fetch')

module.exports = port => () => {
  const GRAPHQL_URI = `http://localhost:${port}/graphql`
  let cookie
  return createApolloFetch({ uri: GRAPHQL_URI })
    .useAfter(({ response }, next) => {
      let setCookie
      try {
        setCookie = response.headers._headers['set-cookie'][0]
      } catch (e) {}
      if (setCookie) {
        cookie = setCookie.split(';')[0]
      }
      next()
    })
    .use(({ options }, next) => {
      if (cookie) {
        if (!options.headers) {
          options.headers = {}
        }
        options.headers['Cookie'] = cookie
      }
      next()
    })
}
