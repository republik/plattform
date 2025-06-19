import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { PROLITTERIS_OPT_OUT_CONSENT } from '../constants'

const PROGRESS_OPT_OUT_CONSENT = 'PROGRESS_OPT_OUT'

export const userProgressConsentFragment = `
  fragment ProgressConsent on User {
    progressOptOut: hasConsentedTo(name: "${PROGRESS_OPT_OUT_CONSENT}")
  }
`

export const userProlitterisConsentFragment = `
  fragment ProlitterisConsent on User {
    prolitterisOptOut: hasConsentedTo(name: "${PROLITTERIS_OPT_OUT_CONSENT}")
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
      ...ProgressConsent
      ...ProlitterisConsent
    }
  }
  ${userProgressConsentFragment}
  ${userProlitterisConsentFragment}
`

export default graphql(meQuery, {
  props: ({ data: { me, refetch } }) => ({
    me,
    meRefetch: refetch,
    hasActiveMembership: !!me?.activeMembership,
    hasAccess: checkRoles(me, ['member']),
  }),
})
