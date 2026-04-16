import createStorage from './createStorage'
import { StorageProvider } from './StorageProvider'

let mockStorage = {}

export function mockStorageProvider(): StorageProvider {
  return {
    getItem(key: string): string | null {
      return mockStorage[key]
    },
    setItem(key: string, value: string): void {
      mockStorage[key] = value
    },
    removeItem(key: string): void {
      delete mockStorage[key]
    },
  }
}

type ExampleObject = { value: string }

describe('createStorage test-suite', () => {
  const storage = createStorage<ExampleObject>(mockStorageProvider())

  beforeEach(() => {
    mockStorage = {}
  })

  it('should enable persisting and retrieval of objects', () => {
    // Set value
    storage.set('key', { value: 'foo' })
    expect(mockStorage['key']).toEqual(JSON.stringify({ value: 'foo' }))
    // Get previously stored value
    expect(storage.get('key', { value: 'default' })).toEqual({ value: 'foo' })
  })

  it('should return absolute default-value as fallback', () => {
    // Test absolut default value
    expect(storage.get('foo', { value: 'bar' })).toEqual({
      value: 'bar',
    })
    // Test default value from supplier
    expect(
      storage.get(
        'baz',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        () => ({ value: 'baz' }),
      ),
    ).toEqual({
      value: 'baz',
    })
  })
})

export {}
