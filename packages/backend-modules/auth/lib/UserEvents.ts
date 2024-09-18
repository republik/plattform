const debug = require('debug')('auth:lib:UsersEvents')

const EventEmitter = require('node:events')

type EmailUpdatedEventArgs = {
  userId: string
  previousEmail: string
  newEmail: string
}

class UserEventEmitter extends EventEmitter {
  emitEmailUpdated(args: EmailUpdatedEventArgs) {
    debug('emitting user:update:email for %s', args.userId)
    this.emit('user:update:email', args)
  }

  onEmailUpdated(fn: (args: EmailUpdatedEventArgs) => void) {
    this.on('user:update:email', (e: EmailUpdatedEventArgs) => {
      debug('runing user:update:email for %s', e.userId)
      fn(e)
    })
  }
}

const UserEvents = new UserEventEmitter()

UserEvents.on('error', (error: any) => {
  console.error('Error processing user event: %s', error)
})

export = UserEvents
