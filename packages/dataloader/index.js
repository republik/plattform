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

const defaultFind = (key, rows, { many } = {}) => {
  if (typeof key === 'string') {
    return rows.find(
      row => row.id === key
    )
  }
  if (typeof key === 'object') {
    const keyFields = Object.keys(key)
    const matchRow = row =>
      keyFields.every(keyField => row[keyField] === key[keyField])
    if (many) {
      return rows.filter(matchRow)
    }
    return rows.find(matchRow)
  }
  throw new Error('invalid key')
}

module.exports = (loader, options, find = defaultFind) => {
  const { many, ...dlOptions } = options || {}

  return new DataLoader(
    (keys) =>
      loader(keys)
        .then(rows => Promise.all(rows)) // allow loaders to return array of promises
        .then(rows =>
          keys.map(
            key => find(key, rows, { many })
          )
        )
    ,
    {
      cacheKeyFn: getCacheKey,
      maxBatchSize: 1000,
      ...dlOptions
    }
  )
}
