import { StorageProvider } from './StorageProvider'

export type Storage<T> = {
  // todo: ensure t can be a both a fixed default value or a Supplier<T>
  get: (key: string, defaultValue: T) => T
  set: (key: string, value: T) => void
}

/**
 * Create a storage provider that can be used to persist state across sessions.
 */
function createStorage<T = object>(provider: StorageProvider): Storage<T> {
  return {
    // todo: ensure t can be a both a fixed default value or a Supplier<T>
    get(key: string, defaultValue: T | (() => T)) {
      const json = provider.getItem(key)
      if (json) {
        return JSON.parse(json) as T
      }
      return typeof defaultValue === 'function'
        ? (defaultValue as () => T)() // typescript fix to prevent not callable typescript error
        : defaultValue
    },
    set(key: string, value: T) {
      if (value === undefined) {
        provider.removeItem(key)
      } else {
        provider.setItem(key, JSON.stringify(value))
      }
    },
  }
}

export default createStorage
