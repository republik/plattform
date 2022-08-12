/**
 * Register a callback to be invoked when a message is received from the native side.
 * @param messageListener
 * @constructor
 */
import EventEmitter from 'events'

export function RegisterMessageListener(
  eventListener: (event) => void,
  acceptedEvents?: string | string[],
) {
  if (!acceptedEvents) {
    document.addEventListener('message', eventListener)
    return
  }
  document.addEventListener('message', (event) => {
    const {
      data: { content },
    } = event
    if (
      Array.isArray(acceptedEvents)
        ? acceptedEvents.includes(content.type)
        : content.type === acceptedEvents
    ) {
      eventListener(event)
    }
  })
  return
}

export function UnregisterMessageListener(eventListener: (event) => void) {
  document.removeEventListener('message', eventListener)
}
