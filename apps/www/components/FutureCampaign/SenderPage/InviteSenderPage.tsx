import {
  mediaQueries,
  fontStyles,
  IconButton,
  CopyToClippboardIcon,
  Checkbox,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { useMemo, useState } from 'react'
import { Typewriter } from 'react-simple-typewriter'
import { PUBLIC_BASE_URL } from '../../../lib/constants'
import AssetImage from '../../../lib/images/AssetImage'
import Frame from '../../Frame'
import {
  useDonateMonthsConsentQuery,
  useGiveConsentToDonateMonthsMutation,
  useRevokeConsentToDonateMonthsMutation,
} from '../graphql/consentOperations'
import { useUserInviteQuery } from '../graphql/useUserInviteQuery'
import RewardProgress from './RewardProgress'
import ShareOverlay from '../../ActionBar/ShareOverlay'

import SendInviteSVG from '../../../public/static/5-jahre-republik/sender/send-invite_white.svg'
import ReceiveMonthsSVG from '../../../public/static/5-jahre-republik/sender/receive-months_white.svg'
import LogoLGSVG from '../../../public/static/5-jahre-republik/logo/logo-lg_white.svg'

const DONATE_MONTHS_CONSENT_KEY = '5YEAR_DONATE_MONTHS'

const InviteSenderPage = () => {
  const [showShareOverlay, setShowShareOverlay] = useState(false)
  const { data: userInviteData } = useUserInviteQuery()
  const {
    data: donateMonthsConsent,
    loading: donateMonthsConsentLoading,
    refetch: refetchConsent,
  } = useDonateMonthsConsentQuery({
    variables: {
      name: DONATE_MONTHS_CONSENT_KEY,
    },
  })

  const [giveConsent] = useGiveConsentToDonateMonthsMutation({
    variables: {
      name: DONATE_MONTHS_CONSENT_KEY,
    },
  })
  const [revokeConsent] = useRevokeConsentToDonateMonthsMutation({
    variables: {
      name: DONATE_MONTHS_CONSENT_KEY,
    },
  })

  const inviteLink = useMemo(() => {
    if (!userInviteData || !userInviteData.me) {
      return null
    }
    const { hasPublicProfile, slug, accessToken } = userInviteData.me
    if (hasPublicProfile) {
      return `${PUBLIC_BASE_URL}/5-jahre-republik/~${slug}`
    } else {
      return `${PUBLIC_BASE_URL}/5-jahre-republik/${accessToken}`
    }
  }, [userInviteData])

  const handleDonateMonthsChange = async (value: boolean) => {
    try {
      if (value) {
        await giveConsent()
      } else {
        await revokeConsent()
      }
      await refetchConsent()
    } catch (e) {
      console.error(e)
    }
  }

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
          <div {...styles.headingWrapper}>
            <div {...styles.logo}>
              <AssetImage src={LogoLGSVG} width={236} height={203} />
            </div>
            <h1 {...styles.heading}>
              Journalismus hat eine Zukunft, wenn{' '}
              <Typewriter
                words={personasForTypeWriter}
                loop={true}
                typeSpeed={80}
                delaySpeed={5000}
                cursor
              />{' '}
              das auch will.
            </h1>
          </div>

          <p {...styles.text}>
            An der Republik vorbeizukommen, wird einiges schwerer. Dank Ihnen
            und den Menschen, die Ihnen wichtig sind.
          </p>
        </div>
        <div {...styles.box}>
          <h2 {...styles.boxHeading}>
            <AssetImage src={SendInviteSVG} width={58} height={58} />
            Laden Sie ein…
          </h2>
          <p {...styles.boxText}>
            Als Verleger*in können Sie bis zu fünf Mitstreiter*innen einladen.
            Diese können die Republik für ein Jahr abonnieren — für den Preis,
            der für sie stimmt.
          </p>
          <div {...styles.inviteShareLinkSection}>
            <p {...styles.inviteShareLinkText}>Angebots-Link teilen</p>
            <div {...styles.inviteActionWrapper}>
              <div {...styles.inviteLinkBox}>
                <span {...styles.inviteLinkBoxText}>{inviteLink}</span>
                <IconButton
                  onClick={() => handleCopyLink(inviteLink)}
                  Icon={CopyToClippboardIcon}
                  title='Link kopieren'
                  fill='currentColor'
                  size={20}
                />
              </div>
              <button
                {...styles.shareButton}
                onClick={() => setShowShareOverlay(true)}
              >
                Link teilen
              </button>
            </div>
            {showShareOverlay && (
              <ShareOverlay
                onClose={() => setShowShareOverlay(false)}
                url={inviteLink}
                title={''}
                tweet=''
                emailSubject={''}
                emailBody=''
                emailAttachUrl
              />
            )}
            {/*
                TODO: what about just a share button?
                If no: do we really only want these three?
                // Add custom variant of share button that has all personal share options
                // (meaning not twitter or facebook)
              */}
            {userInviteData?.me && !userInviteData.me?.hasPublicProfile && (
              <p>
                *Da Sie ein privates Profil haben, möchten wir Sie darauf
                hinweisen, dass der Empfänger beim öffnen der Einladung ihren
                Namen und ihr Profilbild sehen kann.
              </p>
            )}
          </div>
        </div>

        <div {...styles.box}>
          <h2 {...styles.boxHeading}>
            <AssetImage src={ReceiveMonthsSVG} width={58} height={58} />
            …und werden Sie eingeladen.
          </h2>
          <p {...styles.boxText}>
            Für jede neue Mitstreiter*in, die Sie zur Republik Community holen,
            verlängern wir ihre Mitgliedschaft um einen Monat.
          </p>
          <div>
            <RewardProgress reached={reachedRewards} max={maxRewards} />
            <p>
              Sie möchten keine Verlängerung? Kein Problem, Sie können am Ende
              der Aktion ihre gesammelten Monate Spenden und erhalten dafür
              nicht nur Ruhm und Ehre, sodndern auch unseren unendlichen Dank.
            </p>
            <Checkbox
              disabled={donateMonthsConsentLoading}
              checked={Boolean(donateMonthsConsent?.me?.hasConsentedTo)}
              onChange={(_, value) => handleDonateMonthsChange(Boolean(value))}
            >
              Ja, ich will die Monate spenden.
            </Checkbox>
          </div>
        </div>

        <p {...styles.text}>Danke fürs mitmachen!</p>
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
  headingWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 48,
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
  }),
  logo: css({
    flex: '0 1 auto',
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
    flex: '1 1 0',
    ...fontStyles.serifTitle,
    margin: 0,
    minHeight: '4em',
    fontSize: 24,
    [mediaQueries.mUp]: {
      fontSize: 42,
      minHeight: '5em',
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  inviteActionWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  }),
  inviteLinkBox: css({
    ...fontStyles.sansSerifRegular,
    flexShrink: 0,
    minWidth: 0,
    fontSize: 18,
    maxWidth: '100%',
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'center',
    padding: '12px 15px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  }),
  inviteLinkBoxText: css({
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }),
  shareButton: css({
    padding: '12px 15px',
    flex: '0 0 auto',
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
