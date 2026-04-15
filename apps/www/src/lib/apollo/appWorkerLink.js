import { ApolloLink, Observable } from '@apollo/client'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { postMessage } from '../withInNativeApp'
import { v4 as uuid } from 'uuid'
import { parseJSONObject } from '../safeJSON'

export const hasSubscriptionOperation = ({ query: { definitions } }) =>
  definitions.some(
    ({ kind, operation }) =>
      kind === 'OperationDefinition' && operation === 'subscription',
  )

const GQL_MESSAGES_TYPES = ['start', 'data', 'stop', 'error', 'complete']

// WebSocket compliant interface to handle subscriptions via app worker
class WorkerInterface {
  constructor(url, protocol) {
    this.url = url
    this.protocol = protocol
    this.readyState = WorkerInterface.OPEN
    this.onMessageCallback = null
  }

  send(serializedMessage) {
    postMessage(serializedMessage)
  }

  close() {
    document.removeEventListener('message', this.onMessageCallback)
  }

  onMessage(fn) {
    return ({ data }) => {
      const d = parseJSONObject(data)

      if (GQL_MESSAGES_TYPES.includes(d.type)) {
        fn({ data })
      }
    }
  }

  set onmessage(fn) {
    this.onMessageCallback = this.onMessage(fn)

    document.addEventListener('message', this.onMessageCallback)
  }
}

WorkerInterface.CLOSED = 'CLOSED'
WorkerInterface.OPEN = 'OPEN'
WorkerInterface.CONNECTING = 'CONNECTING'

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
    this.subscriptionClient = new SubscriptionClient(null, {}, WorkerInterface)
  }

  request(operation) {
    return this.subscriptionClient.request(operation)
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
