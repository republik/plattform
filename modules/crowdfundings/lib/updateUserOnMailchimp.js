const fetch = require('isomorphic-unfetch')
const crypto = require('crypto')
const logger = console

const {
  MAILCHIMP_URL,
  MAILCHIMP_MAIN_LIST_ID,
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR
} = process.env

module.exports = async ({userId, pgdb, hasJustPaid, isNew}) => {
  try {
    const { email } = await pgdb.public.users.findOne({ id: userId })
    if (!email) {
      logger.error('user not found in updateUserOnMailchimp', { userId })
      return
    }

    const pledges = await pgdb.public.pledges.find({
      userId: userId, status: 'SUCCESSFUL'
    })

    const hasPledge = !!pledges && pledges.length > 0

    const hasJustPaidFirstPledge = !!hasJustPaid && hasPledge && pledges.length === 1

    const hasMembership = await pgdb.public.memberships.findFirst({
      userId: userId
    })
    const membershipTypeBenefactor = await pgdb.public.membershipTypes.findOne({
      name: 'BENEFACTOR_ABO'
    })
    const isBenefactor = membershipTypeBenefactor ? await pgdb.public.memberships.findFirst({
      userId: userId,
      membershipTypeId: membershipTypeBenefactor.id
    }) : false

    const enforcedNewsletterSubscriptions = isNew
      ? {
        // Autosubscribe free newsletters when user is new.
        [MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: true
      }
      : hasJustPaidFirstPledge
        ? {
          // Autosubscribe paid newsletters when user just paid.
          [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: true,
          [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: true
        }
        : !hasMembership
          ? {
            // Revoke paid newsletters when membership is inactive.
            [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: false,
            [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: false
          }
          : {}

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
          [MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: !!isBenefactor,
          ...enforcedNewsletterSubscriptions
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
  } catch (e) {
    logger.error(e, { userId })
  }
}
