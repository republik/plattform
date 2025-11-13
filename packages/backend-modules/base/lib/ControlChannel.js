const Redis = require('./Redis')

const ControlChannelPublisher = Redis.connect()
const ControlChannelSubscriber = ControlChannelPublisher.duplicate()

const baseTopic = 'republik:controlChannel:'

const subscriptions = new Map()

function publish(topic, message) {
  const fullTopicName = baseTopic + topic
  return ControlChannelPublisher.publish(fullTopicName, JSON.stringify(message))
}

function subscribe(topic, cb) {
  const fullTopicName = baseTopic + topic
  if (!subscriptions.has(fullTopicName)) {
    subscriptions.set(fullTopicName, new Set())
    ControlChannelSubscriber.subscribe(fullTopicName, (err) => {
      if (err) {
        console.error(err)
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
    ControlChannelSubscriber.unsubscribe(fullTopicName)
    subscriptions.delete(fullTopicName)
  }
}

ControlChannelSubscriber.on('message', (subscribedChannel, message) => {
  if (!subscriptions.has(subscribedChannel)) {
    return
  }

  let parsedMessage
  try {
    parsedMessage = JSON.parse(message)
  } catch (err) {
    console.error(
      `[ControlChannel] Error parsing JSON message on channel ${subscribedChannel}:`,
      err,
    )
    return
  }

  const callbacks = subscriptions.get(subscribedChannel)
  callbacks.forEach((cb) => {
    try {
      cb(parsedMessage)
    } catch (err) {
      console.error(
        `[ControlChannel] Error in callback for channel ${subscribedChannel}:`,
        err,
      )
    }
  })
})

ControlChannelSubscriber.on('subscribe', (channel, count) => {
  console.log(
    `[ControlChannel] Subscribed to channel ${channel}. Total subscriptions: ${count}`,
  )
})

ControlChannelSubscriber.on('unsubscribe', (channel, count) => {
  console.log(
    `[ControlChannel] Unsubscribed from channel ${channel}. Total subscriptions: ${count}`,
  )
})

ControlChannelSubscriber.on('error', (err) => {
  console.error('[ControlChannel] RedisCTLSub Error:', err)
})

module.exports = {
  publish,
  subscribe,
}
