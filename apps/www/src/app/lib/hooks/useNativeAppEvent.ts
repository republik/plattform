import { usePostMessage } from './usePostMessage'
import { useEffect, useRef } from 'react'
// eslint-disable-next-line no-unused-vars
type EventHandler<E> = (_: E) => Promise<void> | void

/**
 * useNativeAppEvent is a hook that allows you to subscribe to events emitted by the native app.
 * via the window.postMessage API.
 * @param eventName The name of the event to subscribe to.
 * @param callback The callback to call when the event is emitted.
 */
function useNativeAppEvent<E = unknown>(
  eventName: string,
  callback: EventHandler<E>,
  callbackDependencies: ReadonlyArray<unknown> = [],
) {
  const savedCallback = useRef<EventHandler<E>>(callback)
  const postMessage = usePostMessage()

  useEffect(() => {
    savedCallback.current = callback
  })

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event?.data?.content?.type === eventName) {
        savedCallback?.current(event.data.content)
        // Acknowledge to app that message has been handled. Otherwise the app will continue to send it ...
        postMessage({
          type: 'ackMessage',
          id: event?.data?.id,
        })
      }
    }

    document.addEventListener('message', handler)

    return () => document.removeEventListener('message', handler)
  }, [eventName, postMessage, ...callbackDependencies])
}

export default useNativeAppEvent
