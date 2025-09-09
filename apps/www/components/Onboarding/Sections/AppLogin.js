import { gql } from '@apollo/client'
import { css } from 'glamor'

import { Interaction, A } from '@project-r/styleguide'

import Section from '../Section'
import { CDN_FRONTEND_BASE_URL } from '../../../lib/constants'
import withT from '../../../lib/withT'

const { P } = Interaction

const styles = {
  p: css({
    marginBottom: 20,
  }),
  badge: css({
    width: 200,
    maxWidth: '100%',
  }),
}

export const fragments = {
  user: gql`
    fragment AppLoginUser on User {
      id
      devices {
        id
      }
    }
  `,
}

const AppLogin = (props) => {
  const { user, t } = props
  const hasDevices = user && user.devices && !!user.devices.length

  return (
    <Section
      heading={t('Onboarding/Sections/AppLogin/heading')}
      isTicked={hasDevices}
      {...props}
    >
      <P {...styles.p}>
        {t.first(
          [
            `Onboarding/Sections/AppLogin/hasDevice/${!!hasDevices}/paragraph1`,
            'Onboarding/Sections/AppLogin/paragraph1',
          ],
          null,
          '',
        )}
      </P>
      <P {...styles.p}>
        {t.first(
          [
            `Onboarding/Sections/AppLogin/hasDevice/${!!hasDevices}/paragraph2`,
            'Onboarding/Sections/AppLogin/paragraph2',
          ],
          null,
          '',
        )}
      </P>
      <P {...styles.p}>
        {t.first(
          [
            `Onboarding/Sections/AppLogin/hasDevice/${!!hasDevices}/paragraph3`,
            'Onboarding/Sections/AppLogin/paragraph3',
          ],
          null,
          '',
        )}
      </P>
      <P {...styles.p}>
        {t('Onboarding/Sections/AppLogin/ios')}
        <br />
        <A href='https://itunes.apple.com/ch/app/republik/id1392772910'>
          <img
            {...styles.badge}
            src={`${CDN_FRONTEND_BASE_URL}/static/apple-store-badge.png`}
            width='564'
            height='189'
            alt={t('Onboarding/Sections/AppLogin/ios/alt')}
          />
        </A>
      </P>
      <P {...styles.p}>
        {t('Onboarding/Sections/AppLogin/android')}
        <br />
        <A href='https://play.google.com/store/apps/details?id=app.republik'>
          <img
            {...styles.badge}
            src={`${CDN_FRONTEND_BASE_URL}/static/google-play-badge.png`}
            height='564'
            height='168'
            alt={t('Onboarding/Sections/AppLogin/android/alt')}
          />
        </A>
      </P>
      <P {...styles.p}>
        {t('Onboarding/Sections/AppLogin/apk')}
        <br />
        <A href='https://www.republik.ch/app/apk/latest' target='_blank'>
          {t('Onboarding/Sections/AppLogin/apk/link')}
        </A>
      </P>
    </Section>
  )
}

export default withT(AppLogin)
