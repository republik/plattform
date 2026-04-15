import { useEffect, useRef } from 'react'
import AppMessageEventEmitter from './AppMessageEventEmitter'
import { useInNativeApp } from '../withInNativeApp'

type EventHandler<E> = (eventData: E) => Promise<void> | void

/**
 * useWebViewEvent allows to subscribe to events emitted by the web-ui.
 * @param eventName The name of the event to subscribe to.
 * @param callback The callback to call when the event is emitted.
 */
function useNativeAppEvent<E = Event>(
  eventName: string,
  callback: EventHandler<E>,
  callbackDependencies: ReadonlyArray<unknown> = [],
) {
  const { inNativeApp } = useInNativeApp()
  const savedCallback = useRef<EventHandler<E>>(callback)

  useEffect(() => {
    savedCallback.current = callback
  })

  useEffect(() => {
    if (!inNativeApp) {
      return
    }

    const handler = (evenData: E) => {
      return savedCallback?.current(evenData)
    }
    AppMessageEventEmitter.addListener(eventName, handler)

    return () => {
      AppMessageEventEmitter.removeListener(eventName, handler)
    }
  }, [eventName, ...callbackDependencies])
}

export default useNativeAppEvent
