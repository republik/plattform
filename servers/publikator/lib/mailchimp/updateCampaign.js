const fetch = require('isomorphic-unfetch')
const debug = require('debug')('publikator:lib:mailchimp:updateCampaign')

const {
  MAILCHIMP_URL,
  MAILCHIMP_API_KEY,
  MAILCHIMP_CAMPAIGN_CONFIGS,
  DEFAULT_MAIL_FROM_NAME,
  DEFAULT_MAIL_FROM_ADDRESS
} = process.env

const mailchimpCampaignConfigs = MAILCHIMP_CAMPAIGN_CONFIGS
  ? JSON.parse(MAILCHIMP_CAMPAIGN_CONFIGS)
  : []

module.exports = async ({ campaignId, campaignConfig = {} }) => {
  const config = {
    ...mailchimpCampaignConfigs.find(c => c.key === campaignConfig.key),
    ...campaignConfig
  }

  const body = {
    recipients: {
      ...config.list_id && { list_id: config.list_id },
      segment_opts: {
        ...config.saved_segment_id && { saved_segment_id: Number(config.saved_segment_id) }
      }
    },
    settings: {
      ...config.subject_line && { subject_line: config.subject_line },
      ...config.title && { title: config.title },
      ...config.to_name && { to_name: config.to_name },
      from_name: config.from_name || DEFAULT_MAIL_FROM_NAME,
      reply_to: config.reply_to || DEFAULT_MAIL_FROM_ADDRESS
    }
  }

  debug('%o', { campaignId, campaignConfig, config, body })

  return fetch(`${MAILCHIMP_URL}/3.0/campaigns/${campaignId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from('anystring:' + MAILCHIMP_API_KEY).toString('base64')}`
    },
    body: JSON.stringify(body)
  })
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    })
}
