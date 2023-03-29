import { fontStyles, mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useMe } from '../../../lib/context/MeContext'
import Stepper, { Step } from '../../Stepper/Stepper'
import Button from './steps/Button'
import IntroductoryStep from './steps/IntroductionaryStep'
import SelectYourPriceStep from './steps/SelectYourPriceStep'

enum STEPS {
  INTRO = 'INTRO',
  PRICE_SELECTOR = 'PRICE_SELECTOR',
}

const InviteReceiverPage = () => {
  const router = useRouter()
  const { me } = useMe()

  const hasYearlySubscription = [
    'ABO',
    'YEARLY_ABO',
    'BENEFACTOR_ABO',
  ].includes(me?.activeMembership?.type?.name)
  const isEligible = !hasYearlySubscription

  const handleSubmitPrice = useCallback(async (price) => {
    if (price >= 1000) {
      return router.push({
        pathname: '/angebote',
        query: {
          package: 'BENEFACTOR',
          price: price * 100, // price in Rp.

          utm_campaign: 'mitstreiter2',
          utm_medium: 'website',
          utm_source: 'republik',
        },
      })
    } else if (price >= 240) {
      return router.push({
        pathname: '/angebote',
        query: {
          package: 'ABO',
          price: price * 100, // price in Rp.

          utm_campaign: 'mitstreiter2',
          utm_medium: 'website',
          utm_source: 'republik',
        },
      })
    } else {
      return router.push({
        pathname: '/angebote',
        query: {
          package: 'YEARLY_ABO',
          userPrice: 1,
          price: price * 100, // price in Rp.

          utm_campaign: 'mitstreiter2',
          utm_medium: 'website',
          utm_source: 'republik',
        },
      })
    }
  }, [])

  const steps: Step[] = [
    {
      name: STEPS.INTRO,
      content: (stepProps) => <IntroductoryStep {...stepProps} />,
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
      {isEligible && (
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
