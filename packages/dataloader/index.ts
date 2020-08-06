import DataLoader from 'dataloader'

interface StringObject {
  [key: string]: string;
}

type KeyType = StringObject | string

const getCacheKey = (key: KeyType) => {
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

interface CreateDataLoaderOptions<LoadedValue> extends DataLoader.Options<KeyType, LoadedValue, string> {
  many?: boolean;
}

function defaultFind<LoadedValue>(
  key: KeyType,
  rows: AnyObject[],
  { many }: CreateDataLoaderOptions<LoadedValue> = {}
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

export default function createDataLoader<LoadedValue>(
  loader: (keys: readonly KeyType[]) => Promise<LoadedValue[]>,
  options?: CreateDataLoaderOptions<LoadedValue>,
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
