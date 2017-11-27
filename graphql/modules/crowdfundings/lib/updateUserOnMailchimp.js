const fetch = require('isomorphic-unfetch')
const crypto = require('crypto')
const logger = console

const {
  MAILCHIMP_URL,
  MAILCHIMP_MAIN_LIST_ID,
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR
} = process.env

module.exports = async ({userId, pgdb}) => {
  const { email } = await pgdb.public.users.findOne({ id: userId })
  if (!email) {
    logger.error('user not found in updateUserOnMailchimp', { userId })
    return
  }

  const hasPledge = await pgdb.public.pledges.findFirst({
    userId: userId,
    status: 'SUCCESSFUL'
  })
  const hasMembership = await pgdb.public.memberships.findFirst({
    userId: userId
  })
  const membershipTypeBenefactor = await pgdb.public.membershipTypes.findOne({
    name: 'BENEFACTOR_ABO'
  })
  const isBenefactor = await pgdb.public.memberships.findFirst({
    userId: userId,
    membershipTypeId: membershipTypeBenefactor.id
  })
  const hash = crypto
    .createHash('md5')
    .update(email)
    .digest('hex')
    .toLowerCase()

  await fetch(`${MAILCHIMP_URL}/3.0/lists/${MAILCHIMP_MAIN_LIST_ID}/members/${hash}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + (Buffer.from('anystring:' + process.env.MAILCHIMP_API_KEY).toString('base64'))
    },
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed',
      interests: {
        [MAILCHIMP_INTEREST_PLEDGE]: !!hasPledge,
        [MAILCHIMP_INTEREST_MEMBER]: !!hasMembership,
        [MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: !!isBenefactor
      }
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status >= 400) {
        logger.error('updateMailchimp failed', { data })
      }
      return data
    })
    .catch(error => logger.error('updateMailchimp failed', { error }))
}
