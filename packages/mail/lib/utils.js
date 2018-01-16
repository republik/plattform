const {
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR
} = process.env

module.exports.supportedInterestIds = [
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR
]

module.exports.nameToInterestId = {
  DAILY: MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  WEEKLY: MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  PROJECTR: MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR
}

const interestIdToName = {
  [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: 'DAILY',
  [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: 'WEEKLY',
  [MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: 'PROJECTR'
}

const interestIdToRequiredRoles = {
  [MAILCHIMP_INTEREST_NEWSLETTER_DAILY]: ['member'],
  [MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY]: ['member'],
  [MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR]: []
}

const isEligibleForInterestId = (interestId, roles) => {
  const requiredRoles = interestIdToRequiredRoles[interestId]
  if (!requiredRoles || requiredRoles.length === 0) {
    return true
  }
  if (roles) {
    for (let i = 0; i < roles.length; i++) {
      if (requiredRoles.indexOf(roles[i]) !== -1) {
        return true
      }
    }
  }
  return false
}
module.exports.isEligibleForInterestId = isEligibleForInterestId

module.exports.NewsletterSubscription = (
  userId,
  interestId,
  subscribed,
  roles
) => {
  const name = interestIdToName[interestId]
  return {
    id: Buffer.from(userId + name).toString('base64'),
    name,
    subscribed: subscribed,
    isEligible: isEligibleForInterestId(interestId, roles)
  }
}
