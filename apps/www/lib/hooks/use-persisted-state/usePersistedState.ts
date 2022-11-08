import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react'
import useEventListener from '@use-it/event-listener'

import createGlobalState from './createGlobalState'
import { Storage } from './createStorage'

type UsePersistedStateHook<T> = [T, Dispatch<SetStateAction<T>>, boolean]

const usePersistedState = <T>(
  initialState: T,
  key: string,
  { get, set }: Storage<T>,
): UsePersistedStateHook<T> => {
  const globalState = useRef(null)
  const storageEventValue = useRef(null)
  const [persisted, setPersisted] = useState(true)
  const [state, setState] = useState<T>(() => {
    let state
    try {
      state = get(key, initialState)
    } catch (e) {
      state = initialState
      setPersisted(false)
    }
    return state
  })

  // subscribe to `storage` change events
  useEventListener('storage', ({ key: k, newValue }: StorageEvent) => {
    if (k === key) {
      const newState = newValue === null ? initialState : JSON.parse(newValue)
      if (state !== newState) {
        storageEventValue.current = newState
        setState(newState)
      }
    }
  })

  // only called on mount
  useEffect(() => {
    // register a listener that calls `setState` when another instance emits
    globalState.current = createGlobalState(key, setState, initialState)

    return () => {
      globalState.current.deregister()
    }
  }, [])

  // Only persist to storage if state changes.
  useEffect(() => {
    // do not write data recieved from storage event
    if (state !== null && storageEventValue.current === state) {
      return
    }
    // persist to localStorage
    try {
      set(key, state)
    } catch (e) {
      setPersisted(false)
    }

    // inform all of the other instances in this tab
    globalState.current.emit(state)
  }, [state])

  return [state, setState, persisted]
}

export default usePersistedState
