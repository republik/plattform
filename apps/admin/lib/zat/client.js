import { when, isObject, isString } from './utils'

export const PROMISE_TIMEOUT = 10000
// 10 seconds, see ZD#4058685
export const PROMISE_TIMEOUT_LONG = 5 * 60 * 1000
// Set a high timeout threshold to allow us to better gauge the time taken for successful requests
const NO_TIMEOUT_ACTIONS = ['instances.create']
const ZAF_EVENT = /^zaf\./
const pendingPromises = {}
const ids = {}

// @internal
// #timeoutReject(rejectionFn, name, client, params)
//
// Reject a request if required, given the rejection function, name (get, set or invoke)
// and arguments to that request. Falls back to 10000 second timeout with few exceptions.
//
function timeoutReject(client, reject, name, paramsArray) {
  const actions = collateActions(name, paramsArray)
  switch (name) {
    case 'invoke': {
      const matches = paramsArray.filter((action) => {
        return NO_TIMEOUT_ACTIONS.indexOf(action) !== -1
      })
      const allWhitelisted = matches.length === paramsArray.length
      if (allWhitelisted) {
        return NaN // timer IDs are numbers; embrace the JavaScript 😬
      } else {
        const notAllWhitelisted = matches.length !== 0
        if (notAllWhitelisted) {
          throw new Error(
            'Illegal bulk call - `instances.create` must be called separately.',
          )
        }
        return defaultTimer(client, actions, reject)
      }
    }
    default: {
      return defaultTimer(client, actions, reject)
    }
  }
}

function defaultTimer(client, actions, callback) {
  return setTimeout(() => {
    // trackSDKRequestTimeout(client, actions, PROMISE_TIMEOUT_LONG)
    callback(new Error('Invocation request timeout'))
  }, PROMISE_TIMEOUT_LONG)
}

export function collateActions(name, params) {
  return params.map((action) => `${name}-${action}`)
}

export function stripActionArgs(action) {
  // Capture:
  // 1. single or multiple comma-delimited arguments following an initial colon, and
  // 2. non-whitelisted, unescaped words following a period (i.e. file extensions in the case of assetURL calls)
  const ACTION_ARGS =
    /:\w+(,?\w+)*((\.(show|hide|enable|disable))|(\\?\.\w*))?/g
  // Return :arg.field_modifier, where field modifier is (optionally) one of 'show', 'hide', 'enable' or 'disable'
  return action.replace(ACTION_ARGS, ':arg$3')
}

export function timeMsToSecondsRange(value, upperLimit = PROMISE_TIMEOUT_LONG) {
  if (value >= upperLimit) return `${upperLimit / 1000}-`
  const lowerRangeBound = value - (value % 10000)
  return `${lowerRangeBound / 1000}-${(lowerRangeBound + 10000) / 1000}`
}

export function trackSDKRequestTimeout(client, actions, requestResponseTime) {
  const actionsTags = actions.map(
    (action) => `action:${stripActionArgs(action)}`,
  )
  const responseTimeTag = `request_response_time:${timeMsToSecondsRange(
    requestResponseTime,
  )}`
  client.postMessage('__track__', {
    event_name: 'sdk_request_timeout',
    event_type: 'increment',
    data: 1,
    tags: actionsTags.concat(responseTimeTag),
  })
}

function nextIdFor(name) {
  if (isNaN(ids[name])) {
    ids[name] = 0
  }
  return ++ids[name]
}

// @internal
// #### rawPostMessage(client, msg, forceReady)
//
// Post a message to the hosting frame.
// If the client is not ready and forceReady is not specified, it will wait for client registration.
//
function rawPostMessage(client, msg, forceReady) {
  if (client.ready || forceReady) {
    client._source.postMessage(msg, client._origin)
  } else {
    client.on('app.registered', rawPostMessage.bind(null, client, msg))
  }
}

// @internal
// #### wrappedPostMessage(name, params)
//
// Wraps post message with a request/response mechanism using Promises.
// Must be invoked in the context of a Client.
//
// ##### Arguments
//
//   * `name` the name of the request to make (get/set/invoke)
//   * `params` parameters of the request (an array for get, and an object for set/invoke)
//
function wrappedPostMessage(name, params) {
  const id = nextIdFor('promise')
  let timeoutId, promiseStartTime
  const paramsArray = Array.isArray(params) ? params : Object.keys(params)
  // const actions = collateActions(name, paramsArray)
  const client = this

  const promise = new Promise((resolve, reject) => {
    promiseStartTime = window.performance.now()

    // Time out the promise to ensure it will be garbage collected if nobody responds
    timeoutId = timeoutReject(client, reject, name, paramsArray)
    pendingPromises[id] = { resolve, reject }

    const msg = JSON.stringify({
      id: id,
      request: name,
      params: params,
      appGuid: client._appGuid,
      instanceGuid: client._instanceGuid,
    })
    rawPostMessage(client, msg)
  })

  const trackTimeoutWithResolutionTime = () => {
    const promiseResolutionTime = window.performance.now() - promiseStartTime
    if (promiseResolutionTime > PROMISE_TIMEOUT) {
      // trackSDKRequestTimeout(client, actions, promiseResolutionTime)
    }
  }

  // ensure promise is cleaned up when resolved/rejected, track request performance for resolved promises
  return promise.then(
    removePromise.bind(null, { id, timeoutId, trackTimeoutWithResolutionTime }),
    removePromise.bind(null, { id, timeoutId }),
  )
}

function createError(error) {
  if (error.path) {
    error.message = '"' + error.path + '" ' + error.message
  }
  const err = new Error(error.message)
  err.name = error.name
  err.stack = error.stack
  return err
}

function removePromise(options, args) {
  clearTimeout(options.timeoutId)
  delete pendingPromises[options.id]
  options.trackTimeoutWithResolutionTime &&
    options.trackTimeoutWithResolutionTime()
  if (args instanceof Error) throw args
  return args
}

function isValidEvent(client, event) {
  return (
    client && client._origin === event.origin && client._source === event.source
  )
}

function triggerEvent(client, eventName, data) {
  if (!client._messageHandlers[eventName]) {
    return false
  }
  client._messageHandlers[eventName].forEach((handler) => {
    handler(data)
  })
}

function finalizePendingPromise(pendingPromise, data) {
  if (data.error) {
    const error = data.error.name ? createError(data.error) : data.error
    pendingPromise.reject(error)
  } else {
    pendingPromise.resolve(data.result)
  }
}

function postReplyWith(client, key, msg) {
  if (client._repliesPending[key]) {
    return
  }
  msg.key = 'iframe.reply:' + key
  client._repliesPending[key] = true
  return when(client._messageHandlers[key])
    .then(rawPostMessage.bind(null, client, msg))
    .catch((reason) => {
      // if the handler throws an error we want to send back its message, but
      // Error objects don't pass through the postMessage boundary.
      const rejectMessage = reason instanceof Error ? reason.message : reason
      msg.error = {
        msg: rejectMessage,
      }
      rawPostMessage(client, msg)
    })
    .then(() => {
      delete client._repliesPending[key]
    })
}

function getMessageRecipient(client, recipientGuid) {
  let messageRecipient = client

  if (recipientGuid && recipientGuid !== client._instanceGuid) {
    messageRecipient = client._instanceClients[recipientGuid]

    if (!messageRecipient) {
      throw Error(
        '[ZAF SDK] Could not find client for instance ' + recipientGuid,
      )
    }
  }

  return messageRecipient
}

function messageHandler(client, event) {
  if (!isValidEvent(client, event)) {
    return
  }

  let data = event.data

  if (!data) {
    return
  }

  if (typeof data === 'string') {
    try {
      data = JSON.parse(event.data)
    } catch (e) {
      return e
    }
  }

  const clientRecipient = getMessageRecipient(client, data.instanceGuid)
  let pendingPromise

  if (data.id && (pendingPromise = pendingPromises[data.id])) {
    finalizePendingPromise(pendingPromise, data)
  } else if (ZAF_EVENT.test(data.key)) {
    const key = data.key.replace(ZAF_EVENT, '')
    const msg = { appGuid: client._appGuid }

    if (data.needsReply) {
      return postReplyWith(clientRecipient, key, msg)
    } else {
      triggerEvent(clientRecipient, key, data.message)
    }
  }
}

// When doing singular operations and we retrieve an error this function will throw that error
function processResponse(path, result) {
  const isSingularOperation = typeof path === 'string'

  if (!isSingularOperation) {
    return result
  }

  // CRUFT: When framework starts always appending errors we can remove the extra results.errors check
  const err = result.errors && result.errors[path]
  if (err) {
    throw createError(err)
  }

  return result
}

function isOriginValid(origin) {
  if (origin) {
    const WHITELISTED_ORIGINS = [
      /^https?:\/\/127.0.0.1(:\d+)?$/,
      /^https?:\/\/localhost(:\d+)?$/,
      /^https:\/\/.+\.zendesk\.com$/,
      /^https:\/\/.+\.zd-staging\.com$/,
      /^https:\/\/.+\.zd-dev\.com$/,
      /^https:\/\/.+\.zd-master\.com$/,
      /^https:\/\/.+\.zendesk-staging\.com$/,
      // Zendesk Chat domains:
      /^https?:\/\/.+\.zopim\.com(:\d+)?$/,
      /^https:\/\/dashboard\.zopim\.org$/,
      // Zendesk Sell domains:
      /^https:\/\/.+\.futuresimple\.com$/,
      /^https:\/\/.+\.cloudhatchery\.com$/,
      /^https:\/\/.+\.idealwith\.com$/,
      // Tesco domains:
      /^https:\/\/.+\.ourtesco\.com$/,
    ]

    for (let i = 0; i < WHITELISTED_ORIGINS.length; i++) {
      if (WHITELISTED_ORIGINS[i].test(origin)) {
        return true
      }
    }
  }

  return false
}

function clearDocument() {
  document.body = document.createElement('body')

  const iframeHead = document.head
  iframeHead && iframeHead.remove()
}

function appendErrorToBody(errorMsg) {
  var errorElement = document.createElement('h3')
  var errorTextNode = document.createTextNode(errorMsg)

  errorElement.appendChild(errorTextNode)
  document.body.appendChild(errorElement)
}

export default class Client {
  constructor(options) {
    this._parent = options.parent
    this._origin = options.origin || (this._parent && this._parent._origin)
    this._source =
      options.source || (this._parent && this._parent._source) || window.parent
    this._appGuid = options.appGuid || (this._parent && this._parent._appGuid)
    this._instanceGuid = options.instanceGuid || this._appGuid
    this._messageHandlers = {}
    this._repliesPending = {}
    this._instanceClients = {}
    this._metadata = null
    this._context = options.context || null
    this.ready = false

    if (!isOriginValid(this._origin)) {
      /*const originHostname = new URL(this._origin).hostname
      this.postMessage('__track__', {
        event_name: 'invalid_sdk_origin',
        event_type: 'increment',
        data: 1,
        tags: ['origin:' + originHostname]
      }) */

      clearDocument()
      appendErrorToBody(`Invalid domain ${this._origin}`)
    }

    this.on(
      'app.registered',
      (data) => {
        this.ready = true
        this._metadata = data.metadata
        this._context = data.context
      },
      this,
    )

    this.on(
      'context.updated',
      (context) => {
        this._context = context
      },
      this,
    )

    if (this._parent) {
      this.ready = this._parent.ready
      return this // shortcut handshake
    }

    window.addEventListener('message', messageHandler.bind(null, this))
    this.postMessage('iframe.handshake', { version: '2.0.33' })
  }

  /**
   * ### Client Object
   *
   * #### client.postMessage(name, [data])
   *
   * Allows you to send message events to the Zendesk app.
   *
   * ##### Arguments
   *
   *   * `name` the name of the message event. This determines the name of the iframe
   *     event your app will receive. For example, if you set this to 'hello', your app will receive
   *     the event 'iframe.hello'
   *   * `data` (optional) a JSON object with any data that you want to pass along with the
   *     event
   *
   * ```javascript
   * const client = ZAFClient.init();
   * client.postMessage('hello', { awesome: true });
   * ``
   */
  postMessage(name, data) {
    const msg = JSON.stringify({
      key: name,
      message: data,
      appGuid: this._appGuid,
      instanceGuid: this._instanceGuid,
    })
    rawPostMessage(this, msg, name === 'iframe.handshake')
  }

  /**
   * #### client.on(name, handler, [context])
   *
   * Allows you to add handlers to a framework event. You can add as many handler as you wish.
   * They will be executed in the order they were added.
   *
   * ##### Arguments
   *
   *   * `name` the name of the framework event you want to listen to. This can be
   *     [framework](./events.html#framework-events), [request](./events.html#request-events), or
   *     [custom](./events.html#custom-events) events. Your iframe can listen to any events your app
   *     receives, apart from DOM events. You don't need to register these events in the app first
   *   * `handler` a function to be called when this event fires. You can expect to receive the same
   *     event object your app would receive, parsed as JSON
   *   * `context` (optional) the value of `this` within your handler
   *
   * ```javascript
   * const client = ZAFClient.init();
   * client.on('app.registered', (e) => {
   *   // go nuts
   * });
   * ```
   *
   * Note: As soon as communication with the Zendesk app is established, the SDK triggers an
   * `app.registered` event. You can add as many handlers to `app.registered` as you like. They're
   * called immediately after the `init` callback
   */
  on(name, handler, context) {
    if (typeof handler === 'function') {
      handler = context ? handler.bind(context) : handler

      this._messageHandlers[name] = this._messageHandlers[name] || []
      this._messageHandlers[name].push(handler)

      if (name !== 'app.registered') {
        // Subscriber count is needed as the framework will only bind events on the first attached handler
        this.postMessage('iframe.on:' + name, {
          subscriberCount: this._messageHandlers[name].length,
        })
      }
    }
  }

  /**
   * #### client.off(name, handler)
   *
   * Allows you to remove a handler for a framework event.
   *
   * ##### Arguments
   *
   *   * `name` the name of the event
   *   * `handler` the function you attached earlier with `on`
   *
   * ```javascript
   * const client = ZAFClient.init();
   *
   * client.on('app.registered', function appRegistered(e) {
   *   // do stuff then remove the handler
   *   client.off('app.registered', appRegistered);
   * });
   * ``
   */
  off(name, handler) {
    if (!this._messageHandlers[name]) {
      return false
    }
    const index = this._messageHandlers[name].indexOf(handler)
    if (this.has(name, handler)) {
      this._messageHandlers[name].splice(index, 1)
    }

    // Subscriber count is needed as the framework will only unbind events on the last detached handler (count of 0)
    this.postMessage('iframe.off:' + name, {
      subscriberCount: this._messageHandlers[name].length,
    })
    return handler
  }

  /**
   * #### client.has(name, handler)
   *
   * Returns whether or not an event has the specified handler attached to it.
   *
   * ##### Arguments
   *
   *   * `name` the name of the event
   *   * `handler` the handler you want to test
   *
   * ```javascript
   * const client = ZAFClient.init();
   *
   * client.on('app.registered', function appRegistered(e) {
   *   // do stuff
   * });
   *
   * client.has('app.registered', appRegistered); // true
   * client.has('app.activated', appRegistered); // false
   * ``
   */
  has(name, handler) {
    if (!this._messageHandlers[name]) {
      return false
    }
    return this._messageHandlers[name].indexOf(handler) !== -1
  }

  /**
   * #### client.trigger(name, [data])
   *
   * Triggers the specified event on the client.
   *
   * ##### Arguments
   *
   *   * `name` the name of the event you want to trigger
   *   * `data` (optional) data you want to pass to the handler
   *
   * ```javascript
   * const client = ZAFClient.init();
   *
   * client.on('activation', () => {
   *   console.log('activating!')
   * });
   *
   * client.trigger('activation') // activating!
   * ``
   */
  trigger(name, data) {
    this.postMessage('iframe.trigger:' + name, data)
  }

  /**
   * #### client.request(options)
   *
   * Dispatch [requests](./requests) via the Zendesk app.
   *
   * ##### Arguments
   *
   *   * `options` the url of the request or an options object containing a url key/value
   *
   * ##### Returns
   *
   * A [Promises/A+](https://promisesaplus.com) conformant `promise` object.
   *
   * ```javascript
   * const client = ZAFClient.init();
   *
   * client.request('/api/v2/tickets.json').then(
   *   (tickets) => {
   *     console.log(tickets);
   *   },
   *   (response) => {
   *     console.error(response.responseText);
   *   }
   * );
   * ``
   */
  request(options) {
    if (this._parent) {
      return this._parent.request(options)
    }
    const requestKey = 'request:' + nextIdFor('request')

    return new Promise((resolve, reject) => {
      if (typeof options === 'string') {
        options = { url: options }
      }

      this.on(requestKey + '.done', (evt) => {
        resolve.apply(this, evt.responseArgs)
      })

      this.on(requestKey + '.fail', (evt) => {
        reject.apply(this, evt.responseArgs)
      })

      this.postMessage(requestKey, options)
    })
  }

  instance(instanceGuid) {
    if (!instanceGuid || typeof instanceGuid !== 'string') {
      throw new Error('The instance method expects an `instanceGuid` string.')
    }
    if (instanceGuid === this._instanceGuid) {
      return this
    }
    if (this._parent) {
      return this._parent.instance(instanceGuid)
    }
    let instanceClient = this._instanceClients[instanceGuid]
    if (!instanceClient) {
      instanceClient = new Client({
        parent: this,
        instanceGuid: instanceGuid,
      })
      this._instanceClients[instanceGuid] = instanceClient
    }
    return instanceClient
  }

  metadata() {
    if (this._parent) {
      return this._parent.metadata()
    }
    return new Promise((resolve) => {
      if (this._metadata) {
        resolve(this._metadata)
      } else {
        this.on('app.registered', () => {
          resolve(this._metadata)
        })
      }
    })
  }

  context() {
    if (this._context) {
      return Promise.resolve(this._context)
    } else {
      if (this._instanceGuid && this._instanceGuid !== this._appGuid) {
        const key = 'instances.' + this._instanceGuid
        return this.get(key).then((data) => {
          this._context = data[key]
          return this._context
        })
      } else {
        return new Promise((resolve) => {
          this.on('app.registered', (data) => {
            resolve(data.context)
          })
        })
      }
    }
  }

  // Accepts string or array of strings.
  get(path) {
    const paths = Array.isArray(path) ? path : [path]

    if (
      arguments.length > 1 ||
      paths.some((path) => {
        return !isString(path)
      })
    ) {
      throw new Error('The get method accepts a string or array of strings.')
    }

    return wrappedPostMessage
      .call(this, 'get', paths)
      .then(processResponse.bind(null, path))
  }

  set(key, val) {
    let obj = key

    if (typeof key === 'string') {
      if (arguments.length === 1) {
        throw new Error('The setter requires a value')
      }
      obj = {}
      obj[key] = val
    }

    if (!isObject(obj) || Array.isArray(obj)) {
      throw new Error(
        'The set method accepts a key and value pair, or an object of key and value pairs.',
      )
    }

    return wrappedPostMessage
      .call(this, 'set', obj)
      .then(processResponse.bind(null, key))
  }

  invoke(keyOrObject) {
    let obj = {}

    if (typeof keyOrObject === 'string') {
      obj[keyOrObject] = Array.prototype.slice.call(arguments, 1)
    } else if (typeof keyOrObject === 'object') {
      // Validate object
      Object.keys(keyOrObject).forEach((key) => {
        const methodArgs = keyOrObject[key]

        if (
          !Array.isArray(methodArgs) ||
          methodArgs.some((arg) => {
            return !isString(arg)
          })
        ) {
          throw new Error(
            'Invoke supports string arguments or an object with array of strings.',
          )
        }
      })

      obj = keyOrObject
    } else {
      throw new Error(
        'Invoke supports string arguments or an object with array of strings.',
      )
    }

    return wrappedPostMessage
      .call(this, 'invoke', obj)
      .then(processResponse.bind(null, keyOrObject))
  }
}
