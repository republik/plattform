const { CHROMIUM_LAMBDA_URL } = process.env

if (!CHROMIUM_LAMBDA_URL) {
  console.warn(
    'missing CHROMIUM_LAMBDA_URL, the /render endpoint will not work',
  )
}

const render = (params) => {
  if (!CHROMIUM_LAMBDA_URL) {
    throw new Error("missing CHROMIUM_LAMBDA_URL, can't render")
  }
  const url = new URL(CHROMIUM_LAMBDA_URL)
  for (const key of Object.keys(params)) {
    // Don't pass format to screenshot service
    if (key !== 'format') {
      url.searchParams.set(key, params[key])
    }
  }

  return fetch(url.toString()).then((res) => {
    if (!res.ok) {
      throw new Error(
        `render failed with status ${res.status} - ${res.statusText}`,
      )
    }
    return res.body
  })
}

module.exports = render
