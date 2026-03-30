const debug = require('debug')('publikator:lib:mailchimp:updateCampaign')

const {
  MAILCHIMP_URL,
  MAILCHIMP_API_KEY,
  DEFAULT_MAIL_FROM_NAME,
  DEFAULT_MAIL_FROM_ADDRESS,
  MAILCHIMP_MAIN_LIST_ID,
} = process.env

module.exports = async ({ campaignId, campaignConfig = {} }) => {
  const body = {
    recipients: {
      list_id: MAILCHIMP_MAIN_LIST_ID,
      segment_opts: {
        saved_segment_id: campaignConfig.savedSegmentId,

        // NOTE: this would work too but for now we'll probably just use the saved segment IDs
        // match: 'all',
        // conditions: [
        //   {
        //     condition_type: 'Interests',
        //     field: `interests-${'xyz'}`, // interest group id
        //     op: 'interestcontainsall',
        //     value: ['abc'], // interest id
        //   },
        // ],
      },
    },
    settings: {
      subject_line: campaignConfig.subjectLine,
      title: campaignConfig.title,
      to_name: campaignConfig.toName || '*|FNAME|* *|LNAME|*',
      from_name: campaignConfig.fromName || DEFAULT_MAIL_FROM_NAME,
      reply_to: campaignConfig.replyTo || DEFAULT_MAIL_FROM_ADDRESS,
    },
  }

  debug('%o', { campaignId, campaignConfig, body })

  const response = await fetch(`${MAILCHIMP_URL}/3.0/campaigns/${campaignId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(
        'anystring:' + MAILCHIMP_API_KEY,
      ).toString('base64')}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const json = await response.json()
    console.error(json)
    throw Error(json.detail)
  }

  return response
}
