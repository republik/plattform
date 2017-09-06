const { createApolloFetch } = require('apollo-fetch')

// as soon as we get a cookie we use it for apollo fetch requests
let cookie
module.exports = (uri) => createApolloFetch({uri})
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
