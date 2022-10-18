import React from 'react'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'

export const userProgressConsentFragment = `
  fragment ProgressConsent on User {
    progressConsent: hasConsentedTo(name: "PROGRESS")
  }
`

export const checkRoles = (me, roles) => {
  return !!(
    me &&
    (!roles ||
      (me.roles && me.roles.some((role) => roles.indexOf(role) !== -1)))
  )
}

export const meQuery = gql`
  query me {
    me {
      id
      username
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
      prolongBeforeDate
      activeMembership {
        id
        type {
          name
        }
        endDate
        graceEndDate
      }
      ...ProgressConsent
    }
  }
  ${userProgressConsentFragment}
`

const withMe = graphql(meQuery, {
  props: ({ data: { me, refetch } }) => ({
    me,
    meRefetch: refetch,
    hasActiveMembership: !!me?.activeMembership,
    hasAccess: checkRoles(me, ['member']),
  }),
})

export default withMe
