import { changeEmailOnMailchimp } from './changeEmailOnMailchimp'
import { deleteEmail } from './deleteEmail'
import { getNewsletterSettings } from './getNewsletterSettings'
import { updateNameMergeFields } from './updateNameMergeFields'
import { updateNewsletterSubscriptions } from './updateNewsletterSubscriptions'
import { getInterestsForUser } from './getInterestsForUser'
import { isUserInAudience } from './isUserInAudience'
import { addUserToAudience, addUserToMarketingAudience } from './addUserToAudience'
import { archiveMemberInAudience } from './archiveMemberInAudience'
import { NewsletterSubscriptionConfig } from '../NewsletterSubscriptionConfig'
import { enforceSubscriptions } from './enforceSubscriptions'
import { resubscribeEmail } from './resubscribeEmail'
import { getSegmentDataForUser } from './getSegmentDataForUser'
import { getMergeFieldsForUser } from './getMergeFieldsForUser'
import { getMailchimpMember } from './getMailchimpMember'

export {
  changeEmailOnMailchimp,
  deleteEmail,
  getNewsletterSettings,
  updateNameMergeFields,
  updateNewsletterSubscriptions,
  getInterestsForUser,
  isUserInAudience,
  addUserToAudience,
  addUserToMarketingAudience,
  archiveMemberInAudience,
  NewsletterSubscriptionConfig,
  enforceSubscriptions,
  resubscribeEmail,
  getSegmentDataForUser,
  getMergeFieldsForUser,
  getMailchimpMember,
}
