const debug = require('debug')('matomo:api')
const Promise = require('bluebird')
const fetch = require('node-fetch')

const retry = require('@zeit/fetch-retry')

fetch.Promise = Promise
const fetchRetry = retry(fetch)

const api = (options, { tokenAuth, endpoint }) => {
  const fetchUrl = new URL(endpoint)
  fetchUrl.searchParams.append('module', 'API')
  fetchUrl.searchParams.append('format', 'JSON')
  fetchUrl.searchParams.append('token_auth', tokenAuth)

  Object.keys(options).forEach(name => {
    if (options[name] !== undefined && options[name] !== null) {
      fetchUrl.searchParams.append(name, options[name])
    }
  })

  debug('api() %o', { options, url: fetchUrl.toString() })

  return fetchRetry(fetchUrl.toString())
    .then(body => body.json())
    .then(res => {
      if (res.result === 'error') {
        throw new Error(res.message)
      }

      return res
    })
}

const scroll = async (
  options,
  {
    idSite,
    limit = false, // Rows
    size = 1000,
    offset = 0,
    rowCallback = () => {},
    rowConcurrency = 1,
    tokenAuth,
    endpoint
  } = {}
) => {
  let results = []
  const pagination = Object.assign({}, { offset, size })

  do {
    results = await api({
      idSite,
      ...options,
      filter_offset: pagination.offset,
      filter_limit: pagination.size
    }, {
      tokenAuth,
      endpoint
    })

    const count = pagination.offset + results.length - offset

    if (limit && limit <= count) {
      results = results.slice(
        0,
        results.length + (limit - count)
      )
    }

    await Promise.map(results, rowCallback, { concurrency: rowConcurrency })

    pagination.offset += pagination.size
  } while (results.length === pagination.size)
}

module.exports = {
  api,
  scroll,
  getInstance: ({ tokenAuth, endpoint, rowConcurrency }) => ({
    api: (options) => api(options, { tokenAuth, endpoint }),
    scroll: (options, settings) => scroll(options, { ...settings, tokenAuth, endpoint, rowConcurrency })
  })
}
