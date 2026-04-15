import withMe, { checkRoles } from '../../lib/apollo/withMe'

export const withAuthorization =
  (roles, key = 'isAuthorized') =>
  (WrappedComponent) =>
    withMe(({ me, ...props }) => (
      <WrappedComponent
        {...props}
        me={me}
        {...{ [key]: checkRoles(me, roles) }}
      />
    ))

export const withMembership = withAuthorization(['member'], 'isMember')
export const withEditor = withAuthorization(['editor'], 'isEditor')
export const withSupporter = withAuthorization(['supporter'], 'isSupporter')
export const withTester = withAuthorization(['tester'], 'isTester')
export const withModerator = withAuthorization(
  ['moderator', 'admin'],
  'isModerator',
)
