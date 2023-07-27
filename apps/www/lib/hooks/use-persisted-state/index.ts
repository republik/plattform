import { useState } from 'react'
import { StorageProvider } from './StorageProvider'

import usePersistedState from './usePersistedState'
import createStorage from './createStorage'

const createPersistedState = <T>(
  key: string,
  customProvider?: StorageProvider,
) => {
  let provider = customProvider
  if (customProvider === undefined) {
    try {
      provider = global.localStorage
    } catch (e) {}
  }
  if (provider) {
    const storage = createStorage<T>(provider)
    return (initialState) => usePersistedState<T>(initialState, key, storage)
  }
  return useState<T>
}

export default createPersistedState
