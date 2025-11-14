const Redis = require('./Redis')
const { logger } = require('@orbiting/backend-modules-logger')

/**
 * @typedef {import('redis').RedisClient} RedisClient
 */

/** @type {RedisClient | undefined} */
let ControlBusPublisher
/** @type {RedisClient | undefined} */
let ControlBusSubscriber
let isConnected = false

const controlBusLogger = logger.child({}, { msgPrefix: '[ControlBus] ' })
const baseTopic = 'republik:control_bus:'
const subscriptions = new Map()

async function connect() {
  if (isConnected || ControlBusPublisher) {
    return
  }

  try {
    controlBusLogger.debug('Connecting to Redis...')
    ControlBusPublisher = Redis.connect()
    ControlBusSubscriber = ControlBusPublisher.duplicate()

    setupListeners()

    isConnected = true
  } catch (err) {
    controlBusLogger.error({ error: err }, 'Failed to create Redis clients')
    if (ControlBusPublisher) ControlBusPublisher.quit()
    ControlBusPublisher = null
    ControlBusSubscriber = null
    isConnected = false
  }
}

/**
 * Gracefully disconnects from Redis.
 */
async function disconnect() {
  if (!isConnected) {
    return
  }
  isConnected = false
  if (ControlBusSubscriber) {
    ControlBusSubscriber.quit()
    ControlBusSubscriber = null
  }
  if (ControlBusPublisher) {
    ControlBusPublisher.quit()
    ControlBusPublisher = null
  }
  controlBusLogger.debug('Disconnected from Redis.')
}

function publish(topic, message) {
  if (!isConnected || !ControlBusPublisher) {
    controlBusLogger.warn(
      { topic },
      'Publish called but not connected. Ignoring.',
    )
    return Promise.resolve()
  }

  const fullTopicName = baseTopic + topic
  return ControlBusPublisher.publish(fullTopicName, JSON.stringify(message))
}

function subscribe(topic, cb) {
  if (!isConnected || !ControlBusSubscriber) {
    controlBusLogger.warn(
      { topic },
      'Subscribe called but not connected. Ignoring.',
    )
    return () => {}
  }

  const fullTopicName = baseTopic + topic
  if (!subscriptions.has(fullTopicName)) {
    subscriptions.set(fullTopicName, new Set())
    ControlBusSubscriber.subscribe(fullTopicName, (err) => {
      if (err) {
        controlBusLogger.debug(
          { topic: fullTopicName, error: err },
          'failed to subscribe to topic',
        )
      }
    })
  }

  subscriptions.get(fullTopicName).add(cb)

  return () => {
    unsubscribe(topic, cb)
  }
}

function unsubscribe(topic, cb) {
  if (!isConnected || !ControlBusSubscriber) {
    return
  }

  const fullTopicName = baseTopic + topic
  const callbacks = subscriptions.get(fullTopicName)

  if (!callbacks) {
    return
  }

  callbacks.delete(cb)

  if (callbacks.size === 0) {
    ControlBusSubscriber.unsubscribe(fullTopicName)
    subscriptions.delete(fullTopicName)
  }
}

function setupListeners() {
  ControlBusSubscriber.on('message', (topic, message) => {
    if (!subscriptions.has(topic)) {
      return
    }

    let parsedMessage
    try {
      parsedMessage = JSON.parse(message)
    } catch (err) {
      controlBusLogger.error(
        { topic: topic, error: err },
        'Error parsing JSON message on topic',
      )
      return
    }

    const callbacks = subscriptions.get(topic)
    callbacks.forEach((cb) => {
      try {
        cb(parsedMessage)
      } catch (err) {
        controlBusLogger.error(
          { topic: topic, error: err },
          'Error in callback for topic',
        )
      }
    })
  })

  ControlBusPublisher.on('connect', () => {
    controlBusLogger.debug('Publisher connected.')
  })

  ControlBusSubscriber.on('connect', () => {
    controlBusLogger.debug('Subscriber connected.')
    if (subscriptions.size > 0) {
      controlBusLogger.debug(
        `Re-subscribing to ${subscriptions.size} topics...`,
      )
      subscriptions.forEach((_, fullTopicName) => {
        ControlBusSubscriber.subscribe(fullTopicName, (err) => {
          if (err) {
            controlBusLogger.debug(
              { topic: fullTopicName, error: err },
              'failed to re-subscribe to topic',
            )
          }
        })
      })
    }
  })

  ControlBusSubscriber.on('subscribe', (topic, count) => {
    controlBusLogger.debug(
      { topic: topic, subscriptionCount: count },
      'Topic subscriptions stats',
    )
  })

  ControlBusSubscriber.on('unsubscribe', (topic, count) => {
    controlBusLogger.debug(
      { topic: topic, subscriptionCount: count },
      'Topic subscriptions stats',
    )
  })

  ControlBusSubscriber.on('error', (err) => {
    controlBusLogger.debug({ error: err }, 'transport error')
  })

  ControlBusPublisher.on('error', (err) => {
    controlBusLogger.debug({ error: err }, 'publisher transport error')
  })
}

module.exports = {
  connect,
  disconnect,
  publish,
  subscribe,
}
