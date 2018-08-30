const debug = require('debug')('crowdfundings:lib:Mail')

const { grants } = require('@orbiting/backend-modules-access')
const { createMail } = require('@orbiting/backend-modules-mail')
const {
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_GRANTED_ACCESS,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_FEUILLETON,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR
} = process.env

const mail = createMail([
  {
    name: 'DAILY',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
    roles: ['member']
  },
  {
    name: 'FEUILLETON',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_FEUILLETON,
    roles: ['member']
  },
  {
    name: 'WEEKLY',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
    roles: ['member']
  },
  {
    name: 'PROJECTR',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
    roles: []
  }
])

const getInterestsForUser = async ({
  userId,
  subscribeToEditorialNewsletters,
  pgdb
}) => {
  const pledges = !!userId && await pgdb.public.pledges.find({
    userId,
    status: 'SUCCESSFUL'
  })
  const hasPledge = (!!pledges && pledges.length > 0)

  const hasMembership = !!userId && !!(await pgdb.public.memberships.findFirst({
    userId,
    active: true
  }))

  const membershipTypeBenefactor = await pgdb.public.membershipTypes.findOne({
    name: 'BENEFACTOR_ABO'
  })
  const isBenefactor = !!userId && membershipTypeBenefactor ? !!(await pgdb.public.memberships.findFirst({
    userId,
    membershipTypeId: membershipTypeBenefactor.id
  })) : false

  const user = !!userId && await pgdb.public.users.findOne({ id: userId })
  const accessGrants = !!user && await grants.findByRecipient(user, pgdb)
  const hasGrantedAccess = !!user && !!accessGrants && accessGrants.length > 0

  debug({
    hasPledge,
    hasMembership,
    isBenefactor,
    hasGrantedAccess
  })

  // Update the membership type interests on mailchimp
  const interests = {
    [MAILCHIMP_INTEREST_PLEDGE]: hasPledge,
    [MAILCHIMP_INTEREST_MEMBER]: hasMembership,
    [MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: isBenefactor,
    [MAILCHIMP_INTEREST_GRANTED_ACCESS]: hasGrantedAccess
  }

  if (
    subscribeToEditorialNewsletters &&
    (hasMembership || hasGrantedAccess)
  ) {
    // Autosubscribe all newsletters when new user just paid the membersh.
    interests[MAILCHIMP_INTEREST_NEWSLETTER_DAILY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_FEUILLETON] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] = true
  }

  return interests
}

mail.getInterestsForUser = getInterestsForUser

mail.enforceSubscriptions = async ({
  userId,
  email,
  subscribeToEditorialNewsletters,
  pgdb,
  ...rest
}) => {
  const user = !!userId && await pgdb.public.users.findOne({id: userId})

  const interests = await getInterestsForUser({
    userId: !!user && user.id,
    subscribeToEditorialNewsletters,
    pgdb
  })

  const sanitizedUser = user || { email, roles: [] }
  return mail.updateNewsletterSubscriptions({ user: sanitizedUser, interests, ...rest })
}

module.exports = mail
