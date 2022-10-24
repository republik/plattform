const fetch = require('isomorphic-unfetch')

const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response
  }

  const error = new Error(response.status + ' ' + response.statusText)
  error.response = response

  return response.text().then(
    (body) => {
      error.responseBody = body
      throw error
    },
    () => {
      throw error
    },
  )
}

module.exports = (url, options) => {
  // const start = Date.now()
  return fetch(url, options)
    .then((response) => {
      // const end = Date.now()
      // console.info('[fetch]', url)
      // console.info(`${response.status} ${end - start}ms`)

      return response
    })
    .then(checkStatus)
    .then((response) => response.json().then((json) => ({ response, json })))
}
