import {
  mediaQueries,
  fontStyles,
  IconButton,
  Checkbox,
  Button,
  Loader,
} from '@project-r/styleguide'
import Link from 'next/link'
import { css } from 'glamor'
import { useEffect, useMemo, useState } from 'react'
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

// import SendInviteSVG from '../../../public/static/5-jahre-republik/sender/send-invite_white.svg'
// import ReceiveMonthsSVG from '../../../public/static/5-jahre-republik/sender/receive-months_white.svg'
import {
  enforceMembership,
  UnauthorizedMessage,
} from '../../Auth/withMembership'
import { postMessage, useInNativeApp } from '../../../lib/withInNativeApp'
import { MeObjectType } from '../../../lib/context/MeContext'
import { PageCenter } from '../../Auth/withAuthorization'
import { useNumOfRedeemedInvitesQuery } from '../graphql/useNumOfRedeemedInvitesQuery'
import dynamic from 'next/dynamic'
import clipboardCopy from 'clipboard-copy'
import { useTranslation } from '../../../lib/withT'

import { IconContentCopy } from '@republik/icons'

const Confetti = dynamic(() => import('./Confetti'), {
  ssr: false,
})

const useCopyToClipboard = () => {
  const [copyState, setCopyState] = useState<'success' | 'error' | undefined>()

  useEffect(() => {
    if (copyState !== undefined) {
      const timeout = setTimeout(() => {
        setCopyState(undefined)
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [copyState])

  const copy = async (text: string) => {
    try {
      await clipboardCopy(text)
      setCopyState('success')
    } catch (error) {
      setCopyState('error')
    }
  }

  return {
    copy,
    state: copyState,
  }
}

export const FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES = 5000

const DONATE_MONTHS_CONSENT_KEY = '5YEAR_DONATE_MONTHS'

const InviteSenderPage = ({ me }: { me: MeObjectType }) => {
  const [showShareOverlay, setShowShareOverlay] = useState(false)
  const { data: userInviteData } = useUserInviteQuery()
  const { data: redeemedInvites, loading: loadingRedeemedInvites } =
    useNumOfRedeemedInvitesQuery()
  const { inNativeApp } = useInNativeApp()
  const { t } = useTranslation()

  const copyToClipboard = useCopyToClipboard()

  const hasShareGrant = me?.accessCampaigns.length > 0

  const hasYearlySubscription = ['ABO', 'BENEFACTOR_ABO'].includes(
    me.activeMembership?.type?.name,
  )
  const hasMonthlySubscription =
    me.activeMembership?.type?.name === 'MONTHLY_ABO'

  const hasFutureCampaignSubscription =
    me.activeMembership?.type?.name === 'YEARLY_ABO'

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
    return `${PUBLIC_BASE_URL}/mitmachen/${accessToken}`
  }, [userInviteData])

  const longestPersonaString = useMemo(
    () =>
      personasForTypeWriter.reduce((a, b) => (a.length > b.length ? a : b), ''),
    [personasForTypeWriter],
  )

  const handleNativeShare = async () => {
    const f = await fetch('/static/avatar310.png')
    const blob = await f.blob()
    const fname = 'avatar310.png'
    const files = [
      new File([blob], fname, { type: 'image/png', lastModified: Date.now() }),
    ]

    const shareData = {
      title: fname,
      files,
    }

    if (navigator.canShare?.(shareData)) {
      await navigator.share(shareData)
    } else {
      console.log("can't share")
    }
  }

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
            />
            das auch will.
          </h1>
          <h1 {...styles.shadowHeading} {...styles.heading}>
            Unabhängiger Journalismus hat eine Zukunft, wenn{' '}
            {longestPersonaString} das auch will.
          </h1>
        </div>
        {hasYearlySubscription ? (
          <>
            {hasRedeemedAllInvites ? (
              <div {...styles.box}>
                <Confetti renderOverlay={userInviteData?.me?.hasAddress} />
                <h2 {...styles.boxHeading}>Vielen Dank!</h2>
                <p {...styles.boxText}>
                  Sie haben {FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES} neue
                  Mitstreiter an Bord geholt!
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
                    {/* <AssetImage
                      alt=''
                      src={SendInviteSVG}
                      width={80}
                      height={80}
                    /> */}
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
                      {!inNativeApp ? (
                        copyToClipboard.state === undefined ? (
                          <IconButton
                            onClick={() => copyToClipboard.copy(inviteLink)}
                            Icon={IconContentCopy}
                            title='Link kopieren'
                            fill='currentColor'
                            size={20}
                          />
                        ) : (
                          <span
                            style={{
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t(
                              `article/actionbar/link/label${
                                copyToClipboard.state
                                  ? `/${copyToClipboard.state}`
                                  : ''
                              }`,
                            )}
                          </span>
                        )
                      ) : null}
                    </div>
                    <div {...styles.buttonWrapper}>
                      <Button
                        onClick={(e) => {
                          if (inNativeApp) {
                            postMessage({
                              type: 'share',
                              payload: {
                                title: 'Angebot teilen',
                                url: inviteLink,
                                subject: `Ich habe ${FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES} Republik Einladungen zu vergeben.`,
                                dialogTitle: 'Angebot teilen',
                              },
                            })
                            e.currentTarget.blur()
                          } else {
                            setShowShareOverlay(true)
                          }
                        }}
                        block
                        style={{ height: 45 }}
                      >
                        Link teilen
                      </Button>
                      <Button
                        onClick={(e) => {
                          handleNativeShare()
                        }}
                        block
                        style={{ height: 45 }}
                      >
                        Link NATVE
                      </Button>
                    </div>
                  </div>
                  {showShareOverlay && (
                    <ShareOverlay
                      onClose={() => setShowShareOverlay(false)}
                      url={inviteLink}
                      title='Angebot teilen'
                      tweet={`Ich habe ${FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES} Einladungen zu vergeben: Erhalte ein Jahr lang die Republik – zu dem Preis, der für dich stimmt.`}
                      emailSubject={`Ich habe ${FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES} Republik Einladungen zu vergeben.`}
                      emailBody={`Ein Jahr lang die Republik – zu dem Preis, der für dich stimmt. Zum Angebot:`}
                      emailAttachUrl
                    />
                  )}
                  {userInviteData?.me &&
                    !userInviteData.me?.hasPublicProfile && (
                      <p {...styles.disclamerText}>
                        Hinweis, weil Ihr Profil bei der Republik auf «privat»
                        eingestellt ist: Die Person, mit der Sie diesen Link
                        teilen, wird Ihren Namen und Ihr Profilbild sehen
                        können.
                      </p>
                    )}
                </div>
                <div {...styles.box}>
                  <h2 {...styles.boxHeading}>
                    {/* <AssetImage
                      alt=''
                      src={ReceiveMonthsSVG}
                      width={80}
                      height={80}
                    /> */}
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
                          reached={
                            redeemedInvites?.me?.futureCampaignAboCount || 0
                          }
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
          </>
        ) : hasMonthlySubscription ? (
          <div>
            <p {...styles.text}>
              Wir freuen uns, dass Sie die Republik-Community verstärken wollen!
            </p>
            <p {...styles.text}>
              Mit Ihrem Monatsabo können Sie keine Mitstreiterinnen an Bord
              holen, aber: Sie selbst können Mitstreiter werden und ein Jahr
              Republik erhalten, zum Preis, der für Sie stimmt.
            </p>
            <p {...styles.text}>
              Melden Sie sich bei einer Verlegerin mit Jahresmitgliedschaft!
            </p>
            <p {...styles.text}>
              Und: Es gibt noch andere Wege, wie Sie zur Bekanntheit der
              Republik beitragen können. Hier finden Sie eine{' '}
              <Link href='/komplizin'>
                <a>Übersicht</a>
              </Link>
              .
            </p>
            <p {...styles.text}>Herzlichen Dank für Ihr Engagement!</p>
          </div>
        ) : hasFutureCampaignSubscription ? (
          <div>
            <p {...styles.text}>
              Wir freuen uns sehr, dass Sie die Republik neu mit einem
              Mitstreiter-Abo unterstützen und auch gleich selbst Verstärkung
              holen möchten!
            </p>
            <p {...styles.text}>
              Mit Ihrem Abo haben Sie Zugang zu allen Beiträgen der Republik.
              Selbst Mitstreiterinnen an Bord holen können Sie allerdings nicht,
              da Sie für Ihr Mitstreiter-Abo weniger als den regulären Preis
              bezahlt und damit nicht Mitglied der Genossenschaft sind.{' '}
            </p>
            <p {...styles.text}>
              Aber es gibt noch andere Wege, wie Sie zur Bekanntheit der
              Republik beitragen können: Hier finden Sie eine{' '}
              <Link href='/komplizin'>
                <a>Übersicht</a>
              </Link>
              .
            </p>
            <p {...styles.text}>Herzlichen Dank für Ihr Engagement!</p>
          </div>
        ) : !hasShareGrant ? (
          <Frame>
            <PageCenter>
              <UnauthorizedMessage />
            </PageCenter>
          </Frame>
        ) : null}
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
  text: css({
    ...fontStyles.sansSerifRegular,
    margin: 0,
    fontSize: 19,
    lineHeight: '1.4em',
    [mediaQueries.mUp]: {
      fontSize: 21,
    },
    '& + p': {
      margin: `16px 0 0 0`,
    },
    '& > a': {
      color: 'inherit',
      textDecoration: 'underline',
    },
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
