const debug = require('debug')('republik:slack')
const emojione = require('emojione_minimal')
const Redis = require('@orbiting/backend-modules-base/lib/Redis')
const RedisPubSub = require('@orbiting/backend-modules-base/lib/RedisPubSub')

const { RTMClient } = require('@slack/rtm-api')

const {
  SLACK_API_TOKEN,
  SLACK_CHANNEL_GREETING
} = process.env

if (!SLACK_API_TOKEN) {
  console.warn('Listening to messages from slack disabled: missing SLACK_API_TOKEN')
}

// attention, once you call start, there is no way to properly stop
// the slack client again, as rtm.close is not exposed in the api
module.exports.start = async () => {
  if (!SLACK_API_TOKEN) {
    return
  }

  let redis = Redis.connect()
  let pubsub = RedisPubSub.connect()

  const rtm = new RTMClient(SLACK_API_TOKEN)

  rtm.on('message', async (message) => {
    if (message.channel === SLACK_CHANNEL_GREETING && (!message.subtype || message.subtype === 'message_changed')) {
      debug('new message from slack: %O', message)
      let text = message.text
      if (!text && message.message) {
        text = message.message.text
      }
      if (!text) {
        return
      }

      const greeting = {
        text: emojione.shortnameToUnicode(text)
      }

      // dedub to avoid unneccessary websocket pushes
      let existingGreeting
      try {
        existingGreeting = JSON.parse(
          redis && await redis.getAsync('greeting')
        )
      } catch (e) {}
      if (
        !existingGreeting ||
        (existingGreeting &&
          (!existingGreeting.text ||
          !existingGreeting.text.length ||
          existingGreeting.text !== greeting.text)
        )
      ) {
        redis && await redis.setAsync('greeting', JSON.stringify(greeting))
        pubsub && await pubsub.publish('greeting', { greeting })
      }
    }
  })

  rtm.on('authenticated', (payload) => {
    const {
      self,
      team
    } = payload
    debug(`logged in as ${self.name} of team ${team.name}`)
  })

  await new Promise((resolve, reject) => {
    rtm.on('hello', resolve)
    rtm.on('unable_to_rtm_start', reject)
    rtm.start()
  })
    .catch((e) => {
      console.error('slackGreeter: error connecting to slack RTM. Listing to messages disabled!', e)
    })

  debug(`RTM connected`)

  const close = async () => {
    // sadly rtm.close is not exposed, no way to porperly exit slack
    const _redis = redis
    redis = null
    _redis && await Redis.disconnect(_redis)

    const _pubsub = pubsub
    pubsub = null
    _pubsub && await RedisPubSub.disconnect(_pubsub)
  }

  return {
    close
  }
}
