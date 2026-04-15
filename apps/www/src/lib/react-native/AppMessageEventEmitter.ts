import { EventEmitter } from 'events'

/**
 * AppMessageEventEmitter passes on unhandled messages from the app
 * which allows the messages to be hanlded in the individual components.
 */
const AppMessageEventEmitter = new EventEmitter()

export default AppMessageEventEmitter
