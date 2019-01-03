const {
  SLACK_API_TOKEN
} = process.env

let SlackWebClient
if (SLACK_API_TOKEN) {
  SlackWebClient = new (require('@slack/client').WebClient)(SLACK_API_TOKEN)
} else {
  console.warn('Posting to slack disabled: missing SLACK_API_TOKEN')
}

const publish = async (channel, content) => {
  if (SlackWebClient && channel) {
    await SlackWebClient.chat.postMessage({
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

module.exports = publish
