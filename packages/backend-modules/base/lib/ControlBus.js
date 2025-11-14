const Redis = require('./Redis')
const { logger } = require('@orbiting/backend-modules-logger')

const ControlBusPublisher = Redis.connect()
const ControlBusSubscriber = ControlBusPublisher.duplicate()

const controlBusLogger = logger.child({}, { msgPrefix: '[ControlBus] ' })
const baseTopic = 'republik:control_bus:'
const subscriptions = new Map()

function publish(topic, message) {
  const fullTopicName = baseTopic + topic
  return ControlBusPublisher.publish(fullTopicName, JSON.stringify(message))
}

function subscribe(topic, cb) {
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

ControlBusSubscriber.on('subscribe', (topic, count) => {
  controlBusLogger.debug(
    { topic: topic, subscriptionCount: count },
    'Topic subscribpitons stats',
  )
})

ControlBusSubscriber.on('unsubscribe', (topic, count) => {
  controlBusLogger.debug(
    { topic: topic, subscriptionCount: count },
    'Topic subscribpitons stats',
  )
})

ControlBusSubscriber.on('error', (err) => {
  controlBusLogger.debug({ error: err }, 'transport error')
})

module.exports = {
  publish,
  subscribe,
}
