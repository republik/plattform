const { createMail } = require('@orbiting/backend-modules-mail')
const logger = console
const {
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR
} = process.env

const mail = createMail([
  { name: 'DAILY', interestId: MAILCHIMP_INTEREST_NEWSLETTER_DAILY, roles: ['member'] },
  { name: 'WEEKLY', interestId: MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY, roles: ['member'] },
  { name: 'PROJECTR', interestId: MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR, roles: [] }
])

mail.enforceSubscriptions = async ({ userId, hasJustPaid, isNew, pgdb, ...rest }) => {
  const user = await pgdb.public.users.findOne({id: userId})
  if (!user) {
    logger.error('user not found in enforceSubscriptions', { userId })
    return
  }

  const pledges = await pgdb.public.pledges.find({
    userId: user.id,
    status: 'SUCCESSFUL'
  })

  const hasPledge = (!!pledges && pledges.length > 0)

  const hasJustPaidFirstPledge = !!hasJustPaid && hasPledge && pledges.length === 1

  const hasMembership = !!(await pgdb.public.memberships.findFirst({
    userId: user.id,
    active: true
  }))

  const membershipTypeBenefactor = await pgdb.public.membershipTypes.findOne({
    name: 'BENEFACTOR_ABO'
  })

  const isBenefactor = membershipTypeBenefactor ? !!(await pgdb.public.memberships.findFirst({
    userId: user.id,
    membershipTypeId: membershipTypeBenefactor.id
  })) : false

  // Update the membership type interests on mailchimp
  const interests = {
    [MAILCHIMP_INTEREST_PLEDGE]: hasPledge,
    [MAILCHIMP_INTEREST_MEMBER]: hasMembership,
    [MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: isBenefactor
  }

  if (isNew) {
    // New User automatically gets the project r newsletters
    interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] = true
  }

  if (hasJustPaidFirstPledge || !hasMembership) {
    // Autosubscribe all newsletters when new user just paid the membersh.
    // Or revoke paid newsletters when membership is inactive
    interests[MAILCHIMP_INTEREST_NEWSLETTER_DAILY] = hasMembership
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY] = hasMembership
  }

  return mail.updateNewsletterSubscriptions({ user, interests, ...rest })
}

module.exports = mail
