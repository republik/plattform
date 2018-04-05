const debug = require('debug')('republik:slack')
const emojione = require('emojione_minimal')
const {
  lib: {
    redis,
    RedisPubSub: {
      pubsub
    }
  }
} = require('@orbiting/backend-modules-base')

const {
  RTMClient
} = require('@slack/client')

const {
  SLACK_API_TOKEN,
  SLACK_CHANNEL_GREETING
} = process.env

if (SLACK_API_TOKEN) {
  const rtm = new RTMClient(SLACK_API_TOKEN)

  rtm.on('authenticated', (payload) => {
    const {
      self,
      team
    } = payload
    debug(`Slack: logged in as ${self.name} of team ${team.name}`)
  })

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
          await redis.getAsync('greeting')
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
        await redis.setAsync('greeting', JSON.stringify(greeting))
        await pubsub.publish('greeting', { greeting })
      }
    }
  })
  rtm.start()
}
