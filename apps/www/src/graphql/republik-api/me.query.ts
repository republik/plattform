import { gql } from '@apollo/client'

export const ME_QUERY = gql`
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
`

export type MeQueryResult = {
  me: {
    id: string
    username: string
    slug: string
    portrait: string
    name: string
    firstName: string
    lastName: string
    email: string
    initials: string
    roles: string[]
    isListed: boolean
    hasPublicProfile: boolean
  }
}
