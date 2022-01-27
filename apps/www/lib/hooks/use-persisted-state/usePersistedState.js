import { useState, useEffect, useRef } from 'react'
import useEventListener from '@use-it/event-listener'

import createGlobalState from './createGlobalState'

const usePersistedState = (initialState, key, { get, set }) => {
  const globalState = useRef(null)
  const storageEventValue = useRef(null)
  const [persisted, setPersisted] = useState(true)
  const [state, setState] = useState(() => {
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
  useEventListener('storage', ({ key: k, newValue }) => {
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
    if (storageEventValue.current === state) {
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
