const {
  SLACK_API_TOKEN
} = process.env

const { WebClient } = require('@slack/web-api')

let webClient
if (SLACK_API_TOKEN) {
  webClient = new WebClient(SLACK_API_TOKEN)
} else {
  console.warn('Posting to slack disabled: missing SLACK_API_TOKEN')
}

const publish = async (channel, content) => {
  if (webClient && channel) {
    await webClient.chat.postMessage({
      channel,
      text: content
    })
      .catch((e) => {
        console.error(e)
      })
  } else {
    console.warn(
      `Slack cannot publish: missing SLACK_API_TOKEN or channel.\n\tmessage: ${content}\n`
    )
  }
}

const postMessage = async (message) => {
  if (webClient) {
    await webClient.chat.postMessage(message)
      .catch((e) => {
        console.error(e)
      })
  } else {
    console.warn(
      'Slack cannot publish: missing SLACK_API_TOKEN or channel.',
      { message }
    )
  }
}

module.exports = publish
module.exports.postMessage = postMessage
