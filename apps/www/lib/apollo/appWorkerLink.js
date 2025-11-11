import { ApolloLink, Observable } from '@apollo/client'
import { createClient } from 'graphql-ws'
import { postMessage } from '../withInNativeApp'
import { v4 as uuid } from 'uuid'
import { parseJSONObject } from '../safeJSON'

export const hasSubscriptionOperation = ({ query: { definitions } }) =>
  definitions.some(
    ({ kind, operation }) =>
      kind === 'OperationDefinition' && operation === 'subscription',
  )

const GQL_MESSAGES_TYPES = [
  'connection_init',
  'connection_ack',
  'ping',
  'pong',
  'subscribe',
  'next',
  'error',
  'complete',
]

// Apollo link implementation to resolve queries and mutations via app worker
class PromiseWorkerLink extends ApolloLink {
  constructor() {
    super()
    this.callbacks = {}
    this.onMessage = this.onMessage.bind(this)
    this.postMessage = this.postMessage.bind(this)

    document.addEventListener('message', this.onMessage)
  }

  onMessage(event) {
    const operation = parseJSONObject(event.data)

    // Ignore all non graphql events
    if (operation.type !== 'graphql') return

    const callback = this.callbacks[operation.id]

    if (callback) {
      callback(operation.payload)

      delete this.callbacks[operation.id]
    } else {
      postMessage({
        type: 'warning',
        data: {
          error: 'Unknown operation id',
          id: operation.id,
          operation,
        },
      })
    }
  }

  postMessage(id, operation) {
    return new Promise((resolve, reject) => {
      this.callbacks[id] = (result) => {
        resolve(result)
      }

      postMessage({
        type: 'graphql',
        data: { id, payload: operation },
      })
    })
  }

  request(operation) {
    const id = uuid()

    return new Observable((observer) => {
      // Sends operation to be processed in app "worker"
      this.postMessage(id, operation).then((response) => {
        observer.next(response)
        observer.complete()
      })
    })
  }
}

// Apollo link implementation to resolve subscriptions via app worker
class SubscriptionWorkerLink extends ApolloLink {
  constructor() {
    super()
    this.subscriptions = new Map()
    this.messageHandler = this.handleMessage.bind(this)
    document.addEventListener('message', this.messageHandler)
  }

  handleMessage(event) {
    const message = parseJSONObject(event.data)

    if (!GQL_MESSAGES_TYPES.includes(message.type)) {
      return
    }

    const subscription = this.subscriptions.get(message.id)
    if (!subscription) {
      return
    }

    switch (message.type) {
      case 'next':
        subscription.observer.next(message.payload)
        break
      case 'error':
        subscription.observer.error(message.payload)
        this.subscriptions.delete(message.id)
        break
      case 'complete':
        subscription.observer.complete()
        this.subscriptions.delete(message.id)
        break
    }
  }

  request(operation) {
    return new Observable((observer) => {
      const id = uuid()
      
      this.subscriptions.set(id, { observer, operation })

      // Send subscription request to app worker using graphql-ws protocol
      postMessage(
        JSON.stringify({
          id,
          type: 'subscribe',
          payload: {
            query: operation.query,
            variables: operation.variables,
            operationName: operation.operationName,
          },
        }),
      )

      // Return cleanup function
      return () => {
        this.subscriptions.delete(id)
        postMessage(
          JSON.stringify({
            id,
            type: 'complete',
          }),
        )
      }
    })
  }

  cleanup() {
    document.removeEventListener('message', this.messageHandler)
    this.subscriptions.clear()
  }
}

// Create app worker link instance
// Uses both promise or subscription links based on operation type
export const createAppWorkerLink = () => {
  const promiseWorkerLink = new PromiseWorkerLink()
  const subscriptionWorkerLink = new SubscriptionWorkerLink()

  return ApolloLink.split(
    hasSubscriptionOperation,
    subscriptionWorkerLink,
    promiseWorkerLink,
  )
}
