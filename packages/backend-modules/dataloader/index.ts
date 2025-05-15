import DataLoader from 'dataloader'

export interface StringObject {
  [key: string]: string
}

export type KeyConstraint = StringObject | string

const getCacheKey = (key: KeyConstraint) => {
  if (typeof key === 'string') {
    return key
  }
  if (typeof key === 'object') {
    return Object.keys(key)
      .sort()
      .reduce((agg, oneKey) => `${agg}${oneKey}:${key[oneKey]}`, '')
  }
  throw new Error('invalid key')
}

export interface ValueConstraint {
  id?: string
  [key: string]: any
}

interface CreateDataLoaderOptions<Key, Value>
  extends DataLoader.Options<Key, Value, string> {
  many?: boolean
}

function defaultFind<Value extends ValueConstraint>(
  key: KeyConstraint,
  rows: Value[],
  { many }: CreateDataLoaderOptions<KeyConstraint, Value> = {},
) {
  if (typeof key === 'string') {
    return rows.find((row) => row.id === key)
  }
  if (typeof key === 'object') {
    const keyFields = Object.keys(key)
    const matchRow = (row: Value) =>
      keyFields.every((keyField) => {
        if (Array.isArray(key[keyField])) {
          return key[keyField].includes(row[keyField])
        }

        return row[keyField] === key[keyField]
      })
    if (many) {
      return rows.filter(matchRow)
    }
    return rows.find(matchRow)
  }
}

type FindFunction<Key, Value> = (
  key: Key,
  rows: Value[],
  options?: { many?: boolean },
) => Value | Value[] | undefined

export default module.exports = function createDataLoader<
  Key extends KeyConstraint,
  Value extends ValueConstraint,
>(
  loader: (keys: readonly Key[]) => Promise<Value[]>,
  options?: CreateDataLoaderOptions<Key, Value> | null,
  find: FindFunction<Key, Value> = defaultFind,
) {
  const { many, ...dlOptions } = options || {}

  return new DataLoader(
    (keys) =>
      loader(keys)
        .then((rows) => Promise.all(rows)) // allow loaders to return array of promises
        .then((rows) => keys.map((key) => find(key, rows, { many }))),
    {
      cacheKeyFn: getCacheKey,
      maxBatchSize: 1000,
      ...dlOptions,
    },
  )
}
