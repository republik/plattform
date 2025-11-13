const Redis = require('./Redis')

const RedisCTL = Redis.connect()
const RedisCTLSub = RedisCTL.duplicate()

const baseTopic = 'republik:ctl:'

function publish(topic, message) {
  const fullTopicName = baseTopic + topic
  return RedisCTL.publish(fullTopicName, JSON.stringify(message))
}

function subscribe(topic, cb) {
  const fullTopicName = baseTopic + topic
  RedisCTLSub.subscribe(fullTopicName, (err) => {
    if (err) {
      console.error('Error subscribing to channel:', err)
    } else {
      console.log(`Subscribed to messages on channel ${fullTopicName}`)
    }
  })

  RedisCTLSub.on('message', (subscribedChannel, message) => {
    if (subscribedChannel === fullTopicName) {
      cb(JSON.parse(message))
    }
  })
}

module.exports = {
  publish,
  subscribe,
}
