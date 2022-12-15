import { Fragment } from 'react'
import withMe from '../../lib/withMe'
import withT from '../../lib/withT'
import SignIn from './SignIn'
import Me from './Me'
import { css } from 'glamor'

import { Interaction } from '@project-r/styleguide'

export const checkRoles = (me, roles) => {
  return !!(
    me &&
    (!roles ||
      (me.roles && me.roles.some((role) => roles.indexOf(role) !== -1)))
  )
}

const styles = {
  center: css({
    width: '100%',
    maxWidth: '540px',
    margin: '20vh auto',
    padding: 20,
  }),
}
export const PageCenter = ({ children }) => (
  <div {...styles.center}>{children}</div>
)

const withAuthorization =
  (roles, key = 'isAuthorized') =>
  (WrappedComponent) =>
    withMe(({ me, ...props }) => (
      <WrappedComponent
        {...props}
        me={me}
        {...{ [key]: checkRoles(me, roles) }}
      />
    ))

const UnauthorizedPage = withT(({ t, me, roles = [] }) => (
  <div>
    <PageCenter>
      {!me ? (
        <Fragment>
          <Interaction.H1>{t('withAuthorization/title')}</Interaction.H1>
          <br />
          <SignIn />
        </Fragment>
      ) : (
        <Fragment>
          <Interaction.H1>{t('withAuthorization/title')}</Interaction.H1>
          <Interaction.P>
            {t('withAuthorization/authorizedRoles', {
              roles: roles.join(', '),
            })}
            <br />
          </Interaction.P>
          <br />
          <Me />
        </Fragment>
      )}
    </PageCenter>
  </div>
))

export const enforceAuthorization = (roles) => (WrappedComponent) =>
  withAuthorization(roles)(({ isAuthorized, me, ...props }) => {
    if (isAuthorized) {
      return <WrappedComponent {...props} />
    }
    return <UnauthorizedPage me={me} roles={roles} url={props.url} />
  })

export default withAuthorization
