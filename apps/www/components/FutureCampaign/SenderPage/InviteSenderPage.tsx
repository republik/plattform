import {
  mediaQueries,
  fontStyles,
  IconButton,
  CopyToClippboardIcon,
  Checkbox,
  Button,
  Loader,
} from '@project-r/styleguide'
import Link from 'next/link'
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
import { useNumOfRedeemedInvitesQuery } from '../graphql/useNumOfRedeemedInvitesQuery'
import dynamic from 'next/dynamic'

const Confetti = dynamic(() => import('./Confetti'), {
  ssr: false,
})

export const FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES = 5

const DONATE_MONTHS_CONSENT_KEY = '5YEAR_DONATE_MONTHS'

const InviteSenderPage = ({ me }: { me: MeObjectType }) => {
  const [showShareOverlay, setShowShareOverlay] = useState(false)
  const { data: userInviteData } = useUserInviteQuery()
  const { data: redeemedInvites, loading: loadingRedeemedInvites } =
    useNumOfRedeemedInvitesQuery()
  const hasShareGrant = me?.accessCampaigns.length > 0

  const hasRedeemedAllInvites =
    FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES ===
    redeemedInvites?.me?.futureCampaignAboCount

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
    const { accessToken } = userInviteData.me
    return `${PUBLIC_BASE_URL}/5-jahre-republik/${accessToken}`
  }, [userInviteData])

  const longestPersonaString = useMemo(
    () =>
      personasForTypeWriter.reduce((a, b) => (a.length > b.length ? a : b), ''),
    [personasForTypeWriter],
  )

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

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
  }

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
    <Frame
      pageColorSchemeKey='dark'
      containerMaxWidth={'700px'}
      meta={{
        title: 'Verstärkung holen',
      }}
    >
      <main {...styles.page}>
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
            Unabhängiger Journalismus hat eine Zukunft, wenn{' '}
            {longestPersonaString} das auch will.
          </h1>
        </div>
        {hasRedeemedAllInvites ? (
          <div {...styles.box}>
            <Confetti />
            <h2 {...styles.boxHeading}>Vielen Dank!</h2>
            <p {...styles.boxText}>
              Sie haben {FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES} neue Mitstreiter
              an Bord geholt!
            </p>
            <p {...styles.boxText}>
              Zum Dank erhalten Sie in den nächsten Wochen eine
              Republik-Jubiläumstasche zugesandt.{' '}
              {!userInviteData?.me?.hasAddress && (
                <span>
                  Vergessen Sie nicht,{' '}
                  <Link href='/konto' passHref>
                    <a {...styles.inlineLink}>
                      im Konto Ihre Adresse zu hinterlegen
                    </a>
                  </Link>
                  , damit wir Ihnen das Geschenk zustellen können.
                </span>
              )}
            </p>
            <Loader
              loading={loadingRedeemedInvites}
              render={() => (
                <RewardProgress
                  reached={redeemedInvites?.me?.futureCampaignAboCount || 0}
                  max={FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES}
                />
              )}
            />
          </div>
        ) : (
          <>
            <div {...styles.box}>
              <h2 {...styles.boxHeading}>
                <AssetImage src={SendInviteSVG} width={80} height={80} />
                Holen Sie Verstärkung...
              </h2>
              <p {...styles.boxText}>
                Als Verleger können Sie bis zu 5 Mitstreiterinnen einladen.
                Diese können die Republik für ein Jahr abonnieren – zu einem
                Preis, der für sie stimmt.
              </p>
              <p {...styles.boxText}>
                Über diesen Link werden aus Freunden Mitstreiter:
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
                <div {...styles.buttonWrapper}>
                  <Button
                    onClick={() => setShowShareOverlay(true)}
                    block
                    style={{ height: 45 }}
                  >
                    Link teilen
                  </Button>
                </div>
              </div>
              {showShareOverlay && (
                <ShareOverlay
                  onClose={() => setShowShareOverlay(false)}
                  url={inviteLink}
                  title='Angebot teilen'
                  tweet='Ich habe 5 Einladungen zu vergeben: Erhalte ein Jahr lang die Republik – zu dem Preis, der für dich stimmt.'
                  emailSubject={'Ich habe 5 Republik Einladungen zu vergeben.'}
                  emailBody={`Ein Jahr lang die Republik – zu dem Preis, der für dich stimmt. Zum Angebot:`}
                  emailAttachUrl
                />
              )}
              {userInviteData?.me && !userInviteData.me?.hasPublicProfile && (
                <p {...styles.disclamerText}>
                  Hinweis, weil Ihr Profil bei der Republik auf «privat»
                  eingestellt ist: Die Person, mit der Sie diesen Link teilen,
                  wird Ihren Namen und Ihr Profilbild sehen können.
                </p>
              )}
            </div>
            <div {...styles.box}>
              <h2 {...styles.boxHeading}>
                <AssetImage src={ReceiveMonthsSVG} width={80} height={80} />
                ...und erhalten Sie noch mehr Republik.
              </h2>
              <p {...styles.boxText}>
                Für jede neue Mitstreiterin, die Sie zur Republik-Community
                holen, verlängern wir Ihre Mitgliedschaft um einen Monat.
              </p>
              <div>
                <Loader
                  loading={loadingRedeemedInvites}
                  render={() => (
                    <RewardProgress
                      reached={redeemedInvites?.me?.futureCampaignAboCount || 0}
                      max={FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES}
                    />
                  )}
                />
                <p {...styles.disclamerText}>
                  Sie möchten Ihnen gutgeschriebene Monate an die Republik
                  spenden? Kein Problem:
                </p>
                <Checkbox
                  disabled={donateMonthsConsentLoading}
                  checked={Boolean(donateMonthsConsent?.me?.hasConsentedTo)}
                  onChange={(_, value) =>
                    handleDonateMonthsChange(Boolean(value))
                  }
                >
                  Ja, ich will die Monate spenden.
                </Checkbox>
              </div>
            </div>
          </>
        )}
      </main>
    </Frame>
  )
}

export default enforceMembership()(InviteSenderPage)

const styles = {
  page: css({
    '> *:not(:first-child)': {
      marginBottom: 42,
      [mediaQueries.mUp]: {
        marginBottom: 64,
      },
    },
  }),
  headingWrapper: css({
    display: 'grid',
  }),
  heading: css({
    gridColumn: 1,
    gridRow: 1,
    margin: '20px 0 32px 0',
    ...fontStyles.serifTitle26,
    lineHeight: 1.3,
    [mediaQueries.mUp]: {
      ...fontStyles.serifTitle38,
      margin: '24px 0 46px 0',
    },
  }),
  shadowHeading: css({
    display: 'block',
    gridColumn: 1,
    gridRow: 1,
    overflow: 'hidden',
    visibility: 'hidden',
  }),
  box: css({
    display: 'flex',
    flexDirection: 'column',
  }),
  boxHeading: css({
    ...fontStyles.sansSerifMedium22,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    margin: 0,
    marginBottom: 8,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifMedium26,
      marginBottom: 8,
    },
    '& > span:first-child': {
      marginRight: 8,
    },
  }),
  boxText: css({
    ...fontStyles.sansSerifRegular16,
    marginTop: 0,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular18,
    },
  }),

  inviteShareLinkText: css({
    ...fontStyles.sansSerifMedium18,
    margin: 0,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifMedium19,
    },
  }),
  inviteActionWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    width: '100%',
    marginTop: 4,
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      marginTop: 8,
    },
  }),
  inviteLinkBox: css({
    ...fontStyles.sansSerifRegular,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    alignItems: 'center',
    padding: '12px 15px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
    overflow: 'hidden',
  }),
  buttonWrapper: css({
    width: '100%',
    [mediaQueries.mUp]: {
      maxWidth: 200,
    },
  }),
  inviteLinkBoxText: css({
    fontSize: 14,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }),
  disclamerText: css({
    ...fontStyles.sansSerifregular16,
  }),
  inlineLink: css({
    color: 'inherit',
    textDecoration: 'underline',
  }),
}

// TODO: either read from t9n or add list of words as static arrays
// (from t9n seems a bit insane though…)
const personasForTypeWriter = [
  'Ihre Yogalehrerin',
  'Ihr Schönheitsoperateur',
  'Ihre Hautärztin',
  'Ihr Tennispartner',
  'Ihre Fussballkollegin',
  'Ihr Nachbar',
  'Ihr Bruder',
  'Ihre Tante',
  'Ihr Butler',
  'Ihre Psychiaterin',
  'Ihr Versicherungsvertreter',
  'Ihre Schwiegermutter',
  'Ihr Militärkollege',
  'Ihre Bäckerin ',
  'Ihr Zellennachbar',
  'Ihre Kaffeebekanntschaft',
  'Ihr Schwager',
  'Ihre Nichte',
  'Ihr Onkel',
  'Ihr Tinderdate',
  'Ihre Nanny',
  'Ihr Nerdkollege',
  'Ihre Hebamme',
  'Ihr Erzfeind',
  'Ihre Sandkastenfreundin',
  'Ihr Astrologe',
  'Ihre PR-Beraterin',
  'Ihr Spindoktor',
  'Ihre Bürokollegin',
  'Ihr Diätberater',
  'Ihre Optikerin',
  'Ihr Hundetrainer',
  'Ihre Skilehrerin',
  'Ihr Buchhändler',
  'Ihre Biografin',
  'Ihr Frenemy',
  'Ihre Steuerberaterin',
  'Ihr Betriebsleiter',
  'Ihre Ex',
  'Ihr Coiffeur',
  'Ihre Zugbegleiterin',
  'Ihr Trauzeuge',
  'Ihre Mitbewohnerin',
  'Ihr Göttikind',
  'Ihr Lieblingsbarista',
  'Ihre Gesangslehrerin',
]
