import DataLoader from 'dataloader'

interface StringObject {
  [key: string]: string;
}

type KeyConstraint = StringObject | string

const getCacheKey = (key: KeyConstraint) => {
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

interface AnyObject {
  [key: string]: any;
}

interface CreateDataLoaderOptions<Key, LoadedValue> extends DataLoader.Options<Key, LoadedValue, string> {
  many?: boolean;
}

function defaultFind<Key, LoadedValue>(
  key: KeyConstraint,
  rows: AnyObject[],
  { many }: CreateDataLoaderOptions<Key, LoadedValue> = {}
) {
  if (typeof key === 'string') {
    return rows.find(
      row => row.id === key
    )
  }
  if (typeof key === 'object') {
    const keyFields = Object.keys(key)
    const matchRow = (row: any) =>
      keyFields.every(keyField => row[keyField] === key[keyField])
    if (many) {
      return rows.filter(matchRow)
    }
    return rows.find(matchRow)
  }
}

export default function createDataLoader<Key extends KeyConstraint, LoadedValue>(
  loader: (keys: readonly Key[]) => Promise<LoadedValue[]>,
  options?: CreateDataLoaderOptions<Key, LoadedValue> | null,
  find = defaultFind
){
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
