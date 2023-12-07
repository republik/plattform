import { gql } from './gql'

export const ME_QUERY = gql(`
  query me {
    me {
      id
      username
      slug
      portrait
      name
      firstName
      lastName
      email
      initials
      roles
      isListed
      hasPublicProfile
      discussionNotificationChannels
      accessCampaigns {
        id
      }
      hasDormantMembership
      prolongBeforeDate
      activeMembership {
        id
        type {
          name
        }
        renew
        endDate
        graceEndDate
        canProlong
      }
    }
  }
`)
