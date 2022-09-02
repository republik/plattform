import { useEffect } from 'react'
import AppMessageEventEmitter from './AppMessageEventEmitter'
import { useInNativeApp } from '../withInNativeApp'

type EventHandler<E> = (eventData: E) => Promise<void> | void

/**
 * useWebViewEvent allows to subscribe to events emitted by the web-ui.
 * @param eventName The name of the event to subscribe to.
 * @param handler The handler to call when the event is emitted.
 */
function useNativeAppEvent<E = Event>(
  eventName: string,
  handler: EventHandler<E>,
) {
  const { inNativeApp } = useInNativeApp()
  useEffect(() => {
    if (!inNativeApp) {
      return
    }

    AppMessageEventEmitter.addListener(eventName, handler)
    return () => {
      AppMessageEventEmitter.removeListener(eventName, handler)
    }
  }, [eventName, handler])
}

export default useNativeAppEvent
