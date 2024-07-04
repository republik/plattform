import { changeEmailOnMailchimp } from './changeEmailOnMailchimp'
import { deleteEmail } from './deleteEmail'
import { getNewsletterSettings } from './getNewsletterSettings'
import { updateMergeFields } from './updateMergeFields'
import { updateNewsletterSubscriptions } from './updateNewsletterSubscriptions'
import { getInterestsForUser } from './getInterestsForUser'
import { isUserInAudience } from './isUserInAudience'
import { addUserToAudience, addUserToMarketingAudience } from './addUserToAudience'
import { archiveMemberInAudience } from './archiveMemberInAudience'
import { NewsletterSubscriptionConfig } from '../NewsletterSubscriptionConfig'
import { enforceSubscriptions } from './enforceSubscriptions'
import { resubscribeEmail } from './resubscribeEmail'

export {
  changeEmailOnMailchimp,
  deleteEmail,
  getNewsletterSettings,
  updateMergeFields,
  updateNewsletterSubscriptions,
  getInterestsForUser,
  isUserInAudience,
  addUserToAudience,
  addUserToMarketingAudience,
  archiveMemberInAudience,
  NewsletterSubscriptionConfig,
  enforceSubscriptions,
  resubscribeEmail,
}
