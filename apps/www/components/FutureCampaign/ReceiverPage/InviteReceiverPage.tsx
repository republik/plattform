import { css } from 'glamor'
import { useRouter } from 'next/router'
import { useState } from 'react'
import AssetImage from '../../../lib/images/AssetImage'
import Frame from '../../Frame'
import Stepper, { Step, StepProps } from '../../Stepper/Stepper'
import IntroductoryStep from './steps/IntroductionaryStep'
import SelectYourPriceStep from './steps/SelectYourPriceStep'

enum STEPS {
  INTRO = 'INTRO',
  PRICE_SELECTOR = 'PRICE_SELECTOR',
}

const InviteReceiverPage = () => {
  const router = useRouter()
  // TODO: if user is logged in and has abo, show info text that the user already has an abo
  // TODO: if user has monthly abo, also show info text that not available if already subscirbed

  // TODO: if not logged in or probelesen show stepper

  const handleComplete = () => {
    // TODO
    // based on the selected price either choose the
    // package that is associated with non coop membership.
    // else choose the package that is associated with coop membership
    // additionally attach ?utm_campaign received from the server based on the invite-code
    const res = confirm('Zum checkout')
    if (res) {
      router.push({
        pathname: '/angebote',
        query: {
          package: 'ABO',
          utm_campaign: 'TODO_5-jahre-republik',
        },
      })
    }
  }

  const steps: Step[] = [
    {
      name: STEPS.INTRO,
      content: (stepProps) => <IntroductoryStep {...stepProps} />,
    },
    {
      name: STEPS.PRICE_SELECTOR,
      content: (stepProps) => (
        <SelectYourPriceStep
          {...stepProps}
          initialPrice={240}
          onSubmit={() => alert('YOUR PRICE')}
        />
      ),
    },
  ]

  return (
    <Frame pageColorSchemeKey='dark'>
      <Stepper
        steps={steps}
        onComplete={handleComplete}
        customStepperUIPlacement
        contentWrapperElement={({ children }) => (
          <div {...styles.wrapper}>{children}</div>
        )}
      />
    </Frame>
  )
}

export default InviteReceiverPage

const styles = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    height: 850,
  }),
}
