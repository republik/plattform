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
import {
  enforceMembership,
  UnauthorizedMessage,
} from '../../Auth/withMembership'
import { MeObjectType } from '../../../lib/context/MeContext'
import { PageCenter } from '../../Auth/withAuthorization'
import { isAbsolute } from 'node:path/win32'

const DONATE_MONTHS_CONSENT_KEY = '5YEAR_DONATE_MONTHS'

const InviteSenderPage = ({ me }: { me: MeObjectType }) => {
  const [showShareOverlay, setShowShareOverlay] = useState(false)
  const { data: userInviteData } = useUserInviteQuery()
  const hasShareGrant = me?.accessCampaigns.length > 0

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

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
  }

  // TODO: Show special UI if a user has no subscription

  if (!hasShareGrant) {
    return (
      <Frame>
        <PageCenter>
          <UnauthorizedMessage />
        </PageCenter>
      </Frame>
    )
  }

  return (
    <Frame pageColorSchemeKey='dark'>
      <main {...styles.page}>
        <div {...styles.header}>
          <div {...styles.headingWrapper}>
            <h1 {...styles.heading}>
              Unabhängiger Journalismus hat eine Zukunft, wenn{' '}
              <Typewriter
                words={personasForTypeWriter}
                loop={true}
                typeSpeed={80}
                delaySpeed={5000}
                cursor
              />{' '}
              das auch will.
            </h1>
            <h1 {...styles.shadowHeading} {...styles.heading}>
              Unabhängiger Journalismus hat eine Zukunft, wenn der Lehrer Ihrer
              Kinder das auch will.
            </h1>
          </div>

          <p {...styles.text}>
            An der Republik vorbeizukommen, wird einiges schwerer. Dank Ihnen
            und den Menschen, die Ihnen wichtig sind.
          </p>
        </div>
        <div {...styles.box}>
          <h2 {...styles.boxHeading}>
            <AssetImage src={SendInviteSVG} width={80} height={80} />
            Holen Sie Verstärkung...
          </h2>
          <div {...styles.inviteShareLinkSection}>
            <p {...styles.inviteShareLinkText}>
              Über diesen Link werden aus Freundinnen Mitstreiterinnen:
            </p>
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
            <p {...styles.boxText}>
              Als Verleger können Sie bis zu 5 Mitstreiter einladen. Diese
              können die Republik für ein Jahr abonnieren – zu einem Preis, der
              für sie stimmt.
            </p>
            {showShareOverlay && (
              <ShareOverlay
                onClose={() => setShowShareOverlay(false)}
                url={inviteLink}
                title='Angebot Teilen'
                tweet='Ich habe 5 Einladungen zu vergeben: Erhalte ein Jahr lang die Republik – zu dem Preis, der für dich stimmt.'
                emailSubject={'Ich habe 5 Republik Einladungen zu vergeben.'}
                emailBody={`Ein Jahr lang die Republik – zu dem Preis, der für dich stimmt. Zum Angebot: ${inviteLink}`}
                emailAttachUrl
              />
            )}
            {userInviteData?.me && !userInviteData.me?.hasPublicProfile && (
              <p {...styles.disclamar}>
                Hinweis, weil Ihr Profil bei der Republik auf «privat»
                eingestellt ist: Die Person, mit der Sie diesen Link teilen,
                wird Ihren Namen und Ihr Profilbild sehen können.
              </p>
            )}
          </div>
        </div>
        <div {...styles.box}>
          <h2 {...styles.boxHeading}>
            <AssetImage src={ReceiveMonthsSVG} width={80} height={80} />
            ...und erhalten Sie Ruhm, Ehre und noch mehr Republik.
          </h2>
          <p {...styles.boxText}>
            Für jede neue Mitstreiterin, die Sie zur Republik-Community holen,
            verlängern wir Ihre Mitgliedschaft um einen Monat.
          </p>
          <div>
            <RewardProgress reached={reachedRewards} max={maxRewards} />
            <p {...styles.disclamar}>
              Sie möchten Ihnen gutgeschriebene Monate an die Republik spenden?
              Kein Problem:
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
      </main>
    </Frame>
  )
}

export default enforceMembership()(InviteSenderPage)

const styles = {
  page: css({
    '> *:not(:first-child)': {
      marginTop: 42,
    },
  }),
  header: css({
    '> *:not(:first-child)': {
      marginTop: 28,
    },
  }),
  headingWrapper: css({
    display: 'grid',
  }),
  heading: css({
    gridColumn: 1,
    gridRow: 1,
    ...fontStyles.serifTitle,
    margin: 0,
    fontSize: 24,
    lineHeight: 1.3,
    [mediaQueries.mUp]: {
      fontSize: 36,
    },
  }),
  shadowHeading: css({
    display: 'block',
    gridColumn: 1,
    gridRow: 1,
    overflow: 'hidden',
    visibility: 'hidden',
  }),
  text: css({
    ...fontStyles.sansSerifRegular,
    margin: 0,
    fontSize: 17,
    lineHeight: 1.3,
    [mediaQueries.mUp]: {
      fontSize: 24,
    },
  }),
  box: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }),
  boxHeading: css({
    ...fontStyles.sansSerifBold,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    margin: 0,
    fontSize: 21,
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
    fontSize: 17,
    lineHeight: 1.3,
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
    fontSize: 17,
    lineHeight: 1.3,
    [mediaQueries.mUp]: {
      fontSize: 24,
    },
  }),
  inviteActionWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
    },
  }),
  inviteLinkBox: css({
    ...fontStyles.sansSerifRegular,
    flexShrink: 0,
    minWidth: 0,
    fontSize: 14,
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
  disclamar: css({
    ...fontStyles.sansSerifregular,
    fontSize: 16,
    lineHeight: 1.3,
    [mediaQueries.mUp]: {
      fontSize: 24,
    },
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
