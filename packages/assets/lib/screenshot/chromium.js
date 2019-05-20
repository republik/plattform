const fetch = require('isomorphic-unfetch')

const {
  CHROMIUM_LAMBDA_URL,
  RENDER_COOKIE,
  BASIC_AUTH_USER,
  BASIC_AUTH_PASS
} = process.env

if (!CHROMIUM_LAMBDA_URL) {
  console.warn('missing CHROMIUM_LAMBDA_URL, the /render endpoint will not work')
}

const render = (params) => {
  if (!CHROMIUM_LAMBDA_URL) {
    throw new Error("missing CHROMIUM_LAMBDA_URL, can't render")
  }
  const url = new URL(CHROMIUM_LAMBDA_URL)
  for (let key of Object.keys(params)) {
    url.searchParams.set(key, params[key])
  }
  if (RENDER_COOKIE) {
    url.searchParams.set('cookie', RENDER_COOKIE)
  }
  if (BASIC_AUTH_USER) {
    url.searchParams.set('basicAuthUser', BASIC_AUTH_USER)
    url.searchParams.set('basicAuthPass', BASIC_AUTH_PASS)
  }
  return fetch(url.toString())
    .then(result => result.body)
}

module.exports = render
