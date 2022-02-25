import { useState } from 'react'

import usePersistedState from './usePersistedState'
import createStorage from './createStorage'

const createPersistedState = (key, customProvider) => {
  let provider = customProvider
  if (customProvider === undefined) {
    try {
      provider = global.localStorage
    } catch (e) {}
  }
  if (provider) {
    const storage = createStorage(provider)
    return (initialState) => usePersistedState(initialState, key, storage)
  }
  return useState
}

export default createPersistedState
