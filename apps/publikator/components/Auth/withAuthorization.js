import { BrandMark, Interaction } from '@project-r/styleguide'
import { css } from 'glamor'
import withMe from '../../lib/withMe'
import withT from '../../lib/withT'
import Me from './Me'

const styles = {
  center: css({
    width: '100%',
    maxWidth: '540px',
    margin: '20vh auto',
    padding: 20,
  }),
  brandMark: css({
    maxWidth: 40,
    marginBottom: 20,
  }),
}

const withAuthorization = (Component) =>
  withT(
    withMe((props) => {
      const { me, t } = props
      if (me && me.roles && me.roles.includes('admin')) {
        return <Component {...props} />
      }
      // TODO: redirect to republik.sanity.studio
      return (
        <div {...styles.center}>
          <div {...styles.brandMark}>
            <BrandMark />
          </div>
          <Interaction.H1>{t('withAuthorization/title')}</Interaction.H1>
          {me && (
            <Interaction.P>
              {t('withAuthorization/authorizedRoles', {
                roles: authorizedRoles.join(', '),
              })}
              <br />
            </Interaction.P>
          )}
          <br />
          <Me />
        </div>
      )
    }),
  )

export default withAuthorization
