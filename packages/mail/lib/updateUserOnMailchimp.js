const MailchimpInterface = require('../MailchimpInterface')
const logger = console

const {
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR
} = process.env

module.exports = async ({ pgdb, user, ...configuration }) => {
  const { email } = user
  const {
    isNew,
    hasJustPaidFirstPledge,
    hasMembership,
    isBenefactor,
    hasPledge } = configuration
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

  const mailchimp = new MailchimpInterface({ logger })
  return mailchimp.updateMember(email, {
    email_address: email,
    status: 'subscribed',
    interests: {
      [MAILCHIMP_INTEREST_PLEDGE]: !!hasPledge,
      [MAILCHIMP_INTEREST_MEMBER]: !!hasMembership,
      [MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: !!isBenefactor,
      ...enforcedNewsletterSubscriptions
    }
  })
}
