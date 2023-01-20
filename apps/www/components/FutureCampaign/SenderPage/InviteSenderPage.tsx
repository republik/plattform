import {
  mediaQueries,
  fontStyles,
  useMediaQuery,
  IconButton,
  CopyToClippboardIcon,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { Typewriter } from 'react-simple-typewriter'
import { PUBLIC_BASE_URL } from '../../../lib/constants'
import AssetImage from '../../../lib/images/AssetImage'
import { useTranslation } from '../../../lib/withT'
import Frame from '../../Frame'
import RewardProgress from './RewardProgress'

const LOGO_SRC_LG =
  '/static/5-jahre-republik/republik_jubilaeumslogo-image-lg-white.png'
const LOGO_SRC_SM =
  '/static/5-jahre-republik/republik_jubilaeumslogo-image-sm-white.png'

const InviteSenderPage = () => {
  const { t } = useTranslation()
  const isDesktop = useMediaQuery(mediaQueries.mUp)
  const link = PUBLIC_BASE_URL + '/5-jahre-republik/' + 'foo'

  // TODO: Retrieve dynamically
  const maxRewards = 5
  const reachedRewards = 1

  // TODO: either read from t9n or add list of words as static arrays

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
  }

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
        <div {...styles.box} {...styles.inviteBox}>
          <h2 {...styles.boxHeading}>
            <span>💝</span> {t('FutureCampaign/sender/invite/heading')}
          </h2>
          <p {...styles.boxText}>{t('FutureCampaign/sender/invite/text')}</p>
          <div {...styles.inviteShareLinkSection}>
            <p {...styles.inviteShareLinkText}>
              {t('FutureCampaign/sender/invite/shareText')}
            </p>
            <div>
              <span {...styles.inviteLinkButton}>
                {link}
                <IconButton
                  onClick={() => handleCopyLink(link)}
                  Icon={CopyToClippboardIcon}
                  fill='#000000'
                  size={20}
                />
              </span>
            </div>
            {/*
                TODO: what about just a share button?
                If no: do we really only want these three?
                // Add custom variant of share button that has all personal share options
                // (meaning not twitter or facebook)
              */}
          </div>
        </div>

        <div {...styles.box} {...styles.rewardBox}>
          <h2 {...styles.boxHeading}>
            <span>🎁</span> {t('FutureCampaign/sender/reward/heading')}
          </h2>
          <p {...styles.boxText}>{t('FutureCampaign/sender/reward/text')}</p>
          <div>
            <RewardProgress reached={reachedRewards} max={maxRewards} />
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
      marginTop: 64,
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
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 36,
  }),
  boxHeading: css({
    ...fontStyles.sansSerifMedium,
    margin: 0,
    fontSize: 28,
    [mediaQueries.mUp]: {
      fontSize: 34,
    },
    '& > span:first-child': {
      marginRight: 8,
    },
  }),
  boxText: css({
    ...fontStyles.sansSerifRegular,
    margin: 0,
    fontSize: 19,
    [mediaQueries.mUp]: {
      fontSize: 24,
    },
  }),
  inviteBox: css({
    backgroundColor: '#FFFFFF',
    color: '#000000',
  }),
  inviteShareLinkSection: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }),
  inviteShareLinkText: css({
    ...fontStyles.sansSerifMedium,
    margin: 0,
    fontSize: 20,
    [mediaQueries.mUp]: {
      fontSize: 24,
    },
  }),
  inviteLinkButton: css({
    ...fontStyles.sansSerifRegular,
    fontsize: 18,
    padding: '12px 15px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    display: 'inline-flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  }),
  rewardBox: css({
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
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
