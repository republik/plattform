import { mediaQueries, fontStyles, useMediaQuery } from '@project-r/styleguide'
import { css } from 'glamor'
import { Typewriter } from 'react-simple-typewriter'
import Frame from '../components/Frame'
import AssetImage from '../lib/images/AssetImage'
import { useTranslation } from '../lib/withT'

const LOGO_SRC_LG =
  '/static/5-jahre-republik/republik_jubilaeumslogo-image-lg-white.png'
const LOGO_SRC_SM =
  '/static/5-jahre-republik/republik_jubilaeumslogo-image-sm-white.png'

const InviteSenderPage = () => {
  const { t } = useTranslation()
  const isDesktop = useMediaQuery(mediaQueries.mUp)

  // TODO: either read from t9n or add list of words as static arrays

  return (
    <Frame pageColorSchemeKey='dark'>
      <main {...styles.page}>
        <div {...styles.header}>
          <div {...styles.logo}>
            <AssetImage
              src={isDesktop ? LOGO_SRC_LG : LOGO_SRC_SM}
              width={isDesktop ? 100 : 65}
              height={isDesktop ? 85 : 55}
            />
            <span {...styles.logoText}>
              Fünf Jahre
              <br /> Republik
            </span>
          </div>
          <h1 {...styles.heading}>
            {t.elements('FutureCampaign/slogan/text', {
              persona: (
                <Typewriter
                  words={personasForTypeWriter}
                  loop={true}
                  typeSpeed={80}
                  delaySpeed={5000}
                  cursor
                />
              ),
            })}
          </h1>
          <p {...styles.text}>{t('FutureCampaign/sender/headerText')}</p>
        </div>

        <div {...styles.box}>
          <h2>{t('FutureCampaign/sender/invite/heading')}</h2>
          <p>{t('FutureCampaign/sender/invite/text')}</p>
          <p>{t('FutureCampaign/sender/invite/shareText')}</p>
          <div>
            <i>Link copy field</i>
          </div>
          <div>
            {/*
              TODO: what about just a share button?
              If no: do we really only want these three?
            */}
            <i>Share Buttons (Twitter, Telegram, Mail?)</i>
          </div>
        </div>

        <div {...styles.box}>
          <h2>{t('FutureCampaign/sender/reward/heading')}</h2>
          <p>{t('FutureCampaign/sender/reward/text')}</p>
          <div>
            <i>Invite progress UI</i>
            <p>{t('FutureCampaign/sender/reward/hint')}</p>
          </div>
        </div>

        <p {...styles.text}>{t('FutureCampaign/sender/thankYou/text')}</p>
      </main>
    </Frame>
  )
}

export default InviteSenderPage

const styles = {
  page: css({
    '> *:not(:first-child)': {
      marginTop: 48,
    },
  }),
  header: css({
    '> *:not(:first-child)': {
      marginTop: 28,
    },
  }),
  logo: css({
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  }),
  logoText: css({
    ...fontStyles.sansSerifMedium,
    fontSize: 21,
    [mediaQueries.mUp]: {
      fontSize: 36,
    },
  }),
  heading: css({
    ...fontStyles.serifTitle,
    margin: 0,
    minHeight: '20vw', // Necessary, else typwriter will cause layout-shifts
    fontSize: 24,
    [mediaQueries.mUp]: {
      minHeight: '20vw', // Necessary, else typwriter will cause layout-shifts
      fontSize: 42,
    },
  }),
  text: css({
    ...fontStyles.sansSerifRegular,
    margin: 0,
    fontSize: 21,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifMedium,
      fontSize: 28,
    },
  }),
  box: css({
    padding: '1rem',
  }),
}

// TODO: either read from t9n or add list of words as static arrays
// (from t9n seems a bit insane though…)
const personasForTypeWriter = [
  'Ihre Schwiegermutter',
  'Ihr Göttikind',
  'Ihre Mitbewohnerin',
  'der Lehrer Ihrer Kinder',
  'Ihr Yogalehrer',
  'Ihre Hebamme',
  'Ihr Lieblingsbarista',
  'Ihre Zugbegleiterin',
  'Ihre Kollegin',
  'Ihr Trauzeuge',
  'Ihre Steuerberaterin',
  'Ihr Betriebsleiter',
  'Ihre Chefin',
  'Ihr Ex',
  'Ihre Nachbarin',
  'Ihr Coiffeur',
]
