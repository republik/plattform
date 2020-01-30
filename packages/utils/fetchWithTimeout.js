const fetch = require('isomorphic-unfetch')
const AbortController = require('abort-controller')
const debug = require('debug')('fetch')

const fetchWithTimeout = (
  url,
  options = {},
  timeoutSecs
) => {
  if (!url || !timeoutSecs) {
    throw new Error('missing argument!')
  }

  const controller = new AbortController()
  const timeout = setTimeout(
    () => { controller.abort() },
    timeoutSecs * 1000
  )

  return fetch(
    url,
    {
      ...options,
      signal: controller.signal
    }
  )
    .catch(error => {
      if (error.name === 'AbortError') {
        debug('TimeoutError: request to: %s failed', url)
      } else {
        debug(error.toString())
      }
    })
    .finally(() => {
      clearTimeout(timeout)
    })
}

module.exports = fetchWithTimeout
