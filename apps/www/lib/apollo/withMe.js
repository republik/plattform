import { graphql } from '@apollo/client/react/hoc'
import { MeDocument } from '#graphql/republik-api/__generated__/gql/graphql'

export const checkRoles = (me, roles) => {
  return !!(
    me &&
    (!roles ||
      (me.roles && me.roles.some((role) => roles.indexOf(role) !== -1)))
  )
}

export default graphql(MeDocument, {
  props: ({ data: { me, refetch } }) => ({
    me,
    meRefetch: refetch,
    hasActiveMembership:
      !!me?.activeMembership || !!me?.activeMagazineSubscription,
    /**
     * OPEN ACCESS
     */
    // hasAccess: checkRoles(me, ['member']),
    hasAccess: true,
  }),
})
