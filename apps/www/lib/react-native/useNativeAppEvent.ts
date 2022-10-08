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
  callbackDependencies: ReadonlyArray<any> = [],
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
      console.log('useNativeAppEvent received', eventName, evenData)
      return savedCallback?.current(evenData)
    }
    console.log('useNativeAppEvent setup', eventName)
    AppMessageEventEmitter.addListener(eventName, handler)
    return () => {
      console.log('useNativeAppEvent teardown', eventName)
      AppMessageEventEmitter.removeListener(eventName, handler)
    }
  }, [eventName, ...callbackDependencies])
}

export default useNativeAppEvent
