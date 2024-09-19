const debug = require('debug')('auth:lib:UsersEvents')
const EventEmitter = require('node:events')

type EmailUpdatedEvent = {
  userId: string
  previousEmail: string
  newEmail: string
}

type SignedInEvent = {
  userId: string
  isNew: boolean
  contexts: string[]
}

class UserEventEmitter extends EventEmitter {
  emitSignedIn(args: SignedInEvent) {
    debug('emitting user:action:sigendIn for %s', args.userId)
    this.emit('user:action:sigendIn', args)
  }

  onSignedIn(fn: (args: SignedInEvent) => void) {
    this.on('user:action:sigendIn', (e: SignedInEvent) => {
      debug('runing user:action:sigendIn for %s', e.userId)
      fn(e)
    })
  }

  emitEmailUpdated(args: EmailUpdatedEvent) {
    debug('emitting user:update:email for %s', args.userId)
    this.emit('user:update:email', args)
  }

  onEmailUpdated(fn: (args: EmailUpdatedEvent) => void) {
    this.on('user:update:email', (e: EmailUpdatedEvent) => {
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
