const ENV = (
  typeof window !== 'undefined' &&
  (
    window.ENV ||
    (window.__NEXT_DATA__ && window.__NEXT_DATA__.env)
  )
) || process.env || {}

const SG_ENV = {}

const SG_PREFIX = /^(REACT_APP_)?SG_(.+)$/

Object.keys(ENV).forEach(key => {
  const matches = key.match(SG_PREFIX)
  if (matches) {
    SG_ENV[matches[2]] = ENV[key]
  }
})

export default SG_ENV
