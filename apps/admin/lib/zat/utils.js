export function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}

function decode(s) {
  return decodeURIComponent((s || '').replace(/\+/g, ' '));
}

export function queryParameters(queryString) {
  queryString = queryString || ''

  const result = {}
  let keyValuePairs, keyAndValue, key, value

  if (queryString.search(/\?|#/) === 0) {
    queryString = queryString.slice(1)
  }

  if (queryString.length === 0) {
    return result
  }

  keyValuePairs = queryString.split('&')

  for (let i = 0; i < keyValuePairs.length; i++) {
    keyAndValue = keyValuePairs[i].split('=')
    key = decode(keyAndValue[0])
    value = decode(keyAndValue[1]) || ''
    result[key] = value
  }

  return result
}

function isPromise(obj) {
  if (obj instanceof Promise) return true
  return !!obj && obj.then && typeof obj.then === 'function'
}

function shouldReject(val) {
  return val === false || val instanceof Error || typeof val === 'string'
}

export function isString(key) {
  return typeof key === 'string'
}

// When receives a list of things to wrap as Promises.
// it will then wait for:
//  a) all to settle
//  b) first to reject
//  c) first to settle with a falsy value
// c) is sub-optimal, since it has a specific narrow use-case
// for save hooks
export function when(items) {
  items = items || []
  let resolveAll, rejectAll
  const allResolvedPromise = new Promise((resolve, reject) => {
    resolveAll = resolve
    rejectAll = reject
  })

  let remaining = 0
  const settledWith = []
  const itemsCopy = Array.isArray(items) ? items.slice() : [items]

  function resolveWith(data, index) {
    settledWith[index] = data

    if (--remaining <= 0) {
      resolveAll(settledWith)
    }
  }

  remaining = itemsCopy.length

  if (remaining <= 0) {
    resolveAll()
    return allResolvedPromise
  }

  itemsCopy.forEach((item, index) => {
    let promise
    if (isPromise(item)) {
      promise = item
    } else if (typeof item === 'function') {
      let res
      try {
        res = item()
        if (isPromise(res)) {
          promise = res
        } else if (shouldReject(res)) {
          promise = Promise.reject(res)
        } else {
          promise = Promise.resolve(res)
        }
      } catch (err) {
        promise = Promise.reject(err)
      }
    } else {
      promise = new Promise((resolve, reject) => {
        shouldReject(item) ? reject(item) : resolve(item)
      })
    }
    promise
      .then((data) => {
        resolveWith(data, index)
      })
      .catch(rejectAll.bind(rejectAll))
  })

  return allResolvedPromise
}
