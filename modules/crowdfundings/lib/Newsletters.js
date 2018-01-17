const { updateNewsletterSubscriptions, configure } = require('@orbiting/backend-modules-mail')
const logger = console
const {
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR
} = process.env

configure([
  { name: 'DAILY', interestId: MAILCHIMP_INTEREST_NEWSLETTER_DAILY, roles: ['member'] },
  { name: 'WEEKLY', interestId: MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY, roles: ['member'] },
  { name: 'PROJECTR', interestId: MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR, roles: [] }
])

exports.enforceSubscriptions = async ({ userId, hasJustPaid, isNew, pgdb, ...rest }) => {
  const user = await pgdb.public.users.findOne({id: userId})
  if (!user) {
    logger.error('user not found in enforceSubscriptions', { userId })
    return
  }

  const pledges = await pgdb.public.pledges.find({
    userId: user.id,
    status: 'SUCCESSFUL'
  })

  const hasPledge = !!pledges && pledges.length > 0

  const hasJustPaidFirstPledge = !!hasJustPaid && hasPledge && pledges.length === 1

  const hasMembership = await pgdb.public.memberships.findFirst({
    userId: user.id,
    active: true
  })

  const membershipTypeBenefactor = await pgdb.public.membershipTypes.findOne({
    name: 'BENEFACTOR_ABO'
  })

  const isBenefactor = membershipTypeBenefactor ? await pgdb.public.memberships.findFirst({
    userId: user.id,
    membershipTypeId: membershipTypeBenefactor.id
  }) : false

  const enforcedNewsletterSubscriptions =
   isNew && hasJustPaidFirstPledge
     ? {
       // Autosubscribe all newsletters when new user just paid.
       [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: !!hasMembership,
       [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: !!hasMembership,
       [MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: true
     }
     : isNew
       ? {
         // Autosubscribe free newsletters when user is new.
         [MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: true
       }
       : hasJustPaidFirstPledge
         ? {
           // Autosubscribe paid newsletters when user just paid.
           [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: !!hasMembership,
           [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: !!hasMembership
         }
         : !hasMembership
           ? {
             // Revoke paid newsletters when membership is inactive.
             [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: false,
             [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: false
           }
         : {}

  const interests = {
    [MAILCHIMP_INTEREST_PLEDGE]: !!hasPledge,
    [MAILCHIMP_INTEREST_MEMBER]: !!hasMembership,
    [MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: !!isBenefactor,
    ...enforcedNewsletterSubscriptions
  }
  return updateNewsletterSubscriptions({ user, interests, ...rest })
}
