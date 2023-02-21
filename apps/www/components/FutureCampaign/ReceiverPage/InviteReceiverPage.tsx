import { fontStyles, mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useMe } from '../../../lib/context/MeContext'
import Stepper, { Step } from '../../Stepper/Stepper'
import { useInviteSenderProfileQuery } from '../graphql/useSenderProfileQuery'
import { FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES } from '../SenderPage/InviteSenderPage'
import Button from './steps/Button'
import IntroductoryStep, { SenderProfile } from './steps/IntroductionaryStep'
import SelectYourPriceStep from './steps/SelectYourPriceStep'

enum STEPS {
  INTRO = 'INTRO',
  PRICE_SELECTOR = 'PRICE_SELECTOR',
}

export type InviteReceiverPageProps = {
  // If the sender could not be loaded, the link is invalid
  invalidInviteCode?: boolean
}

const InviteReceiverPage = ({ invalidInviteCode }: InviteReceiverPageProps) => {
  const router = useRouter()
  const { me, meLoading } = useMe()

  const hasMonthlySubscription =
    me?.activeMembership?.type?.name === 'MONTHLY_ABO'
  const hasYearlySubscription = [
    'ABO',
    'YEARLY_ABO',
    'BENEFACTOR_ABO',
  ].includes(me?.activeMembership?.type?.name)
  const isEligible = !hasYearlySubscription

  const inviteCode = Array.isArray(router.query?.code)
    ? router.query.code[0]
    : router.query?.code

  const { data: senderProfileData } = useInviteSenderProfileQuery({
    variables: {
      accessToken: inviteCode,
    },
    skip: !inviteCode || meLoading,
  })

  const handleSubmitPrice = useCallback(
    async (price) => {
      if (price >= 1000) {
        return router.push({
          pathname: '/angebote',
          query: {
            package: 'BENEFACTOR',
            price: price * 100, // price in Rp.

            utm_campaign: 'mitstreiter',
            utm_medium: 'website',
            utm_source: 'republik',
            utm_content: senderProfileData?.sender?.id,
          },
        })
      } else if (price >= 240) {
        return router.push({
          pathname: '/angebote',
          query: {
            package: 'ABO',
            price: price * 100, // price in Rp.

            utm_campaign: 'mitstreiter',
            utm_medium: 'website',
            utm_source: 'republik',
            utm_content: senderProfileData?.sender?.id,
          },
        })
      } else {
        return router.push({
          pathname: '/angebote',
          query: {
            package: 'YEARLY_ABO',
            userPrice: 1,
            price: price * 100, // price in Rp.

            utm_campaign: 'mitstreiter',
            utm_medium: 'website',
            utm_source: 'republik',
            utm_content: senderProfileData?.sender?.id,
          },
        })
      }
    },
    [senderProfileData],
  )

  const steps: Step[] = [
    {
      name: STEPS.INTRO,
      content: (stepProps) => (
        <IntroductoryStep
          hasMonthlySubscription={hasMonthlySubscription}
          senderProfile={senderProfileData?.sender}
          {...stepProps}
        />
      ),
    },
    {
      name: STEPS.PRICE_SELECTOR,
      content: (stepProps) => (
        <SelectYourPriceStep onSubmit={handleSubmitPrice} {...stepProps} />
      ),
    },
  ]

  return (
    <>
      {invalidInviteCode && (
        <div>
          <p {...styles.text}>
            Ein aufmerksamer Mensch aus der Republik-Community möchte Ihnen ein
            Mitstreiterinnen-Abo ermöglichen: 12 Monate Republik zu einem Preis,
            der für Sie stimmt. Herzlichen Glückwunsch!
          </p>
          <p {...styles.text}>Einzig: Dieser Link hier ist ungültig.</p>
          <p {...styles.text}>
            Haken Sie bei der Person nach und lassen Sie sich den korrekten Link
            geben.
          </p>
          <p {...styles.text}>
            PS: Sollte die Person nicht erreichbar sein, dann melden Sie sich
            gerne direkt unter kontakt@republik.ch.
          </p>
        </div>
      )}
      {hasYearlySubscription && (
        <div {...styles.hasYearlySubscription}>
          <h1 {...styles.heading}>
            Journalismus hat eine Zukunft – mit Ihnen.
          </h1>
          <p {...styles.text}>Sie sind bereits an Bord. Gratulation!</p>
          <p {...styles.text}>
            Aber wie sieht es mit Ihrem Nachbarn, Ihrem alten Schulfreund und
            Ihrer Tante aus?
          </p>
          <p {...styles.text} style={{ marginBottom: 32 }}>
            Die Republik ist nur so stark, wie ihre Community.
          </p>
          <Button href='/verstaerkung-holen'>Jetzt Verstärkung holen</Button>
        </div>
      )}
      {!invalidInviteCode &&
        isEligible &&
        senderProfileData?.sender?.futureCampaignAboCount <
          FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES && (
          <Stepper
            steps={steps}
            customStepperUIPlacement
            contentWrapperElement={({ children, ref }) => (
              <div {...styles.wrapper} ref={ref}>
                {children}
              </div>
            )}
          />
        )}
      {!invalidInviteCode &&
        isEligible &&
        senderProfileData?.sender?.futureCampaignAboCount >=
          FUTURE_CAMPAIGN_MAX_REDEEMED_INVITES && (
          <div {...styles.hasYearlySubscription}>
            <SenderProfile
              text={`${
                senderProfileData.sender.firstName +
                ' ' +
                senderProfileData.sender.lastName
              } wollte Ihnen ein Mitstreiterinnen-Abo ermöglichen.`}
              portrait={senderProfileData?.sender?.portrait}
            />
            <p {...styles.text} style={{ marginTop: 16 }}>
              Damit würden Sie die Republik ein Jahr lang zu einem selbst
              gewählten Preis erhalten.
            </p>
            <p {...styles.text}>
              Es wurden aber schon alle Einladungen von diesem Link eingelöst.
            </p>
            <p {...styles.text}>
              Vielleicht kennen Sie eine andere Republik-Verlegerin, die Sie
              einladen kann?
            </p>
            <p {...styles.text} style={{ marginBottom: 32 }}>
              Mit einem Probeabo können Sie die Republik ab sofort und{' '}
              <Link href='/probelesen' passHref>
                <a {...styles.inlineLink}>
                  kostenlos für 3 Wochen kennenlernen
                </a>
              </Link>
              .
            </p>
          </div>
        )}
    </>
  )
}

export default InviteReceiverPage

const styles = {
  wrapper: css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  }),
  hasYearlySubscription: css({
    display: 'flex',
    flexDirection: 'column',
    marginTop: 48,
    marginBottom: 16,
  }),
  heading: css({
    ...fontStyles.serifTitle,
    margin: 0,
    fontSize: 24,
    lineHeight: 1.3,
    [mediaQueries.mUp]: {
      fontSize: 36,
    },
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
  }),
  inlineLink: css({
    color: 'inherit',
    textDecoration: 'underline',
  }),
}
