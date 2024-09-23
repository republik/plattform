import { graphql } from '@apollo/client/react/hoc'
import { MeDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { OPEN_ACCESS } from 'lib/constants'

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
    hasAccess: OPEN_ACCESS ? true : checkRoles(me, ['member']),
  }),
})
