import React, { Fragment } from 'react'
import Frame from '../Frame'
import withT from '../../lib/withT'
import SignIn from './SignIn'
import Me from './Me'
import { css } from 'glamor'

import { Interaction } from '@project-r/styleguide'

import { withAuthorization } from './checkRoles'

const styles = {
  center: css({
    width: '100%',
    maxWidth: 600,
    margin: '10vh auto',
    padding: 20,
  }),
}
export const PageCenter = ({ children }) => (
  <div {...styles.center}>{children}</div>
)

const UnauthorizedPage = withT(({ t, me, roles = [] }) => (
  <Frame raw>
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
  </Frame>
))

export const enforceAuthorization = (roles) => (WrappedComponent) =>
  withAuthorization(roles)(({ isAuthorized, me, ...props }) => {
    if (isAuthorized) {
      return <WrappedComponent {...props} />
    }
    return <UnauthorizedPage me={me} roles={roles} />
  })

export default withAuthorization
