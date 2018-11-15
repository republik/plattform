const DataLoader = require('dataloader')

const getCacheKey = (key) => {
  if (typeof key === 'string') {
    return key
  }
  if (typeof key === 'object') {
    return Object.keys(key)
      .sort()
      .reduce(
        (agg, oneKey) => `${agg}${oneKey}:${key[oneKey]}`,
        ''
      )
  }
  throw new Error('invalid key')
}

const defaultFind = (key, rows, keyField) => {
  if (typeof key === 'string') {
    return rows.find(
      row => row[keyField] === key
    )
  }
  if (typeof key === 'object') {
    const keyFields = Object.keys(key)
    return rows.find(
      row => keyFields.every(kf => row[kf] === key[kf])
    )
  }
  throw new Error('invalid key')
}

module.exports = (loader, options, keyField = 'id', find = defaultFind) =>
  new DataLoader(
    (keys) =>
      loader(keys)
        .then(rows => Promise.all(rows)) // allow loaders to return array of promises
        .then(rows =>
          keys.map(
            key => find(key, rows, keyField)
          )
        )
    ,
    {
      cacheKeyFn: getCacheKey,
      ...options
    }
  )
