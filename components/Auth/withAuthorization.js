import React from 'react'
import withMe from '../../lib/withMe'
import withT from '../../lib/withT'
import Me from './Me'
import { css } from 'glamor'

import { Interaction, BrandMark } from '@project-r/styleguide'

const styles = {
  center: css({
    width: '100%',
    maxWidth: '540px',
    margin: '20vh auto',
    padding: 20
  }),
  brandMark: css({
    maxWidth: 40,
    marginBottom: 20
  })
}

export default authorizedRoles => Component =>
  withT(
    withMe(props => {
      const { me, t } = props
      if (
        me &&
        me.roles &&
        me.roles.some(role => authorizedRoles.indexOf(role) !== -1)
      ) {
        return <Component {...props} />
      }
      return (
        <div {...styles.center}>
          <div {...styles.brandMark}>
            <BrandMark />
          </div>
          <Interaction.H1>{t('withAuthorization/title')}</Interaction.H1>
          {me && (
            <Interaction.P>
              {t('withAuthorization/authorizedRoles', {
                roles: authorizedRoles.join(', ')
              })}
              <br />
            </Interaction.P>
          )}
          <br />
          <Me />
        </div>
      )
    })
  )
