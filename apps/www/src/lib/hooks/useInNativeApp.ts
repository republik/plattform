import { useEffect, useRef } from 'react'
import { z } from 'zod'
// eslint-disable-next-line no-unused-vars
type EventHandler<E> = (_: E) => Promise<void> | void

const MessageSchema = z.object({
  content: z.object({
    id: z.string(),
    type: z.string(),
    payload: z.any(),
  }),
})

/**
 * useNativeAppEvent is a hook that allows you to subscribe to events emitted by the native app.
 * via the window.postMessage API.
 * @param eventName The name of the event to subscribe to.
 * @param callback The callback to call when the event is emitted.
 */
function useNativeAppEvent<E = Event>(
  eventName: string,
  callback: EventHandler<E>,
  callbackDependencies: ReadonlyArray<unknown> = [],
) {
  const savedCallback = useRef<EventHandler<E>>(callback)

  useEffect(() => {
    savedCallback.current = callback
  })

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (MessageSchema.safeParse(event?.data).success) {
        const { content } = event.data as z.infer<typeof MessageSchema>
        if (content?.type === eventName) {
          savedCallback?.current(event.data.content)
        }
      }
    }
    document.addEventListener('message', handler)

    return () => document.removeEventListener('message', handler)
  }, [eventName, ...callbackDependencies])
}

export default useNativeAppEvent
