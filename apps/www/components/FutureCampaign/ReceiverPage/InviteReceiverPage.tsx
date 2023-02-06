import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import {
  fontStyles,
  mediaQueries,
  plainLinkRule,
  useColorContext,
} from '@project-r/styleguide'
import { PUBLIC_BASE_URL } from '../../../lib/constants'
import { useMe } from '../../../lib/context/MeContext'
import Frame from '../../Frame'
import Stepper, { Step } from '../../Stepper/Stepper'
import { FUTURE_CAMPAIGN_SHARE_IMAGE_URL } from '../constants'
import { useInviteSenderProfileQuery } from '../graphql/useSenderProfileQuery'
import IntroductoryStep from './steps/IntroductionaryStep'
import SelectYourPriceStep from './steps/SelectYourPriceStep'
import AssetImage from '../../../lib/images/AssetImage'

import CombiLogo from '../../../public/static/5-jahre-republik/logo/combo-logo_white.svg'
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
  const hasYearlySubscription = me?.activeMembership?.type?.name === 'ABO'
  const isEligible = !hasYearlySubscription

  const inviteCode = Array.isArray(router.query?.code)
    ? router.query.code[0]
    : router.query?.code
  const inviteCodeHasUserSlug = inviteCode?.startsWith('~')

  const { data: senderProfileData } = useInviteSenderProfileQuery({
    variables: {
      accessToken: !inviteCodeHasUserSlug ? inviteCode : undefined,
      slug: inviteCodeHasUserSlug ? inviteCode.substring(1) : undefined,
    },
    skip: !inviteCode || meLoading,
  })

  // TODO: if user is logged in and has abo, show info text that the user already has an abo
  // TODO: if user has monthly abo, also show info text that not available if already subscirbed

  // TODO: if not logged in or probelesen show stepper

  const handleSubmitPrice = useCallback(
    async (price) => {
      // setPrice(price)
      // TODO
      // based on the selected price either choose the
      // package that is associated with non coop membership.
      // else choose the package that is associated with coop membership
      // additionally attach ?utm_campaign received from the server based on the invite-code
      if (price >= 1000) {
        return router.push({
          pathname: '/angebote',
          query: {
            package: 'BENEFACTOR',
            price: price * 100, // price in Rp.

            utm_campaign: 'mitstreiter',
            utm_medium: 'website',
            utm_source: 'meta',
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
            utm_source: 'meta',
            utm_content: senderProfileData?.sender?.id,
          },
        })
      } else {
        return router.push({
          pathname: '/angebote',
          query: {
            package: 'YEARLY_ABO',
            price: price * 100, // price in Rp.
            reason: 'Mitstreiter Abo',

            utm_campaign: 'mitstreiter',
            utm_medium: 'website',
            utm_source: 'meta',
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
      {invalidInviteCode && <p>Invalid invite code</p>}
      {hasYearlySubscription && (
        <div {...styles.hasYearlySubscription}>
          <p>
            Sie sind bereits an Bord. Gratulation! Aber wie sieht es mit Ihrem
            Nachbarn, Ihrem alten Schulfreund und Ihrer Tante aus?
          </p>
          <p>
            Die Republik ist nur so stark, wie ihre Community:{' '}
            <Link href='/verstaerkung-holen' passHref>
              <a {...plainLinkRule}>Jetzt Verstärkung holen</a>
            </Link>
            !
          </p>
        </div>
      )}
      {!invalidInviteCode && isEligible && (
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
    gap: 16,
    marginBottom: 16,
    '& p': css({
      ...fontStyles.sansSerifRegular,
      margin: 0,
      fontSize: 17,
      lineHeight: '1.4em',
      [mediaQueries.mUp]: {
        fontSize: 21,
      },
    }),
    '& a': {
      textDecoration: 'underline',
    },
  }),
}
